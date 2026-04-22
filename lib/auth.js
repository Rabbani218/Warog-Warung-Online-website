import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hasDatabaseUrl } from "@/lib/runtimeEnv";

// ─── Helpers ──────────────────────────────────────────────────────────

function slugify(value) {
  return String(value || "wareb")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function createStoreIfMissing(ownerId, storeName, slugSeed, options = {}) {
  if (!hasDatabaseUrl()) return null;

  const existingOwnedStore = await prisma.store.findFirst({ where: { ownerId } });
  if (existingOwnedStore) return existingOwnedStore;

  const baseSlug = slugify(slugSeed || storeName) || "wareb";

  for (let i = 0; i < 20; i++) {
    const slug = i === 0 ? baseSlug : `${baseSlug}-${i + 1}`;
    try {
      return await prisma.store.create({
        data: {
          ownerId,
          name: storeName,
          slug,
          description: options.description,
          heroTitle: options.heroTitle,
          heroSubtitle: options.heroSubtitle,
        },
      });
    } catch (error) {
      if (error?.code !== "P2002") throw error;
    }
  }

  throw new Error("Tidak bisa menyiapkan store default karena konflik slug.");
}

// ─── Providers ────────────────────────────────────────────────────────

const authProviders = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  authProviders.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

authProviders.push(
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      // ── Validate input ──────────────────────────────────────────
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email dan password wajib diisi.");
      }

      if (!hasDatabaseUrl()) {
        throw new Error("Database tidak tersedia. Hubungi administrator.");
      }

      // ── Find user ───────────────────────────────────────────────
      const user = await prisma.user.findUnique({
        where: { email: String(credentials.email).trim().toLowerCase() },
      });

      if (!user) {
        throw new Error("Email tidak ditemukan. Silakan daftar terlebih dahulu.");
      }

      // ── Validate password ───────────────────────────────────────
      // Check for null/empty OR legacy oauth- prefix from old custom adapter
      if (!user.passwordHash || user.passwordHash.startsWith("oauth-")) {
        throw new Error(
          "Akun ini terdaftar via Google. Gunakan tombol 'Login dengan Google'."
        );
      }

      let isPasswordValid = false;
      try {
        isPasswordValid = await compare(credentials.password, user.passwordHash);
      } catch (bcryptError) {
        console.error("[Auth] bcrypt compare error:", bcryptError);
        throw new Error("Password tidak valid. Silakan coba lagi.");
      }

      if (!isPasswordValid) {
        throw new Error("Password salah. Silakan coba lagi.");
      }

      // ── Return user object (injected into JWT) ──────────────────
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        address: user.address,
        hobbies: user.hobbies,
        favoriteFood: user.favoriteFood,
      };
    },
  })
);

// ─── NextAuth Configuration ───────────────────────────────────────────

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: authProviders,
  pages: {
    signIn: "/admin",
    error: "/admin",
  },
  callbacks: {
    // ── JWT Callback ────────────────────────────────────────────────
    // Runs on EVERY request that needs a token.
    // `user` is only present on the FIRST call after sign-in.
    async jwt({ token, user, account, trigger, session }) {
      if (!hasDatabaseUrl()) return token;

      // ▸ Initial sign-in
      if (user) {
        token.id = user.id;
        token.avatar = user.avatar || null;
        token.bio = user.bio || null;
        token.address = user.address || null;
        token.hobbies = user.hobbies || null;
        token.favoriteFood = user.favoriteFood || null;

        // CRITICAL: Always read the LATEST role from the database.
        // For OAuth, the signIn callback runs BEFORE jwt and may have
        // already updated the user's role in the DB. We re-read to
        // capture that update.
        try {
          const freshUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
              role: true,
              avatar: true,
              bio: true,
              address: true,
              hobbies: true,
              favoriteFood: true,
            },
          });

          if (freshUser) {
            token.role = freshUser.role || "CLIENT";
            token.avatar = freshUser.avatar || token.avatar;
            token.bio = freshUser.bio || token.bio;
            token.address = freshUser.address || token.address;
            token.hobbies = freshUser.hobbies || token.hobbies;
            token.favoriteFood = freshUser.favoriteFood || token.favoriteFood;
          } else {
            token.role = user.role || "CLIENT";
          }
        } catch (err) {
          console.error("[JWT] DB role lookup failed:", err);
          token.role = user.role || "CLIENT";
        }
      }

      // ▸ Safety net: if token exists but role is somehow empty
      if (!token.role && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: {
              id: true,
              role: true,
              avatar: true,
              bio: true,
              address: true,
              hobbies: true,
              favoriteFood: true,
            },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser.id;
            token.avatar = dbUser.avatar;
            token.bio = dbUser.bio;
            token.address = dbUser.address;
            token.hobbies = dbUser.hobbies;
            token.favoriteFood = dbUser.favoriteFood;
          }
        } catch (err) {
          console.error("[JWT] Fallback role lookup error:", err);
        }
      }

      // ▸ Lazy-load storeId (cached in token once found)
      if (!token.storeId && (token.sub || token.id)) {
        try {
          const store = await prisma.store.findFirst({
            where: { ownerId: token.sub || token.id },
            select: { id: true },
          });
          if (store) token.storeId = store.id;
        } catch (err) {
          console.error("[JWT] Store lookup failed:", err);
        }
      }

      // ▸ Handle client-side session updates (useSession().update())
      if (trigger === "update" && session) {
        if (session.storeId !== undefined) token.storeId = session.storeId;
        if (session.avatar !== undefined) token.avatar = session.avatar;
        if (session.name !== undefined) token.name = session.name;
        if (session.bio !== undefined) token.bio = session.bio;
        if (session.address !== undefined) token.address = session.address;
        if (session.hobbies !== undefined) token.hobbies = session.hobbies;
        if (session.favoriteFood !== undefined)
          token.favoriteFood = session.favoriteFood;
      }

      return token;
    },

    // ── Session Callback ────────────────────────────────────────────
    // Maps JWT token properties → client-accessible session.user
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token?.sub || token?.id;
        session.user.role = token?.role || "USER";
        session.user.storeId = token?.storeId || null;
        session.user.avatar = token?.avatar || null;
        session.user.bio = token?.bio || null;
        session.user.address = token?.address || null;
        session.user.hobbies = token?.hobbies || null;
        session.user.favoriteFood = token?.favoriteFood || null;
      }
      return session;
    },

    // ── SignIn Callback ─────────────────────────────────────────────
    // Runs BEFORE jwt callback. Used to bootstrap Google users.
    async signIn({ user, account }) {
      if (!hasDatabaseUrl()) return false;

      // Google OAuth: promote to ADMIN + auto-create store
      if (account?.provider === "google" && user?.id) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
          });

          const existingStore = await prisma.store.findFirst({
            where: { ownerId: user.id },
          });

          if (!existingStore) {
            await createStoreIfMissing(
              user.id,
              "Warteg Modern Wareb",
              "wareb-google-store",
              {
                description: "Toko otomatis dibuat saat login Google.",
                heroTitle: "Warteg Modern dengan Login Google",
                heroSubtitle:
                  "Pengalaman pemesanan cepat untuk pelanggan Anda.",
              }
            );
          }
        } catch (error) {
          console.error("[SignIn] Google bootstrap failed:", error);
          // Don't block sign-in even if bootstrap fails
        }
      }

      return true;
    },
  },

  // ── Events ──────────────────────────────────────────────────────────
  events: {
    async createUser({ user }) {
      try {
        const existingStore = await prisma.store.findFirst();

        if (!existingStore) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
          });

          await createStoreIfMissing(
            user.id,
            "Warteg Modern Wareb",
            "wareb-modern",
            {
              heroTitle: "Selamat datang di Wareb",
              heroSubtitle:
                "Kasir digital dan e-commerce siap pakai untuk warteg Anda.",
            }
          );
        }
      } catch (error) {
        console.error("[Events] createUser bootstrap failed:", error);
      }
    },
  },
};

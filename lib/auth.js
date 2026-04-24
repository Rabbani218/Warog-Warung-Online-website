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
      const invalidCredentialsError = "Email atau kata sandi salah";
      const authServiceUnavailableError = "Layanan autentikasi sedang tidak tersedia";

      // ── Validate input ──────────────────────────────────────────
      const normalizedEmail = String(credentials?.email || "").trim().toLowerCase();
      const plainPassword = String(credentials?.password || "");

      if (!normalizedEmail || !plainPassword) {
        throw new Error(invalidCredentialsError);
      }

      if (!hasDatabaseUrl()) {
        throw new Error("Database tidak tersedia. Hubungi administrator.");
      }

      // ── Find user ───────────────────────────────────────────────
      let user = null;
      try {
        user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
      } catch (dbError) {
        console.error("[Auth] user lookup failed:", dbError);
        throw new Error(authServiceUnavailableError);
      }

      if (!user) {
        throw new Error(invalidCredentialsError);
      }

      // ── Validate password ───────────────────────────────────────
      // Check for null/empty OR legacy oauth- prefix from old custom adapter
      if (!user.passwordHash || user.passwordHash.startsWith("oauth-")) {
        throw new Error(invalidCredentialsError);
      }

      let isPasswordValid = false;
      try {
        isPasswordValid = await compare(plainPassword, user.passwordHash);
      } catch (bcryptError) {
        console.error("[Auth] bcrypt compare error:", bcryptError);
        throw new Error(invalidCredentialsError);
      }

      if (!isPasswordValid) {
        console.warn(`[Auth] Password mismatch for user: ${normalizedEmail}`);
        throw new Error(invalidCredentialsError);
      }

      console.log(`[Auth] Successful login for user: ${normalizedEmail} (Role: ${user.role})`);

      // ── Find storeId if user is ADMIN ──────────────────────────
      let storeId = null;
      if (user.role === "ADMIN") {
        try {
          const store = await prisma.store.findFirst({
            where: { ownerId: user.id },
            select: { id: true },
          });
          storeId = store?.id || null;
        } catch (dbError) {
          console.error("[Auth] store lookup failed:", dbError);
          throw new Error(authServiceUnavailableError);
        }
      }

      // ── Return user object (injected into JWT) ──────────────────
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: storeId,
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
const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_dev_only",
  session: { strategy: "jwt" },
  providers: authProviders,
  pages: {
    signIn: "/admin",
    error: "/admin",
    newUser: "/setup",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // ▸ Initial sign-in: transfer user data to token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.storeId = user.storeId;
        token.avatar = user.avatar;

        // FORCE REFRESH: If role is CLIENT or missing, fetch from DB to be absolutely sure.
        // This handles cases where signIn callback updates the role (e.g. Google promo).
        if (!token.role || token.role === "CLIENT") {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: { role: true }
            });
            if (dbUser) {
              token.role = dbUser.role;
            }
          } catch (err) {
            console.error("[Auth JWT] Error fetching role on sign-in:", err);
          }
        }

        // FORCE REFRESH: Fetch storeId if user is ADMIN and storeId is missing
        if (token.role === "ADMIN" && !token.storeId) {
          try {
            const store = await prisma.store.findFirst({
              where: { ownerId: user.id },
              select: { id: true }
            });
            if (store) token.storeId = store.id;
          } catch (err) {
            console.error("[Auth JWT] Error fetching storeId on sign-in:", err);
          }
        }
      }

      // ▸ HARDEING: For subsequent requests, only fetch if critical data is missing
      // We only do this if role is missing (very rare) or if it's an ADMIN without a storeId
      // (to support the setup flow where storeId is created later).
      if (token?.id && (!token.role || (token.role === "ADMIN" && !token.storeId))) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: { role: true }
          });
          if (dbUser) {
            token.role = dbUser.role;
            
            // Only search for store if they are now an ADMIN
            if (token.role === "ADMIN" && !token.storeId) {
              const store = await prisma.store.findFirst({
                where: { ownerId: token.id },
                select: { id: true }
              });
              if (store) token.storeId = store.id;
            }
          }
        } catch (e) {
          console.error("[Auth JWT] Periodic hardening failed:", e.message);
        }
      }

      // ▸ Handle client-side session updates (useSession().update())
      if (trigger === "update" && session) {
        if (session.storeId !== undefined) token.storeId = session.storeId;
        if (session.avatar !== undefined) token.avatar = session.avatar;
        if (session.name !== undefined) token.name = session.name;
        if (session.role !== undefined) token.role = session.role;
      }

      return token;
    },



    // ── Session Callback ────────────────────────────────────────────
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.storeId = token.storeId || null;
        session.user.avatar = token.avatar || null;
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

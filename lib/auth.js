import { PrismaAdapter } from "@next-auth/prisma-adapter";
// Antigravity Fixed: Enhanced JWT/Session with bio, address, etc.
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { hasDatabaseUrl } from "@/lib/runtimeEnv";

function slugify(value) {
  return String(value || "wareb").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function createStoreIfMissing(ownerId, storeName, slugSeed, options = {}) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const existingOwnedStore = await prisma.store.findFirst({ where: { ownerId } });

  if (existingOwnedStore) {
    return existingOwnedStore;
  }

  const baseSlug = slugify(slugSeed || storeName) || "wareb";

  for (let index = 0; index < 20; index += 1) {
    const suffix = index === 0 ? "" : `-${index + 1}`;
    const slug = `${baseSlug}${suffix}`;

    try {
      return await prisma.store.create({
        data: {
          ownerId,
          name: storeName,
          slug,
          description: options.description,
          heroTitle: options.heroTitle,
          heroSubtitle: options.heroSubtitle
        }
      });
    } catch (error) {
      if (error?.code !== "P2002") {
        throw error;
      }
    }
  }

  throw new Error("Tidak bisa menyiapkan store default karena konflik slug.");
}

const prismaAdapter = PrismaAdapter(prisma);

const authAdapter = {
  ...prismaAdapter,
  async createUser(data) {
    return prisma.user.create({
      data: {
        name: data?.name || data?.email || "OAuth User",
        email: data.email,
        passwordHash: `oauth-${randomUUID()}`,
        role: "CLIENT"
      }
    });
  },
  async updateUser(data) {
    const payload = {};

    if (typeof data?.name === "string") {
      payload.name = data.name;
    }

    if (typeof data?.email === "string") {
      payload.email = data.email;
    }

    if (Object.keys(payload).length === 0) {
      return prisma.user.findUnique({ where: { id: data.id } });
    }

    return prisma.user.update({
      where: { id: data.id },
      data: payload
    });
  }
};

const authProviders = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  authProviders.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true
    })
  );
}

authProviders.push(
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      if (!hasDatabaseUrl()) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email }
      });

      if (!user) {
        return null;
      }

      if (!user.passwordHash) {
        return null;
      }

      const valid = await compare(credentials.password, user.passwordHash);

      if (!valid) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        address: user.address,
        hobbies: user.hobbies,
        favoriteFood: user.favoriteFood
      };
    }
  })
);

export const authOptions = {
  adapter: authAdapter,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: authProviders,
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (!hasDatabaseUrl()) return token;

      // On initial sign in
      if (user) {
        token.role = user.role || "CLIENT";
        token.id = user.id;
        token.avatar = user.avatar;
        token.bio = user.bio;
        token.address = user.address;
        token.hobbies = user.hobbies;
        token.favoriteFood = user.favoriteFood;
      }

      // Handle Google specific bootstrap on first sign in
      if (account?.provider === "google" && token.email && !token.role) {
        try {
          const googleUser = await prisma.user.findUnique({ where: { email: token.email } });
          if (googleUser) {
            token.role = googleUser.role;
            token.id = googleUser.id;
            token.avatar = googleUser.avatar;
            token.bio = googleUser.bio;
            token.address = googleUser.address;
            token.hobbies = googleUser.hobbies;
            token.favoriteFood = googleUser.favoriteFood;
          }
        } catch (err) {
          console.error("JWT Google lookup error:", err);
        }
      }

      // Inject storeId securely (cached in token)
      if (!token.storeId && (token.sub || token.id)) {
        try {
          const ownerId = token.sub || token.id;
          const store = await prisma.store.findFirst({
            where: { ownerId },
            select: { id: true }
          });
          if (store) token.storeId = store.id;
        } catch (error) {
          console.error("JWT store lookup failed:", error);
        }
      }

      // Handle manual updates
      if (trigger === "update" && session) {
        if (session.storeId !== undefined) token.storeId = session.storeId;
        if (session.avatar !== undefined) token.avatar = session.avatar;
        if (session.name !== undefined) token.name = session.name;
        if (session.bio !== undefined) token.bio = session.bio;
        if (session.address !== undefined) token.address = session.address;
        if (session.hobbies !== undefined) token.hobbies = session.hobbies;
        if (session.favoriteFood !== undefined) token.favoriteFood = session.favoriteFood;
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token?.role || "CLIENT";
        session.user.id = (token?.sub || token?.id);
        session.user.storeId = token?.storeId || null;
        session.user.avatar = token?.avatar || null;
        session.user.bio = token?.bio || null;
        session.user.address = token?.address || null;
        session.user.hobbies = token?.hobbies || null;
        session.user.favoriteFood = token?.favoriteFood || null;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (!hasDatabaseUrl()) {
        return false;
      }

      if (account?.provider === "google") {
        try {
          if (user?.id) {
            await prisma.user.update({
              where: { id: user.id },
              data: { role: "ADMIN" }
            });
          }

          const existingStore = await prisma.store.findFirst();

          if (!existingStore) {
            await createStoreIfMissing(user.id, "Warteg Modern Wareb", "wareb-google-store", {
              description: "Toko otomatis dibuat saat login Google.",
              heroTitle: "Warteg Modern dengan Login Google",
              heroSubtitle: "Pengalaman pemesanan cepat untuk pelanggan Anda."
            });
          }
        } catch (error) {
          console.error("Google signIn bootstrap failed:", error);
        }
      }
      return true;
    }
  },
  events: {
    async createUser({ user }) {
      try {
        const existingStore = await prisma.store.findFirst();

        if (!existingStore) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" }
          });

          await createStoreIfMissing(user.id, "Warteg Modern Wareb", "wareb-modern", {
            heroTitle: "Selamat datang di Wareb",
            heroSubtitle: "Kasir digital dan e-commerce siap pakai untuk warteg Anda."
          });
        }
      } catch (error) {
        console.error("createUser bootstrap failed:", error);
      }
    }
  }
};

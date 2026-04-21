import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

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
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
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
        role: user.role
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
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }

      if (!token.role && token.email) {
        const existingUser = await prisma.user.findUnique({ where: { email: token.email } });
        token.role = existingUser?.role || "CLIENT";
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.sub;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingStore = await prisma.store.findFirst();

        if (!existingStore) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" }
          });

          await prisma.store.create({
            data: {
              ownerId: user.id,
              name: "Warteg Modern Wareb",
              slug: "wareb-google-store",
              description: "Toko otomatis dibuat saat login Google.",
              heroTitle: "Warteg Modern dengan Login Google",
              heroSubtitle: "Pengalaman pemesanan cepat untuk pelanggan Anda."
            }
          });
        }
      }
      return true;
    }
  },
  events: {
    async createUser({ user }) {
      const existingStore = await prisma.store.findFirst();
      if (!existingStore) {
        await prisma.store.create({
          data: {
            ownerId: user.id,
            name: "Warteg Modern Wareb",
            slug: "wareb-modern",
            heroTitle: "Selamat datang di Wareb",
            heroSubtitle: "Kasir digital dan e-commerce siap pakai untuk warteg Anda."
          }
        });
      }
    }
  },
  pages: {
    signIn: "/admin"
  }
};

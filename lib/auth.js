import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    }),
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
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
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

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() }
        });

        if (!user || user.passwordHash === "none") {
          throw new Error("Aucun compte trouvé avec cet email.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error("Mot de passe incorrect.");
        }

        if (!user.emailVerified) {
          throw new Error("Ton adresse e-mail n'a pas encore été vérifiée. Assure-toi d'avoir cliqué sur le lien reçu !");
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          isMember: user.isMember,
        };
      }
    })
  ],
  events: {
    // Se déclenche UNE SEULE FOIS quand un nouvel utilisateur se connecte pour la première fois
    async createUser({ user }) {
      if (user.email) {
        const email = user.email.toLowerCase();
        // On regarde s'il est dans la salle d'attente
        const isPending = await prisma.pendingMember.findUnique({ where: { email } });

        if (isPending) {
          // On le passe membre !
          await prisma.user.update({
            where: { id: user.id },
            data: { isMember: true }
          });
          // On le retire de la salle d'attente pour faire le ménage
          await prisma.pendingMember.delete({ where: { email } });

          console.log(`Nouvel inscrit pré-approuvé passé membre : ${email}`);
        }
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.isMember = user.isMember;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.isMember = token.isMember;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "bdj-cpe-super-secret-key-2025-fallback!"
};

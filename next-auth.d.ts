import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    // On étend l'objet Session
    interface Session {
        user: {
            isMember: boolean;
        } & DefaultSession["user"];
    }

    // On étend l'objet User (si tu l'utilises)
    interface User {
        isMember: boolean;
    }
}

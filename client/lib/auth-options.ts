import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import "@/utils/db";

export const authOptions = {
    // Configure one or more authentication providers
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: any) {
                try {
                    const user = await User.findOne({
                        email: credentials.email,
                    });
                    if (user) {
                        const isPasswordCorrect = await bcrypt.compare(
                            credentials.password,
                            user.password!
                        );
                        if (isPasswordCorrect) {
                            return {
                                id: user._id.toString(),
                                email: user.email,
                                role: user.role,
                            };
                        }
                    }
                } catch (err: any) {
                    throw new Error(err);
                }
                return null;
            },
        }),
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account }: { user: any; account: any }) {
            if (account?.provider === "credentials") {
                return true;
            }

            // Handle OAuth providers
            if (account?.provider === "google") {
                try {
                    // Check if user exists in database
                    const existingUser = await User.findOne({
                        email: user.email!,
                    });

                    if (!existingUser) {
                        // Create new user for OAuth providers
                        await User.create({
                            email: user.email!,
                            name: user.name?.split(' ')[0] || 'OAuth',
                            lastname: user.name?.split(' ').slice(1).join(' ') || 'User',
                            role: "user",
                            // OAuth users don't have passwords
                            password: null,
                        });
                    }
                    return true;
                } catch (error) {
                    console.error("Error in signIn callback:", error);
                    return false;
                }
            }

            return true;
        },
        async jwt({ token, user }: { token: any; user: any }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.iat = Math.floor(Date.now() / 1000); // Issued at time
            }

            // Check if token is expired (15 minutes)
            // const now = Math.floor(Date.now() / 1000);
            // const tokenAge = now - (token.iat as number);
            // const maxAge = 15 * 60; // 15 minutes

            // if (tokenAge > maxAge) {
            //     // Token expired, return empty object to force re-authentication
            //     return {};
            // }

            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (token) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login', // Redirect to login page on auth errors
    },
    session: {
        strategy: "jwt" as const,
        // maxAge: 15 * 60, // 15 minutes in seconds
        // updateAge: 5 * 60, // Update session every 5 minutes
    },
    jwt: {
        // maxAge: 15 * 60, // 15 minutes in seconds
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
};
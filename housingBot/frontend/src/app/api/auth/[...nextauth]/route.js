import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "Username" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await connectToDatabase();

                // Find user by username
                const user = await User.findOne({ username: credentials.username });
                if (!user) {
                    throw new Error("User not found");
                }

                // Compare entered password with stored hashed password
                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    throw new Error("Invalid password");
                }

                // Return user object
                return {
                    id: user._id.toString(),
                    username: user.username,
                    email: user.email,
                };
            }
        })
    ],
    pages: {
        signIn: "/auth/login",
    },
    secret: process.env.NEXTAUTH_SECRET, // Ensure this is set in .env
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

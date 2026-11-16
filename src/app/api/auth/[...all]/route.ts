import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Handles every /api/auth/* request: sign-in, sign-up, Google callback,
// email verification, password reset, sign-out, session.
export const { GET, POST } = toNextJsHandler(auth);

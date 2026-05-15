// Re-export from src/auth so that middleware.ts can import this file
// while all in-src/ files use the @/auth alias.
export { handlers, auth, signIn, signOut } from "./src/auth";

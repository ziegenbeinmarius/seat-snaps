import { logoutAction } from "@/actions/auth";

export default function LogoutPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-10">
      <h1 className="text-xl font-semibold">Sign out</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        This will clear your session and return you to login.
      </p>
      <form action={logoutAction} className="mt-6">
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}

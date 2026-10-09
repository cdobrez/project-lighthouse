import { logout } from "@/lib/actions/auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="btn-ghost">
        Sign out
      </button>
    </form>
  );
}

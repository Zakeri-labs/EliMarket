/** Domain appended when admin enters username without @ */
export const ADMIN_EMAIL_DOMAIN = "admin.elimarket.local";

export function resolveAdminEmail(usernameOrEmail: string): string {
  const value = usernameOrEmail.trim().toLowerCase();
  if (value.includes("@")) return value;
  return `${value}@${ADMIN_EMAIL_DOMAIN}`;
}

/**
 * Create or reset the admin user in Supabase.
 *
 * Required in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (Dashboard → Settings → API → service_role)
 *   ADMIN_PASSWORD             (password you want for admin login)
 *
 * Run: npm run setup-admin
 */
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "admin@admin.elimarket.local";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const password =
  process.env.ADMIN_PASSWORD?.trim() ||
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD?.trim();

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

if (!url) fail("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
if (!serviceKey) {
  fail(
    "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local\n" +
      "  Supabase Dashboard → Project Settings → API → service_role (secret)",
  );
}
if (serviceKey.startsWith("sb_publishable_")) {
  fail(
    "You pasted the publishable/anon key into SUPABASE_SERVICE_ROLE_KEY.\n" +
      "  Supabase Dashboard → Project Settings → API → service_role (secret).\n" +
      "  That key starts with eyJ... or sb_secret_... — NOT sb_publishable_...",
  );
}
if (!password) {
  fail("Missing ADMIN_PASSWORD in .env.local (the login password to set)");
}
if (password.includes("#") && !process.env.ADMIN_PASSWORD?.includes('"')) {
  console.warn(
    "\n⚠ ADMIN_PASSWORD contains # — wrap it in quotes in .env.local, e.g. ADMIN_PASSWORD=\"pass#word\"\n",
  );
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: list, error: listError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});
if (listError) fail(`Could not list users: ${listError.message}`);

const existing = list.users.find(
  (user) => user.email?.toLowerCase() === ADMIN_EMAIL,
);

let userId;

if (existing) {
  const { data, error } = await supabase.auth.admin.updateUserById(
    existing.id,
    {
      password,
      email_confirm: true,
    },
  );
  if (error) fail(`Could not update admin: ${error.message}`);
  userId = data.user.id;
  console.log("✓ Admin password reset and email confirmed");
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Admin" },
  });
  if (error) fail(`Could not create admin: ${error.message}`);
  userId = data.user.id;
  console.log("✓ Admin user created");
}

const { error: profileError } = await supabase
  .from("profiles")
  .update({ role: "admin", full_name: "Admin" })
  .eq("id", userId);

if (profileError) {
  fail(`Admin auth OK but profile update failed: ${profileError.message}`);
}

console.log("\nAdmin ready:");
console.log(`  Email:    ${ADMIN_EMAIL}`);
console.log(`  Username: admin`);
console.log(`  Login:    /login\n`);

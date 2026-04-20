export function getAdminAllowlist() {
  return (process.env.ADMIN_ALLOWLIST ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowlisted(email) {
  if (!email) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  return getAdminAllowlist().includes(normalizedEmail);
}

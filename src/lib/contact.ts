export function contactEmail() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  return email && email.length > 0 ? email : null;
}

export function whatsappNumber() {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ?? "";
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 10 ? digits : null;
}

export function whatsappHref(message: string) {
  const number = whatsappNumber();
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
}

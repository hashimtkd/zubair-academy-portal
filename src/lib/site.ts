export const SITE = {
  name: "Zubair Online Academy",
  short: "Zubair Academy",
  tagline: "Learn Quran, Arabic and Islamic Studies from Expert Teachers Worldwide",
  email: "info@zubairacademy.com",
  phone: "+92 300 0000000",
  whatsappNumber: "923000000000", // digits only, for wa.me
  address: "Online — Serving students worldwide",
};

export function whatsappLink(message = "Assalamu Alaikum, I'd like to learn more about Zubair Online Academy.") {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

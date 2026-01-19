import { useEffect, useMemo, useState } from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MapPin,
  Mail,
  Phone,
  Clock,
  MessageCircle,
  Send,
} from "lucide-react";
import { useTranslation } from "../context/TranslationContext";
import { api } from "../api/client";

const fallbackFooter = {
  enabled: true,
  fineprint: "© Roots Maghreb. All rights reserved.",
};

export default function Footer({ data }) {
  const { t } = useTranslation();
  const [footer, setFooter] = useState(data || fallbackFooter);
  const [loaded, setLoaded] = useState(Boolean(data));
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState({
    type: "",
    message: "",
  });
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Footer is now static - no API call needed
  useEffect(() => {
    if (data) {
      setFooter(data);
      setLoaded(true);
    } else {
      setFooter(fallbackFooter);
      setLoaded(true);
    }
  }, [data]);

  const navLinks = useMemo(
    () => [
      { label: t("home", "Home"), href: "/" },
      { label: t("gallery", "Gallery"), href: "/gallery" },
      { label: t("periods", "Periods"), href: "/periods" },
      { label: t("sources_and_archives", "Sources & Archives"), href: "/sourcesandarchives" },
    ],
    [t]
  );

  const resourceLinks = useMemo(
    () => [
      { label: t("sources_and_archives", "Sources & Archives"), href: "/sourcesandarchives" },
      { label: t("gallery", "Gallery"), href: "/gallery" },
      { label: t("periods", "Periods Timeline"), href: "/periods" },
    ],
    [t]
  );

  const socialLinks = useMemo(
    () => [
      { Icon: Facebook, href: "https://facebook.com" },
      { Icon: Twitter, href: "https://twitter.com" },
      { Icon: Instagram, href: "https://instagram.com" },
      { Icon: Youtube, href: "https://youtube.com" },
    ],
    []
  );

  const handleNewsletterSubmit = async (event) => {
    event.preventDefault();
    const email = newsletterEmail.trim();
    if (!email) {
      setNewsletterStatus({
        type: "error",
        message: t("newsletter_email_required", "Email is required."),
      });
      return;
    }

    try {
      setNewsletterLoading(true);
      setNewsletterStatus({ type: "", message: "" });
      await api.post("/newsletter", { email });
      setNewsletterEmail("");
      setNewsletterStatus({
        type: "success",
        message: t(
          "newsletter_success",
          "Thanks! We will reach out to you soon."
        ),
      });
    } catch (err) {
      setNewsletterStatus({
        type: "error",
        message:
          err.response?.data?.message ||
          t("newsletter_failed", "Failed to subscribe."),
      });
    } finally {
      setNewsletterLoading(false);
    }
  };

  if (!loaded || footer?.enabled === false) return null;

  return (
    <footer className="heritage-footer bg-gradient-to-b from-[#3e2723] to-[#2c1810] text-white border-t-4 border-[#d4af37]">
      <div className="heritage-footer-grid container mx-auto px-6 py-12">
        <div className="heritage-footer-column">
          <div className="heritage-logo text-2xl font-bold mb-4">
            roots
            <span className="text-[#d4af37]">maghreb</span>
          </div>
          <p className="text-[#e8dfca]/80 mb-6 leading-relaxed">
            {footer.brandTagline ||
              t(
                "footer_desc",
                "La référence pour préserver l'histoire familiale du Maghreb."
              )}
          </p>
          <div className="heritage-social-links flex gap-4">
            {socialLinks.map(({ Icon, href }) => (
              <a 
                key={href} 
                href={href} 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#d4af37]/20 flex items-center justify-center transition-all hover:scale-110"
              >
                <Icon size={18} className="text-[#d4af37]" />
              </a>
            ))}
          </div>
        </div>

        <div className="heritage-footer-column">
          <h3 className="text-lg font-bold mb-4 text-[#d4af37]">{t("links", "Liens rapides")}</h3>
          <ul className="heritage-footer-links space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a 
                  href={link.href}
                  className="text-[#e8dfca]/80 hover:text-[#d4af37] transition-colors inline-block"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="heritage-footer-column">
          <h3 className="text-lg font-bold mb-4 text-[#d4af37]">{t("resources", "Ressources")}</h3>
          <ul className="heritage-footer-links space-y-2">
            {resourceLinks.map((link) => (
              <li key={link.href}>
                <a 
                  href={link.href}
                  className="text-[#e8dfca]/80 hover:text-[#d4af37] transition-colors inline-block"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="heritage-footer-column">
          <h3 className="text-lg font-bold mb-4 text-[#d4af37]">{t("contact", "Contact")}</h3>
          <ul className="heritage-footer-links space-y-3">
            <li className="flex items-center gap-2 text-[#e8dfca]/80">
              <MapPin size={16} className="text-[#d4af37]" />
              <span>Location opening soon</span>
            </li>
            <li className="flex items-center gap-2 text-[#e8dfca]/80">
              <Mail size={16} className="text-[#d4af37]" />
              <a href="mailto:contact@rootsmaghreb.com" className="hover:text-[#d4af37] transition-colors">
                contact@rootsmaghreb.com
              </a>
            </li>
            <li className="flex items-center gap-2 text-[#e8dfca]/80">
              <Phone size={16} className="text-[#d4af37]" />
              <a href="tel:+9613626082" className="hover:text-[#d4af37] transition-colors">
                +961 36 26 082
              </a>
            </li>
            <li className="flex items-center gap-2 text-[#e8dfca]/80">
              <MessageCircle size={16} className="text-[#d4af37]" />
              <span>WhatsApp: +961 36 26 082</span>
            </li>
            <li className="flex items-center gap-2 text-[#e8dfca]/80">
              <Clock size={16} className="text-[#d4af37]" />
              <span>Lun-Ven: 9h-17h</span>
            </li>
          </ul>
          <form className="mt-6 space-y-4" onSubmit={handleNewsletterSubmit}>
            <p className="text-sm uppercase tracking-[0.3em] text-[#d4af37] font-semibold">
              {t("newsletter", "Newsletter")}
            </p>
            <p className="text-sm text-[#e8dfca]/80">
              {t(
                "newsletter_prompt",
                "Leave your email and we will reach out to you."
              )}
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(event) => {
                  setNewsletterEmail(event.target.value);
                  if (newsletterStatus.message) {
                    setNewsletterStatus({ type: "", message: "" });
                  }
                }}
                placeholder={t("email", "Email")}
                className="heritage-input flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                aria-label={t("email", "Email")}
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#d4af37] text-[#3e2723] font-semibold hover:bg-[#d4af37]/90 transition-all disabled:opacity-60 flex items-center gap-2"
                disabled={newsletterLoading}
              >
                <Send size={16} />
                {newsletterLoading
                  ? t("subscribing", "Subscribing...")
                  : t("subscribe", "Subscribe")}
              </button>
            </div>
            {newsletterStatus.message ? (
              <p
                className={`text-sm font-medium ${
                  newsletterStatus.type === "success"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {newsletterStatus.message}
              </p>
            ) : null}
          </form>
        </div>
      </div>
      <div className="heritage-footer-meta border-t border-white/10 bg-[#1a0f0a] py-4 text-center text-sm text-[#e8dfca]/60">
        {footer.fineprint || "© Roots Maghreb. Tous droits réservés."}
      </div>
    </footer>
  );
}


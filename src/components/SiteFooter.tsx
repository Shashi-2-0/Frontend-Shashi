"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  Globe2,
  Loader2,
  MessageCircle,
  Music2,
  X,
} from "lucide-react";

import {
  FooterColumn,
  FooterData,
  FooterLink,
  FooterSocialLink,
  getSiteFooter,
} from "@/lib/api/footer.api";

function isActive(item: { active?: boolean }) {
  return item.active !== false;
}

function sortByOrder<T extends { sortOrder?: number }>(items: T[] = []) {
  return [...items].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
}

function normalizeUrl(url?: string) {
  const value = String(url || "").trim();

  if (!value) return "#";

  return value;
}

function getTarget(target?: string) {
  return target === "_blank" ? "_blank" : "_self";
}

function getRel(target?: string) {
  return target === "_blank" ? "noreferrer noopener" : undefined;
}

function getSocialIcon(icon?: string, platform?: string) {
  const key = String(icon || platform || "").toLowerCase();

  if (key.includes("facebook")) {
    return <span className="text-[34px] font-bold leading-none">f</span>;
  }

  if (key.includes("instagram")) {
    return (
      <span className="grid h-8 w-8 place-items-center rounded-[9px] border-2 border-current text-[18px] font-bold leading-none">
        ●
      </span>
    );
  }

  if (key.includes("tiktok")) {
    return <Music2 className="h-7 w-7" />;
  }

  if (key.includes("youtube")) {
    return (
      <span className="grid h-8 w-9 place-items-center rounded-lg bg-current text-[13px] font-bold leading-none text-white">
        ▶
      </span>
    );
  }

  if (key.includes("pinterest")) {
    return <span className="font-serif text-4xl leading-none">P</span>;
  }

  if (key.includes("x") || key.includes("twitter")) {
    return <X className="h-7 w-7" />;
  }

  return <ExternalLink className="h-7 w-7" />;
}

export default function SiteFooter() {
  const [footer, setFooter] = useState<FooterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadFooter() {
      try {
        setLoading(true);
        setError("");

      const response = await getSiteFooter();

const responseData: any = response?.data;
const data = responseData?.value || responseData;

        if (!data) {
          throw new Error("Footer API response me data missing hai.");
        }

        if (!Array.isArray(data.columns)) {
          throw new Error("Footer API response me columns array missing hai.");
        }

        if (!mounted) return;

        setFooter(data);
      } catch (error: any) {
        console.error("Footer load failed:", error);

        if (!mounted) return;

        setFooter(null);
        setError(error?.message || "Footer API failed.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadFooter();

    return () => {
      mounted = false;
    };
  }, []);

  const columns = useMemo(() => {
    return sortByOrder(footer?.columns || [])
      .filter(isActive)
      .map((column) => ({
        ...column,
        links: sortByOrder(column.links || []).filter(isActive),
      }))
      .filter((column) => column.title && column.links.length);
  }, [footer]);

  const legalLinks = useMemo(() => {
    return sortByOrder(footer?.legalLinks || []).filter(isActive);
  }, [footer]);

  const appButtons = useMemo(() => {
    return sortByOrder(footer?.appDownload?.buttons || []).filter(isActive);
  }, [footer]);

  const socialLinks = useMemo(() => {
    return sortByOrder(footer?.social?.links || []).filter(isActive);
  }, [footer]);

  const countries = useMemo(() => {
    return sortByOrder(footer?.shoppingFrom?.countries || []).filter(isActive);
  }, [footer]);

  const badges = useMemo(() => {
    return sortByOrder(footer?.badges || []).filter(isActive);
  }, [footer]);

  if (loading) {
    return (
      <footer className="border-t border-[#e4ddd2] bg-[#f7f7f7] px-5 py-10 text-[#15100c]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-center gap-3 text-sm text-[#6d6760]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading footer from backend...
        </div>
      </footer>
    );
  }

  if (error) {
    return (
      <footer className="border-t border-red-200 bg-red-50 px-5 py-8 text-red-700">
        <div className="mx-auto max-w-[1500px] text-sm">
          <p className="font-semibold">Footer backend error</p>
          <p className="mt-1">{error}</p>
        </div>
      </footer>
    );
  }

  if (!footer) return null;

  return (
    <footer className="relative border-t border-[#e4ddd2] bg-[#f7f7f7] text-[#15100c]">
      <div className="mx-auto max-w-[1500px] px-5 py-12 lg:px-8">
      <div className="grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-5">
          {columns.map((column) => (
            <FooterColumnBlock key={column.id || column.title} column={column} />
          ))}

          <div className="space-y-10">
            {footer.appDownload ? (
              <div>
                {footer.appDownload.title ? (
                  <h3 className="text-[15px] font-bold uppercase tracking-[0.04em]">
                    {footer.appDownload.title}
                  </h3>
                ) : null}

                {footer.appDownload.description ? (
                  <p className="mt-4 max-w-[360px] text-[16px] leading-6 text-[#15100c]">
                    {footer.appDownload.description}
                  </p>
                ) : null}

                {appButtons.length ? (
                  <div className="mt-6 flex flex-wrap gap-4">
                    {appButtons.map((button) => (
                      <a
                        key={button.id || button.url}
                        href={normalizeUrl(button.url)}
                        target={getTarget(button.target)}
                        rel={getRel(button.target)}
                        aria-label={button.label || "Download app"}
                        className="block overflow-hidden rounded-md bg-black transition hover:-translate-y-0.5 hover:opacity-85"
                      >
                        <img
                          src={button.imageUrl}
                          alt={button.label || "App download"}
                          className="h-14 w-auto object-contain"
                        />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {socialLinks.length ? (
              <div>
                <h3 className="text-[18px] font-bold uppercase tracking-[0.04em]">
                  {footer.social?.title || "FOLLOW US"}
                </h3>

                <div className="mt-6 flex flex-wrap items-center gap-8">
                  {socialLinks.map((link) => (
                    <SocialLink key={link.id || link.url} link={link} />
                  ))}
                </div>
              </div>
            ) : null}

            {badges.length ? (
              <div className="flex flex-wrap items-center gap-5">
                {badges.map((badge) => (
                  <a
                    key={badge.id || badge.imageUrl}
                    href={normalizeUrl(badge.url)}
                    target={getTarget(badge.target)}
                    rel={getRel(badge.target)}
                    aria-label={badge.label || "Footer badge"}
                    className="block transition hover:opacity-80"
                  >
                    <img
                      src={badge.imageUrl}
                      alt={badge.label || "Footer badge"}
                      className="h-12 w-auto object-contain"
                    />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {footer.shoppingFrom ? (
          <div className="mt-14 border-t border-[#e0dbd4] pt-8">
            {footer.shoppingFrom.title ? (
              <h3 className="text-[18px] font-bold uppercase tracking-[0.04em]">
                {footer.shoppingFrom.title}
              </h3>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-5 text-[17px]">
              {footer.shoppingFrom.currentCountry ? (
                <div className="flex items-center gap-3">
                  <span>{footer.shoppingFrom.currentText || "You're In"}</span>

                  <CountryFlag country={footer.shoppingFrom.currentCountry} />
                </div>
              ) : null}

              {countries.length ? (
                <div className="flex flex-wrap items-center gap-4">
                  {footer.shoppingFrom.internationalText ? (
                    <span>{footer.shoppingFrom.internationalText}</span>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-3">
                    {countries.map((country) => (
                      <CountryFlag key={country.id || country.name} country={country} />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {legalLinks.length ? (
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-[16px] uppercase tracking-[0.02em]">
            {legalLinks.map((link) => (
              <FooterTextLink key={link.id || link.url} link={link} />
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex min-h-[52px] items-center justify-between gap-5 bg-[#242424] px-5 text-white lg:px-8">
        <div className="text-[28px] font-light tracking-[0.45em]">
          {footer.brandText || ""}
        </div>

        {footer.copyright ? (
          <p className="text-right text-[13px] uppercase tracking-[0.04em] text-white/75">
            {footer.copyright}
          </p>
        ) : null}
      </div>

      {/* {footer.promoTab?.enabled && footer.promoTab.text ? (
        <a
          href={normalizeUrl(footer.promoTab.url)}
          className="fixed right-0 top-1/2 z-[999] -translate-y-1/2 bg-[#15100c] px-3 py-5 text-center text-[13px] font-bold uppercase tracking-[0.12em] text-white [writing-mode:vertical-rl] hover:bg-[#b98262]"
        >
          {footer.promoTab.text}
        </a>
      ) : null} */}

    {(footer as any).floatingButtons?.enabled ? <FloatingFooterButtons /> : null}
    </footer>
  );
}

function FooterColumnBlock({ column }: { column: FooterColumn }) {
  return (
    <div>
      <h3 className="mb-6 text-[17px] font-bold uppercase tracking-[0.04em]">
        {column.title}
      </h3>

      <div className="grid gap-5">
        {column.links.map((link) => (
          <FooterTextLink key={link.id || link.url || link.label} link={link} />
        ))}
      </div>
    </div>
  );
}

function FooterTextLink({ link }: { link: FooterLink }) {
  return (
    <a
      href={normalizeUrl(link.url)}
      target={getTarget(link.target)}
      rel={getRel(link.target)}
      className="text-[16px] leading-6 text-[#15100c] transition hover:text-[#b98262]"
    >
      {link.label}
    </a>
  );
}

function SocialLink({ link }: { link: FooterSocialLink }) {
  return (
    <a
      href={normalizeUrl(link.url)}
      target={getTarget(link.target || "_blank")}
      rel={getRel(link.target || "_blank")}
      aria-label={link.label}
      className="text-[#15100c] transition hover:-translate-y-0.5 hover:text-[#b98262]"
    >
      {getSocialIcon(link.icon, link.platform)}
    </a>
  );
}

function CountryFlag({
  country,
}: {
  country: {
    name: string;
    flagUrl: string;
    url?: string;
    target?: string;
  };
}) {
  const content = (
    <img
      src={country.flagUrl}
      alt={country.name}
      title={country.name}
      className="h-8 w-8 rounded-full object-cover"
    />
  );

  if (!country.url) return content;

  return (
    <a
      href={normalizeUrl(country.url)}
      target={getTarget(country.target)}
      rel={getRel(country.target)}
      aria-label={country.name}
      className="transition hover:scale-110"
    >
      {content}
    </a>
  );
}

function FloatingFooterButtons() {
  return (
    <div className="fixed bottom-6 right-5 z-[998] grid gap-4">
      <button
        type="button"
        aria-label="Open helper"
        className="grid h-[68px] w-[68px] place-items-center rounded-full bg-[#efe5df] text-[#15100c] shadow-[0_12px_28px_rgba(23,17,13,0.16)] transition hover:-translate-y-1"
      >
        <Globe2 className="h-6 w-6" />
      </button>

      <button
        type="button"
        aria-label="Open chat"
        className="grid h-[68px] w-[68px] place-items-center rounded-full bg-[#efe5df] text-[#15100c] shadow-[0_12px_28px_rgba(23,17,13,0.16)] transition hover:-translate-y-1"
      >
        <MessageCircle className="h-6 w-6 fill-[#15100c]" />
      </button>
    </div>
  );
}
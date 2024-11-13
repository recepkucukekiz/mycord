import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const locales = ["en", "tr"] as const;
export const defaultLocale = "en";
export const localePrefix = "always";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

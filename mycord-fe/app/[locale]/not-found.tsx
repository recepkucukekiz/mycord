/* eslint-disable react/no-unescaped-entities */
"use client";

import { useTranslations, useLocale } from "next-intl";

export default function NotFound() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="bg-G21">
      <div className="flex flex-col items-center w-full py-[120px]">
        <div className="md:text-[62px] text-4xl font-semibold mt-4 mb-10 text-White">
          {t("notFound")}
        </div>
        {locale === "en" ? (
          <div className="text-base text-White font-normal text-center md:max-w-[780px] md:px-0 px-4">
            The page you're looking for is unavailable.
          </div>
        ) : (
          <div className="text-base text-White font-normal text-center md:max-w-[780px] md:px-0 px-4">
            Aradığınız sayfa mevcut değil.
          </div>
        )}
      </div>
    </div>
  );
}

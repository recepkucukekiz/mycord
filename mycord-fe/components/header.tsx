"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Image from "next/image";
import LanguageSelector from "@/components/language-selector";
import { useTranslations } from "next-intl";
import { Link } from "@/app/navigation";

export default function Header() {
  const t = useTranslations();
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    if (window.scrollY >= window.innerHeight) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    handleScroll();
  }, []);

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", handleScroll);
  }

  return (
    <section
      className={cn(
        "fixed rounded-[200px] outline-1 outline-black/5 md:left-4 md:right-4 top-5 z-40 backdrop-blur-xl md:px-8 md:transition-all md:duration-700 m-auto md:rounded-[200px] md:top-6 border-zinc-500 border-2 container mx-auto",
        isVisible ? "" : "hidden"
      )}>
      <div className="w-full h-full gap-5 flex flex-row items-center justify-between py-3 container mx-auto px-2">
        <div className="flex items-center justify-start">
          <Image
            src="/logo-wo-text.png"
            alt="logo"
            width={40}
            height={40}
          />
        </div>
        <div className="flex items-center justify-center text-sm leading-[17px]">
          <nav className="flex items-center justify-center text-[14px]">
            <Link href="#team" scroll={false} />
            <a
              href="#team"
              className="pr-4 md:pr-12 py-3 text-black whitespace-nowrap cursor-pointer hover:text-black/60 hover:transition-all duration-100 dark:text-white dark:hover:text-white/60">
              <div data-link="link=page-1&amp;target=_blank&amp;text=Home">
                {t("team.title")}
              </div>
            </a>
            <a
              href="#products"
              className="pr-4 md:pr-12 py-3 text-black whitespace-nowrap cursor-pointer hover:text-black/60 hover:transition-all duration-100 dark:text-white dark:hover:text-white/60">
              <div data-link="link=pricing&amp;target=_blank&amp;text=Pricing">
                {t("products.header")}
              </div>
            </a>
            <a
              href="#examples"
              className="pr-4 md:pr-12 py-3 text-black whitespace-nowrap cursor-pointer hover:text-black/60 hover:transition-all duration-100 dark:text-white dark:hover:text-white/60">
              <div data-link="link=pricing&amp;target=_blank&amp;text=Pricing">
                {t("examples.header")}
              </div>
            </a>
          </nav>
        </div>
        <div className="flex items-center justify-end">
          <LanguageSelector />
        </div>
      </div>
    </section>
  );
}

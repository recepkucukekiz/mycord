"use client";

import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/app/navigation";
import { AnimatedSubscribeButton } from "@/components/ui/animated-subscribe-button";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  const handleLanguageChange = (value: string) => {
    router.replace(
      // @ts-expect-error locale is a string
      { pathname, params },
      { locale: value }
    );
  };

  return (
    <div className="flex items-center space-x-2 fixed bottom-4 right-5 z-50 border rounded">
      <AnimatedSubscribeButton
        buttonColor="#000000"
        buttonTextColor="#ffffff"
        subscribeStatus={locale === "en"}
        initialText={<span className="group inline-flex items-center">TR</span>}
        changeText={<span className="group inline-flex items-center">EN</span>}
        initalOnclick={() => handleLanguageChange("en")}
        changeOnClick={() => handleLanguageChange("tr")}
      />
    </div>
  );
}

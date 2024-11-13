"use client";

import { useLocale } from "next-intl";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/app/navigation";

export default function LanguageSelector() {
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
    <Select onValueChange={handleLanguageChange} defaultValue={locale}>
      <SelectTrigger id="theme-selector" className="w-full">
        <SelectValue placeholder="Choose your language" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="en">EN</SelectItem>
          <SelectItem value="tr">TR</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

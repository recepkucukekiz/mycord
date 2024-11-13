import { icons } from "lucide-react";

export default function StrIcon({
  icon,
  className,
}: {
  icon?: string;
  className?: string;
}) {
  if (icon) {
    const IconComponent = icons[icon as keyof typeof icons];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
  }

  return null;
}

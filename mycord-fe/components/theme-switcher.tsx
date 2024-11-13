"use client";

import { useTheme } from "next-themes";
import { AnimatedSubscribeButton } from "@/components/ui/animated-subscribe-button";
import { Moon, Sun } from "lucide-react";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex items-center space-x-2 fixed bottom-4 left-5 z-50">
      <AnimatedSubscribeButton
        buttonColor="#000000"
        buttonTextColor="#ffffff"
        subscribeStatus={theme === "dark"}
        initialText={
          <span className="group inline-flex items-center">
            <Sun />
          </span>
        }
        changeText={
          <span className="group inline-flex items-center">
            <Moon />
          </span>
        }
        initalOnclick={() => setTheme("dark")}
        changeOnClick={() => setTheme("light")}
      />
    </div>
  );
}

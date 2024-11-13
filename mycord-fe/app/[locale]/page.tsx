import Particles from "@/components/ui/particles";
import TypingAnimation from "@/components/ui/typing-animation";
import { Link } from "../navigation";
import { RainbowButton } from "@/components/ui/rainbow-button";
import BoxReveal from "@/components/ui/box-reveal";
import ThemeSwitcher from "@/components/theme-switcher";
import LanguageSwitcher from "@/components/language-switcher";
import AddBug from "@/components/add-bug";
import BugList from "@/components/bug-list";

export default function Home() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background">
      <div className="max-w-3xl flex flex-col items-start justify-center gap-4 border rounded-lg p-8">
        <Particles
          className="absolute inset-0"
          quantity={200}
          size={0.8}
          ease={80}
          color={"#4f46e5"}
          refresh
        />

        <BoxReveal boxColor={"#5046e6"} duration={1}>
          <TypingAnimation
            className="text-4xl font-bold text-black dark:text-white"
            text="mycord"
          />
        </BoxReveal>

        <BoxReveal boxColor={"#5046e6"} duration={1}>
          <div className="mt-6">
            <p>
              - Discord clone built with
              <span className="font-semibold text-[#5046e6]"> Nextjs</span>,
              <span className="font-semibold text-[#5046e6]"> Typescript</span>,
              <span className="font-semibold text-[#5046e6]">Tailwind CSS</span>
              <span className="font-semibold text-[#5046e6]"> shadcn ui</span>,
              <span className="font-semibold text-[#5046e6]"> Nestjs</span>,
              <span className="font-semibold text-[#5046e6]"> socket.io</span>,
              <span className="font-semibold text-[#5046e6]"> webRTC</span>, and
              <span className="font-semibold text-[#5046e6]"> postgreSQL</span>
              . <br />
              - 100% free and <Link target="_blank" href={"https://github.com/recepkucukekiz"}>open-source</Link>. <br />
            </p>
          </div>
        </BoxReveal>

        <BoxReveal boxColor={"#5046e6"} duration={1}>
          <RainbowButton>
            <Link href="/app">Go to app</Link>
          </RainbowButton>
        </BoxReveal>

        <ThemeSwitcher />
        <LanguageSwitcher />

        <AddBug />

        <BoxReveal width="fit-content" boxColor={"#5046e6"} duration={1}>
          <BugList />
        </BoxReveal>
      </div>

      {/* <DotPattern
        className={cn(
          "[mask-image:radial-gradient(5000px_circle_at_center,white,transparent)]"
        )}
      /> */}
    </div>
  );
}

"use client";

import { BugStatus } from "@/interfaces/app";
import { cn } from "@/lib/utils";
import Marquee from "./ui/marquee";
import { useGetBugListQuery } from "@/store/services/appService";
import { useMemo } from "react";

const BugCard = ({ status, bug }: { status: BugStatus; bug: string }) => {
  const getstatusIndicator = (status: BugStatus) => {
    switch (status) {
      case BugStatus.PENDING:
        return (
          <div className="w-3 h-3 bg-yellow-500 rounded-full dark:bg-yellow-400"></div>
        );
      case BugStatus.IN_PROGRESS:
        return (
          <div className="w-3 h-3 bg-blue-500 rounded-full dark:bg-blue-400"></div>
        );
      case BugStatus.RESOLVED:
        return (
          <div className="w-3 h-3 bg-green-500 rounded-full dark:bg-green-400"></div>
        );
      default:
        return (
          <div className="w-3 h-3 bg-yellow-500 rounded-full dark:bg-yellow-400"></div>
        );
    }
  };
  return (
    <figure
      className={cn(
        "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
      )}>
      <div className="flex flex-row items-center gap-2">
        <div className="flex items-center gap-1">
          {getstatusIndicator(status)}
          <figcaption className="text-sm font-medium dark:text-white">
            {status}
          </figcaption>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{bug}</blockquote>
    </figure>
  );
};

export default function BugList() {
  const { data } = useGetBugListQuery();

  const firstRow = useMemo(() => data?.slice(0, data.length / 2) || [], [data]);
  const secondRow = useMemo(() => data?.slice(data.length / 2) || [], [data]);

  return (
    <div className="relative flex w-full max-w-2xl flex-col items-center justify-center overflow-hidden rounded-lg bg-background">
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review) => (
          <BugCard key={review.id} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review) => (
          <BugCard key={review.id} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
    </div>
  );
}

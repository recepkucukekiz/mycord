import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isNullOrUndefined(...values: unknown[]): boolean {
  return values.some((value) => value === undefined || value === null);
}


// Utility Functions - Francis Okorie Iyeke-Kanu
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/* Created by Francis Okorie Iyeke-Kanu */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

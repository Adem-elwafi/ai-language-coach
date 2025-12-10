import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function that merges Tailwind classes while ensuring
 * user-defined styles override defaults and prevents class conflicts.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getURL = (path: string = '') => {
  // Check for NEXT_PUBLIC_SITE_URL first (canonical URL)
  let url =
    process.env.NEXT_PUBLIC_SITE_URL &&
      process.env.NEXT_PUBLIC_SITE_URL.trim() !== ''
      ? process.env.NEXT_PUBLIC_SITE_URL
      : // check for NEXT_PUBLIC_VERCEL_URL (automatically set by Vercel)
      process.env.NEXT_PUBLIC_VERCEL_URL &&
        process.env.NEXT_PUBLIC_VERCEL_URL.trim() !== ''
        ? process.env.NEXT_PUBLIC_VERCEL_URL
        : // fall back to localhost
        'http://localhost:3000';

  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Correctly handle trailing slashes
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;

  // ensure path doesn't start with / if url ends with it, to avoid double slashes. 
  // actually, we ensured url ends with / above. so path should NOT start with /.
  path = path.startsWith('/') ? path.substring(1) : path;

  return `${url}${path}`;
};

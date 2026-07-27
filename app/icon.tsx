import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <svg
        width={32}
        height={32}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="28" height="28" rx="7" fill="#4F46E5" />
        <rect x="8" y="6" width="12" height="16" rx="1.5" fill="white" />
        <line x1="10.5" y1="10.5" x2="17.5" y2="10.5" stroke="#4F46E5" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="10.5" y1="13.5" x2="17.5" y2="13.5" stroke="#4F46E5" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="10.5" y1="16.5" x2="15" y2="16.5" stroke="#4F46E5" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="20.5" cy="20.5" r="4.5" fill="#10B981" stroke="white" strokeWidth="1.2" />
        <path
          d="M18.6 20.6l1.2 1.2 2-2.4"
          stroke="white"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
    { ...size },
  );
}

// components/icons/facebook-icon.tsx
import type { LucideProps } from "lucide-react";
import React from 'react';

// This one is single-color, so it will inherit the text color of the button.
export const FacebookIcon = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z" />
  </svg>
);
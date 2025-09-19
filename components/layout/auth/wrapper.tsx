// components/layout/auth/wrapper.tsx
"use client"; 

import { motion } from "framer-motion";
import { dignifiedReveal } from "@/lib/animations";

export function AuthCardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="w-full max-w-md space-y-8 bg-card/80 backdrop-blur-lg border border-border/60 shadow-lg rounded-2xl p-8 md:p-10"
      variants={dignifiedReveal}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}
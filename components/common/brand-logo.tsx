// components/common/brand-logo.tsx
"use client";

import Link from "next/link";
import { HeartHandshake, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useBrandName } from "@/hooks/use-brand-config";

import {
  containerVariants,
  iconVariants,
  sparkleVariants,
} from "@/lib/animations";

interface BrandLogoProps {
  /** Size variant for different use cases */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Visual variant for different contexts */
  variant?: "default" | "footer" | "mobile" | "minimal" | "hero" | "admin" | "members";
  /** Custom href - defaults to "/" */
  href?: string;
  /** Brand name text - if not provided, will use from brand config */
  brandName?: string;
  /** Whether to show the brand name text */
  showText?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Click handler - useful for mobile menu closing */
  onClick?: () => void;
  /** Whether the logo should be a link or just a div */
  asLink?: boolean;
  /** Whether to show animated sparkles */
  showSparkles?: boolean;
  /** Whether to enable hover animations */
  enableAnimations?: boolean;
}

const sizeConfig = {
  xs: {
    container: "gap-2",
    iconWrapper: "p-1 rounded-lg",
    icon: "h-4 w-4",
    text: "text-sm font-bold",
    sparkle: "h-2 w-2",
  },
  sm: {
    container: "gap-2.5",
    iconWrapper: "p-1.5 rounded-lg",
    icon: "h-5 w-5",
    text: "text-base font-bold",
    sparkle: "h-2.5 w-2.5",
  },
  md: {
    container: "gap-3",
    iconWrapper: "p-2 rounded-xl",
    icon: "h-6 w-6",
    text: "text-xl font-bold",
    sparkle: "h-3 w-3",
  },
  lg: {
    container: "gap-3.5",
    iconWrapper: "p-2.5 rounded-2xl",
    icon: "h-7 w-7",
    text: "text-2xl font-bold",
    sparkle: "h-3.5 w-3.5",
  },
  xl: {
    container: "gap-4",
    iconWrapper: "p-3 rounded-2xl",
    icon: "h-8 w-8",
    text: "text-3xl font-bold",
    sparkle: "h-4 w-4",
  },
};

const variantConfig = {
  default: {
    container:
      "group transition-all duration-300 hover:scale-[1.02] cursor-pointer",
    iconWrapper:
      "bg-gradient-to-br from-primary/10 via-primary/8 to-primary/5 group-hover:from-primary/20 group-hover:via-primary/15 group-hover:to-primary/10 transition-all duration-300 border border-primary/5 group-hover:border-primary/15 relative overflow-hidden",
    icon: "text-primary transition-all duration-300 group-hover:scale-110 group-hover:text-primary/90 relative z-10",
    text: "text-foreground group-hover:text-primary transition-all duration-300 font-serif tracking-tight",
    blur: false,
  },
  footer: {
    container: "group w-fit cursor-pointer",
    iconWrapper:
      "bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 group-hover:from-primary/25 group-hover:via-primary/20 group-hover:to-primary/15 transition-all duration-500 relative overflow-hidden border border-primary/10 group-hover:border-primary/20",
    icon: "text-primary transition-all duration-500 group-hover:scale-110 group-hover:text-primary/90 relative z-10",
    text: "bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent group-hover:from-primary/95 group-hover:via-primary/85 group-hover:to-primary/75 transition-all duration-500 font-serif tracking-tight",
    blur: true,
  },
  mobile: {
    container: "group cursor-pointer",
    iconWrapper:
      "bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/15 group-hover:to-primary/10 transition-all duration-300 border border-primary/5 group-hover:border-primary/15",
    icon: "text-primary transition-all duration-300 group-hover:scale-110 relative z-10",
    text: "text-foreground group-hover:text-primary transition-all duration-300 font-serif tracking-tight",
    blur: false,
  },
  minimal: {
    container: "group cursor-pointer",
    iconWrapper:
      "transition-all duration-300 group-hover:bg-primary/5 border border-transparent group-hover:border-primary/10 rounded-lg",
    icon: "text-primary transition-all duration-300 group-hover:scale-105",
    text: "text-foreground transition-all duration-300 font-serif tracking-tight group-hover:text-primary/90",
    blur: false,
  },
  hero: {
    container: "group cursor-pointer transform-gpu",
    iconWrapper:
      "bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 group-hover:from-primary/30 group-hover:via-primary/25 group-hover:to-primary/20 transition-all duration-500 relative overflow-hidden border-2 border-primary/15 group-hover:border-primary/25 shadow-lg group-hover:shadow-xl group-hover:shadow-primary/20",
    icon: "text-primary transition-all duration-500 group-hover:scale-125 group-hover:text-primary/90 relative z-10 drop-shadow-sm",
    text: "bg-gradient-to-r from-foreground via-foreground/95 to-foreground/90 bg-clip-text text-transparent group-hover:from-primary group-hover:via-primary/90 group-hover:to-primary/80 transition-all duration-500 font-serif tracking-tight drop-shadow-sm",
    blur: true,
  },
  admin: {
    container: "group cursor-pointer",
    iconWrapper:
      "bg-gradient-to-br from-accent/10 to-accent/5 group-hover:from-accent/20 group-hover:to-accent/10 transition-all duration-300 border border-accent/20 group-hover:border-accent/40 rounded-xl",
    icon: "text-accent transition-all duration-300 group-hover:scale-110",
    text: "text-foreground transition-all duration-300 font-serif tracking-tight group-hover:text-accent/90",
    blur: false,
  },
  members: {
    container: "group cursor-pointer",
    iconWrapper:
      "bg-gradient-to-br from-secondary/10 to-secondary/5 group-hover:from-secondary/20 group-hover:to-secondary/10 transition-all duration-300 border border-secondary/20 group-hover:border-secondary/40 rounded-xl",
    icon: "text-secondary transition-all duration-300 group-hover:scale-110",
    text: "text-foreground transition-all duration-300 font-serif tracking-tight group-hover:text-secondary/90",
    blur: false,
  },
};

export function BrandLogo({
  size = "md",
  variant = "default",
  href = "/",
  brandName,
  showText = true,
  className,
  onClick,
  asLink = true,
  showSparkles = false,
  enableAnimations = true,
}: BrandLogoProps) {
  const configBrandName = useBrandName();
  const finalBrandName = brandName || configBrandName;

  const sizeStyles = sizeConfig[size];
  const variantStyles = variantConfig[variant];

  const logoContent = (
    <>
      <div
        className={cn(
          "relative",
          sizeStyles.iconWrapper,
          variantStyles.iconWrapper
        )}
      >
        {/* Main icon */}
        <motion.div
          variants={enableAnimations ? iconVariants : undefined}
          initial="initial"
          whileHover={enableAnimations ? "hover" : undefined}
          className="relative z-10"
        >
          <HeartHandshake className={cn(sizeStyles.icon, variantStyles.icon)} />
        </motion.div>

        {/* Animated sparkles */}
        <AnimatePresence>
          {showSparkles && (
            <>
              <motion.div
                className="absolute -top-1 -right-1"
                variants={sparkleVariants}
                initial="initial"
                animate="animate"
              >
                <Sparkles className={cn(sizeStyles.sparkle, "text-accent")} />
              </motion.div>
              <motion.div
                className="absolute -bottom-1 -left-1"
                variants={sparkleVariants}
                initial="initial"
                animate="animate"
                style={{ animationDelay: "1s" }}
              >
                <Sparkles className={cn(sizeStyles.sparkle, "text-primary")} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Background blur effect for certain variants */}
        {variantStyles.blur && (
          <motion.div
            className="absolute inset-0 bg-primary/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ zIndex: -1 }}
          />
        )}

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_1s_ease-out]"
          style={{ transform: "translateX(-100%)" }}
        />
      </div>

      {showText && (
        <motion.span
          className={cn(sizeStyles.text, variantStyles.text)}
          initial={{ opacity: 1 }}
          whileHover={enableAnimations ? { scale: 1.02 } : undefined}
          transition={{ duration: 0.3 }}
        >
          {finalBrandName}
        </motion.span>
      )}
    </>
  );

  const containerClasses = cn(
    "flex items-center select-none",
    sizeStyles.container,
    variantStyles.container,
    className
  );

  if (!asLink) {
    return (
      <motion.div
        className={containerClasses}
        onClick={onClick}
        variants={enableAnimations ? containerVariants : undefined}
        initial={enableAnimations ? "initial" : undefined}
        whileHover={enableAnimations ? "hover" : undefined}
        whileTap={enableAnimations ? "tap" : undefined}
      >
        {logoContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={enableAnimations ? containerVariants : undefined}
      initial={enableAnimations ? "initial" : undefined}
      whileHover={enableAnimations ? "hover" : undefined}
      whileTap={enableAnimations ? "tap" : undefined}
    >
      <Link href={href} className={containerClasses} onClick={onClick}>
        {logoContent}
      </Link>
    </motion.div>
  );
}

// Export preset configurations for common use cases
export const HeaderLogo = (props: Omit<BrandLogoProps, "size" | "variant">) => (
  <BrandLogo size="md" variant="default" {...props} />
);

export const FooterLogo = (props: Omit<BrandLogoProps, "size" | "variant">) => (
  <BrandLogo size="lg" variant="footer" {...props} />
);

export const MobileLogo = (props: Omit<BrandLogoProps, "size" | "variant">) => (
  <BrandLogo size="md" variant="mobile" {...props} />
);

export const MinimalLogo = (
  props: Omit<BrandLogoProps, "size" | "variant">
) => <BrandLogo size="sm" variant="minimal" {...props} />;

export const HeroLogo = (props: Omit<BrandLogoProps, "size" | "variant">) => (
  <BrandLogo size="xl" variant="hero" showSparkles {...props} />
);

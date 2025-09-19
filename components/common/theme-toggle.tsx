// components/theme-toggle.tsx
"use client";

import * as React from "react";
import { Moon, Sun, Monitor, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, Variants } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  buttonVariants,
  dropdownVariants,
  itemVariants,
} from "@/lib/animations";

interface ThemeOption {
  value: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const themeOptions: ThemeOption[] = [
  {
    value: "light",
    label: "Light",
    icon: <Sun className="h-4 w-4" />,
    description: "Clean and bright interface",
  },
  {
    value: "dark",
    label: "Dark",
    icon: <Moon className="h-4 w-4" />,
    description: "Easy on the eyes",
  },
  {
    value: "system",
    label: "System",
    icon: <Monitor className="h-4 w-4" />,
    description: "Follows your device preference",
  },
];

interface ThemeToggleProps {
  variant?: "default" | "simple" | "dropdown";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

// Theme icon animation variants
const themeIconVariants: Variants = {
  light: {
    rotate: 0,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  dark: {
    rotate: 180,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  entering: {
    scale: 0,
    rotate: -90,
    transition: { duration: 0.2 },
  },
  exiting: {
    scale: 0,
    rotate: 90,
    transition: { duration: 0.2 },
  },
};

export function ThemeToggle({
  variant = "default",
  showLabel = false,
  size = "md",
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Get the appropriate size classes
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-9 h-9",
    lg: "w-10 h-10",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  // Loading state
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className={`${sizeClasses[size]} border-border/60`}
        disabled
      >
        <Sun className={iconSizes[size]} />
        <span className="sr-only">Loading theme toggle</span>
      </Button>
    );
  }

  // Simple toggle variant
  if (variant === "simple") {
    const toggleTheme = () => {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    const isDark = resolvedTheme === "dark";

    return (
      <motion.div
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className={`${sizeClasses[size]} relative overflow-hidden border-border/60 hover:border-primary/40 hover:bg-primary/5 group transition-all duration-300`}
        >
          <div className="relative">
            <AnimatePresence mode="wait" initial={false}>
              {isDark ? (
                <motion.div
                  key="moon"
                  variants={themeIconVariants}
                  initial="entering"
                  animate="dark"
                  exit="exiting"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Moon className={`${iconSizes[size]} text-primary`} />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  variants={themeIconVariants}
                  initial="entering"
                  animate="light"
                  exit="exiting"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Sun className={`${iconSizes[size]} text-primary`} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span className="sr-only">Toggle theme</span>

          {/* Animated background effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          />
        </Button>
      </motion.div>
    );
  }

  // Dropdown variant
  if (variant === "dropdown") {
    const currentTheme = themeOptions.find((option) => option.value === theme);

    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <motion.div
            variants={buttonVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              variant="outline"
              size={showLabel ? "default" : "icon"}
              className={`${
                !showLabel ? sizeClasses[size] : "px-3"
              } border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 gap-2 relative overflow-hidden group`}
            >
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {currentTheme?.icon || <Palette className={iconSizes[size]} />}
              </motion.div>
              {showLabel && (
                <span className="text-sm font-medium">
                  {currentTheme?.label || "Theme"}
                </span>
              )}
              <span className="sr-only">Change theme</span>

              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            </Button>
          </motion.div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-[200px] p-1">
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {themeOptions.map((option) => (
              <motion.div key={option.value} variants={itemVariants}>
                <DropdownMenuItem
                  onClick={() => setTheme(option.value)}
                  className={`cursor-pointer transition-all duration-200 rounded-md p-3 hover:bg-primary/5 group ${
                    theme === option.value
                      ? "bg-gradient-to-r from-primary/10 to-accent/5 text-primary border border-primary/20"
                      : "hover:border hover:border-primary/10"
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", duration: 0.3 }}
                      className={`p-1.5 rounded-lg transition-colors duration-200 ${
                        theme === option.value
                          ? "bg-primary/15 text-primary"
                          : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                      }`}
                    >
                      {option.icon}
                    </motion.div>
                    <div className="flex-1">
                      <div className="font-medium text-sm group-hover:text-primary transition-colors duration-200">
                        {option.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                    {theme === option.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.3 }}
                        className="w-2 h-2 bg-primary rounded-full"
                      />
                    )}
                  </div>
                </DropdownMenuItem>
              </motion.div>
            ))}

            <DropdownMenuSeparator className="my-2" />

            <div className="px-3 py-2 text-xs text-muted-foreground">
              Current: {resolvedTheme === "dark" ? "Dark" : "Light"} mode
              {theme === "system" && systemTheme && (
                <span className="block mt-1">System: {systemTheme}</span>
              )}
            </div>
          </motion.div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default variant (enhanced toggle)
  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const isDark = resolvedTheme === "dark";

  return (
    <motion.div
      variants={buttonVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
    >
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className={`${sizeClasses[size]} relative overflow-hidden border-border/60 hover:border-primary/40 hover:bg-primary/5 group transition-all duration-300`}
      >
        <div className="relative">
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.div
                key="moon"
                variants={themeIconVariants}
                initial="entering"
                animate="dark"
                exit="exiting"
                className="absolute inset-0 flex items-center justify-center"
              >
                <Moon
                  className={`${iconSizes[size]} text-primary transition-all duration-300 group-hover:text-primary/80`}
                />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                variants={themeIconVariants}
                initial="entering"
                animate="light"
                exit="exiting"
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sun
                  className={`${iconSizes[size]} text-primary transition-all duration-300 group-hover:text-primary/80`}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span className="sr-only">Toggle theme</span>

        {/* Enhanced animated background effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-md"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6 }}
        />

        {/* Subtle glow effect */}
        <motion.div
          className="absolute inset-0 rounded-md"
          initial={{ boxShadow: "0 0 0 0 rgba(217, 93, 57, 0)" }}
          whileHover={{ boxShadow: "0 0 0 1px rgba(217, 93, 57, 0.1)" }}
          transition={{ duration: 0.3 }}
        />
      </Button>
    </motion.div>
  );
}

// Export preset configurations
export const SimpleThemeToggle = (props: Omit<ThemeToggleProps, "variant">) => (
  <ThemeToggle variant="simple" {...props} />
);

export const DropdownThemeToggle = (
  props: Omit<ThemeToggleProps, "variant">
) => <ThemeToggle variant="dropdown" {...props} />;

// Debug component for development
export function DebugThemeToggle() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading theme debug...</div>;
  }

  return (
    <motion.div
      className="flex flex-col gap-4 p-6 border rounded-xl bg-card shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-sm space-y-2">
        <div className="font-semibold text-lg mb-3 text-foreground">
          Theme Debug Info
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Current theme:</span>
            <span className="ml-2 font-medium text-primary">{theme}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Resolved:</span>
            <span className="ml-2 font-medium text-primary">
              {resolvedTheme}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">System:</span>
            <span className="ml-2 font-medium text-primary">{systemTheme}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Mounted:</span>
            <span className="ml-2 font-medium text-primary">
              {mounted ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button
          size="sm"
          onClick={() => setTheme("light")}
          variant={theme === "light" ? "default" : "outline"}
        >
          Light
        </Button>
        <Button
          size="sm"
          onClick={() => setTheme("dark")}
          variant={theme === "dark" ? "default" : "outline"}
        >
          Dark
        </Button>
        <Button
          size="sm"
          onClick={() => setTheme("system")}
          variant={theme === "system" ? "default" : "outline"}
        >
          System
        </Button>
      </div>

      <div className="flex gap-2">
        <ThemeToggle variant="simple" size="sm" />
        <ThemeToggle variant="default" size="md" />
        <ThemeToggle variant="dropdown" size="lg" showLabel />
      </div>
    </motion.div>
  );
}

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
}

export function Section({
  id,
  children,
  className,
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
}: SectionProps) {
  return (
    <section id={id} className={cn("relative py-20 md:py-28", className)}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {(eyebrow || title || description) && (
          <div
            className={cn(
              "mb-12 max-w-3xl md:mb-16",
              align === "center" && "mx-auto text-center",
            )}
          >
            {eyebrow && (
              <p
                className={cn(
                  "mb-3 text-sm font-semibold uppercase tracking-[0.18em]",
                  tone === "dark" ? "text-teal-200" : "text-primary",
                )}
              >
                {eyebrow}
              </p>
            )}
            {title && (
              <h2
                className={cn(
                  "font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl",
                  tone === "dark" ? "text-white" : "text-foreground",
                )}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                className={cn(
                  "mt-4 text-base leading-relaxed sm:text-lg",
                  align === "center" && "mx-auto max-w-2xl",
                  tone === "dark" ? "text-white/70" : "text-muted",
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

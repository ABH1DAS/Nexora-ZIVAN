import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LogoProps {
  href?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  subtitle?: string;
  variant?: "default" | "light" | "white" | "hospital";
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  priority?: boolean;
  onClick?: () => void;
}

const sizeMap = {
  xs: {
    img: 28,
    imgClass: "h-7 w-7",
    textClass: "text-lg font-bold tracking-tight",
    subClass: "text-[9px] -mt-0.5",
  },
  sm: {
    img: 34,
    imgClass: "h-8 w-8 sm:h-[34px] sm:w-[34px]",
    textClass: "text-xl font-bold tracking-tight",
    subClass: "text-[10px] -mt-0.5",
  },
  md: {
    img: 42,
    imgClass: "h-10 w-10 sm:h-[42px] sm:w-[42px]",
    textClass: "text-2xl font-bold tracking-tight",
    subClass: "text-xs mt-0",
  },
  lg: {
    img: 52,
    imgClass: "h-12 w-12 sm:h-[52px] sm:w-[52px]",
    textClass: "text-3xl font-extrabold tracking-tight",
    subClass: "text-xs mt-0.5",
  },
  xl: {
    img: 68,
    imgClass: "h-16 w-16 sm:h-[68px] sm:w-[68px]",
    textClass: "text-4xl font-extrabold tracking-tight",
    subClass: "text-sm mt-1",
  },
};

export function Logo({
  href = "/",
  size = "md",
  showText = true,
  subtitle,
  variant = "default",
  className,
  imageClassName,
  textClassName,
  priority = false,
  onClick,
}: LogoProps) {
  const currentSize = sizeMap[size];
  const isDarkVariant = variant === "light" || variant === "white" || variant === "hospital";

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 sm:gap-3 group select-none", className)}>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 transition-transform duration-200 group-hover:scale-105",
          isDarkVariant ? "ring-white/20 bg-white/95" : "ring-black/5",
          currentSize.imgClass,
          imageClassName
        )}
      >
        <Image
          src="/logo.png"
          alt="ZIVAN Logo"
          width={currentSize.img}
          height={currentSize.img}
          className="h-full w-full object-contain p-0.5"
          priority={priority}
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              "font-display transition-colors",
              isDarkVariant ? "text-white" : "text-foreground",
              currentSize.textClass,
              textClassName
            )}
          >
            ZIVAN
          </span>
          {subtitle && (
            <span
              className={cn(
                "font-medium tracking-wide",
                isDarkVariant ? "text-white/60" : "text-muted",
                currentSize.subClass
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
      >
        {content}
      </Link>
    );
  }

  return content;
}

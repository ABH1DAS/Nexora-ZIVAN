"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

type Variant = "primary" | "secondary" | "ghost" | "emergency" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-dark shadow-[0_12px_30px_rgba(13,143,122,0.28)] hover:-translate-y-0.5",
  secondary:
    "bg-white/80 text-foreground border border-border hover:bg-white hover:border-slate-300 shadow-sm hover:-translate-y-0.5",
  ghost: "bg-transparent text-foreground hover:bg-black/5",
  emergency:
    "bg-emergency text-white hover:bg-emergency-dark shadow-[0_12px_30px_rgba(217,53,74,0.35)] hover:-translate-y-0.5",
  outline:
    "bg-transparent border border-primary/30 text-primary hover:bg-primary-soft hover:-translate-y-0.5",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm rounded-xl",
  md: "h-12 px-5 text-sm rounded-2xl",
  lg: "h-14 px-7 text-base rounded-2xl",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children, ...rest } =
    props;

  const classes = cn(
    "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
    variants[variant],
    sizes[size],
    className,
  );

  if ("href" in props && props.href) {
    const { href, ...linkRest } = rest as Omit<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      "href"
    > & { href: string };
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}

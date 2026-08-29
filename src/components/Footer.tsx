import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/health", label: "Health Dashboard" },
      { href: "/wellbeing", label: "Wellbeing" },
      { href: "/#features", label: "Fitness" },
      { href: "/#ai", label: "AI Assistant" },
      { href: "/emergency", label: "Emergency" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/about#contact", label: "Contact" },
      { href: "/about#careers", label: "Careers" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/about#help", label: "Help Center" },
      { href: "/about#privacy", label: "Privacy" },
      { href: "/#privacy", label: "Security" },
      { href: "/about#terms", label: "Terms" },
    ],
  },
  {
    title: "Emergency",
    links: [
      { href: "/emergency", label: "Emergency Support" },
      { href: "/emergency#contacts", label: "Emergency Contacts" },
      { href: "/hospital/login", label: "Hospital Portal" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#0c1f1b] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_2fr] lg:px-8">
        <div>
          <p className="font-display text-3xl font-bold tracking-tight">ZIVAN</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
            Your health. Your journey.
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.16em] text-teal-200/80">
            Track → Analyze → Improve → Challenge → Reward
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-white">{column.title}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/65 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 ZIVAN. Demo product website.</p>
          <p>
            ZIVAN does not diagnose conditions or replace professional medical care.
          </p>
        </div>
      </div>
    </footer>
  );
}

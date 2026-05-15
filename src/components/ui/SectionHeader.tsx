import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeader({ eyebrow, title, description, align = "left" }: SectionHeaderProps) {
  return (
    <div className={cn("mb-6 md:mb-7", align === "center" && "mx-auto max-w-narrow text-center")}>
      {eyebrow ? <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-brand-primary md:text-sm">{eyebrow}</p> : null}
      <h2 className="font-display text-2xl font-black text-text-main text-balance md:text-[30px]">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-relaxed text-text-muted text-pretty md:text-[15px]">{description}</p> : null}
    </div>
  );
}


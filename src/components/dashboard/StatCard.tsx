import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

export function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  delay = 0,
  tone = "text-brand-teal",
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  suffix?: string;
  delay?: number;
  tone?: string;
}) {
  return (
    <Reveal delay={delay} className="gl-card flex flex-col gap-3 rounded-[18px] border border-slate-400/15 bg-white/[0.03] p-5">
      <Icon className={`gl-ico ${tone}`} size={22} strokeWidth={1.8} aria-hidden="true" />
      <div className="flex items-baseline gap-1">
        <span className="font-display text-[32px] font-bold leading-none">{value}</span>
        {suffix && <span className="text-sm text-text-faint">{suffix}</span>}
      </div>
      <span className="text-sm text-text-muted">{label}</span>
    </Reveal>
  );
}

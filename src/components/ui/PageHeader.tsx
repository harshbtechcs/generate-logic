import { AnimatedHeader } from "@/components/motion/AnimatedHeader";
import { themeForKicker, type ThemeName } from "@/lib/themes";

/** Title block used at the top of inner pages — colour-themed and animated. */
export function PageHeader({ kicker, title, intro, theme, word }: { kicker: string; title: string; intro?: string; theme?: ThemeName; word?: string }) {
  return <AnimatedHeader kicker={kicker} title={title} intro={intro} theme={theme ?? themeForKicker(kicker)} word={word} />;
}

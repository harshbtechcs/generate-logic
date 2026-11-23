import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { Technologies } from "@/components/home/Technologies";
import { RoadmapPreview } from "@/components/home/RoadmapPreview";
import { PlaylistsSection } from "@/components/home/PlaylistsSection";
import { WhySection } from "@/components/home/WhySection";
import { ComingSoon } from "@/components/home/ComingSoon";
import { CtaBanner } from "@/components/home/CtaBanner";
import { PracticeSection } from "@/components/home/PracticeSection";
import { getChannelPlaylists } from "@/lib/youtube";
import { getLeaderboard } from "@/lib/leaderboard";
import { dailyQuestion } from "@/lib/daily";
import { istDayKey } from "@/lib/ist";
import { techBySlug } from "@/lib/data";

// Rebuilt at most every 15 minutes (new playlists, today's question, weekly top 3).
export const revalidate = 900;

async function practiceData() {
  try {
    const q = dailyQuestion(istDayKey());
    const { top } = await getLeaderboard("week", null, 3);
    return { daily: { question: q.question, tool: techBySlug[q.tool]?.name ?? q.tool, level: q.level }, top };
  } catch {
    // Never let the teaser break the homepage.
    return { daily: null, top: [] };
  }
}

export default async function HomePage() {
  const [playlists, practice] = await Promise.all([getChannelPlaylists(), practiceData()]);
  return (
    <>
      <Hero />
      <Marquee />
      <Technologies />
      <RoadmapPreview />
      <PlaylistsSection playlists={playlists} />
      <PracticeSection daily={practice.daily} top={practice.top} />
      <WhySection />
      <ComingSoon />
      <CtaBanner />
    </>
  );
}

import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { Technologies } from "@/components/home/Technologies";
import { RoadmapPreview } from "@/components/home/RoadmapPreview";
import { PlaylistsSection } from "@/components/home/PlaylistsSection";
import { WhySection } from "@/components/home/WhySection";
import { ComingSoon } from "@/components/home/ComingSoon";
import { CtaBanner } from "@/components/home/CtaBanner";
import { getChannelPlaylists } from "@/lib/youtube";

// Re-check YouTube for new playlists at most once an hour.
export const revalidate = 3600;

export default async function HomePage() {
  const playlists = await getChannelPlaylists();
  return (
    <>
      <Hero />
      <Marquee />
      <Technologies />
      <RoadmapPreview />
      <PlaylistsSection playlists={playlists} />
      <WhySection />
      <ComingSoon />
      <CtaBanner />
    </>
  );
}

import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export const metadata: Metadata = { title: "Practical projects" };

export default function ProjectsPage() {
  return (
    <ComingSoonPage
      kicker="PROJECTS" word="BUILD"
      title="Practical projects"
      text="Real-world Cloud and DevOps projects, with architecture diagrams, source code and deployment steps, are on the way."
    />
  );
}

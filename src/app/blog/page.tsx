import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export const metadata: Metadata = { title: "Technical articles" };

export default function BlogPage() {
  return (
    <ComingSoonPage
      kicker="BLOG"
      title="Technical articles"
      text="Deep dives on Docker, Kubernetes, Terraform, AWS and more are coming soon."
    />
  );
}

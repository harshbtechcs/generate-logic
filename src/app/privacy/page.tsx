import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <ComingSoonPage
      kicker="LEGAL"
      title="Privacy Policy"
      text="The privacy policy will be published before user accounts go live."
    />
  );
}

import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <ComingSoonPage
      kicker="LEGAL"
      title="Terms & Conditions"
      text="The terms and conditions will be published before user accounts go live."
    />
  );
}

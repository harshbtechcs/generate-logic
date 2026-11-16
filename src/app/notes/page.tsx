import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export const metadata: Metadata = { title: "Notes & documentation" };

export default function NotesPage() {
  return (
    <ComingSoonPage
      kicker="NOTES"
      title="Notes & documentation"
      text="PDF notes for every playlist will be published here as each lecture series is completed."
    />
  );
}

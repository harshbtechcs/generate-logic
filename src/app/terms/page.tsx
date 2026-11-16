import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/ui/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms for using the Generate Logic learning platform.",
};

export default function TermsPage() {
  return (
    <LegalPage
      kicker="LEGAL"
      title="Terms & Conditions"
      updated="16 November 2026"
      intro="By using generatelogic.in or creating an account, you agree to these terms. Please read them — they are short."
    >
      <h2>1. The service</h2>
      <p>
        Generate Logic is a free learning platform for Cloud and DevOps, run by {site.owner}. It brings together
        videos from the Generate Logic YouTube channel, learning paths, notes and progress tracking. Features may
        change, be added or be removed over time.
      </p>

      <h2>2. Your account</h2>
      <ul>
        <li>Give accurate details and keep your password private. You are responsible for activity on your account.</li>
        <li>One person per account. Tell us at <a href={`mailto:${site.email}`}>{site.email}</a> if you think your account was misused.</li>
        <li>
          You can delete your account at any time from <Link href="/dashboard/settings">Account settings</Link>.
        </li>
      </ul>

      <h2>3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>break the law, or try to access other users&rsquo; data or accounts;</li>
        <li>attack, overload, scrape at scale or try to bypass the security of the platform;</li>
        <li>copy, resell or republish our notes, articles or other materials as your own.</li>
      </ul>
      <p>We may suspend or disable accounts that break these rules.</p>

      <h2>4. Content and ownership</h2>
      <p>
        Notes, articles, roadmaps, design and code of this website belong to Generate Logic. You may use them for your
        own personal learning. Videos are hosted on YouTube and are also subject to{" "}
        <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">
          YouTube&rsquo;s Terms of Service
        </a>
        . Names and logos of technologies (Docker, Kubernetes, AWS and others) belong to their owners and are used
        only to identify those technologies.
      </p>

      <h2>5. Educational content — no warranty</h2>
      <p>
        Lessons are provided for learning. Commands and configurations shown may affect real systems and cloud bills —
        always practise in a test environment and check costs before running anything in production. The platform is
        provided &ldquo;as is&rdquo;, and to the extent the law allows, Generate Logic is not liable for losses arising
        from using the content or the service.
      </p>

      <h2>6. Privacy</h2>
      <p>
        How we handle your personal data is explained in our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>7. Changes and governing law</h2>
      <p>
        We may update these terms; the date at the top shows the latest version. Continuing to use the service means
        you accept the updated terms. These terms are governed by the laws of India.
      </p>

      <h2>8. Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </LegalPage>
  );
}

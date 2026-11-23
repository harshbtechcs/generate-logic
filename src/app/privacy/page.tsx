import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/ui/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Generate Logic collects, uses and protects your personal data.",
};

// Keep this page in sync with what the code actually does. If you add analytics,
// new third-party services or new data fields, update the sections below.
export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="LEGAL"
      title="Privacy Policy"
      updated="16 November 2026"
      intro="This policy explains what personal data Generate Logic collects, why, who it is shared with, and the choices and rights you have."
    >
      <h2>1. Who we are</h2>
      <p>
        Generate Logic (<strong>generatelogic.in</strong>) is a free Cloud &amp; DevOps learning platform run by{" "}
        {site.owner} in India, alongside the Generate Logic YouTube channel. For this policy, Generate Logic is the
        &ldquo;Data Fiduciary&rdquo; under India&rsquo;s Digital Personal Data Protection Act, 2023 and the rules
        made under it. You can contact us at <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>2. What we collect</h2>
      <ul>
        <li>
          <strong>Account details:</strong> your name and email address. If you sign up with email, your password is
          stored only as a one-way hash — we can never see it. If you sign in with Google, we receive your name,
          email address and profile photo from Google; we never receive your Google password.
        </li>
        <li>
          <strong>Learning data:</strong> lessons you mark as complete, playlists you save, learning paths you are
          enrolled in, your quiz answers and scores, and a history of recent activity (for example &ldquo;opened
          playlist&rdquo;), used to show your progress, streak and quiz results.
        </li>
        <li>
          <strong>Sign-in sessions:</strong> a session record with the date, your IP address and browser type, used
          to keep you signed in and protect your account.
        </li>
      </ul>
      <p>We do not collect payment details, and we do not use advertising or tracking cookies.</p>

      <h2>3. Why we use it</h2>
      <ul>
        <li>To create and secure your account and keep you signed in.</li>
        <li>To show your personal dashboard: progress, streak, saved playlists and history.</li>
        <li>To send emails you need: email verification and password reset.</li>
        <li>To keep the platform safe, for example limiting repeated failed sign-in attempts.</li>
      </ul>
      <p>We use your data only for these purposes. We do not sell or rent your personal data to anyone.</p>

      <h2>4. Cookies</h2>
      <p>
        We use only essential cookies that keep you signed in. Videos are embedded through YouTube&rsquo;s
        privacy-enhanced mode (youtube-nocookie.com); when you play a video, YouTube may set its own cookies under{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google&rsquo;s Privacy Policy
        </a>
        .
      </p>

      <h2>5. Services that process data for us</h2>
      <p>We rely on these providers, who process data only to run the platform:</p>
      <ul>
        <li><strong>Google</strong> — &ldquo;Continue with Google&rdquo; sign-in, and YouTube for video playback.</li>
        <li><strong>Neon</strong> — hosts our PostgreSQL database.</li>
        <li><strong>Amazon Web Services (AWS)</strong> — hosts the website.</li>
        <li><strong>Resend</strong> — delivers verification and password-reset emails.</li>
      </ul>
      <p>Some of these providers may store data on servers outside India.</p>

      <h2>6. How long we keep it</h2>
      <p>
        We keep your data while your account is active. When you delete your account, your profile, progress,
        bookmarks, history and sessions are permanently deleted straight away. Server logs that may contain your IP
        address are kept for a limited time for security and then removed.
      </p>

      <h2>7. Your rights</h2>
      <ul>
        <li><strong>Access and correction:</strong> see and update your name and details in your account settings.</li>
        <li>
          <strong>Deletion / withdrawing consent:</strong> delete your account at any time from{" "}
          <Link href="/dashboard/settings">Account settings</Link>. This removes all your personal data.
        </li>
        <li><strong>Questions or complaints:</strong> write to <a href={`mailto:${site.email}`}>{site.email}</a>. We aim to reply within 7 days.</li>
        <li>
          If you are not satisfied with our response, you may complain to the Data Protection Board of India.
        </li>
      </ul>

      <h2>8. Security</h2>
      <p>
        Passwords are hashed, connections are encrypted with HTTPS, sign-in cookies are signed and encrypted, and
        every request for personal data is checked so that you can only ever see your own data. No system is
        perfectly secure; if a breach affecting your data occurs, we will inform you and the authorities as required
        by law.
      </p>

      <h2>9. Age</h2>
      <p>
        Accounts are intended for people aged 18 or older. If you are under 18, please use the site without an
        account, or contact us so a parent or guardian can give consent.
      </p>

      <h2>10. Changes</h2>
      <p>
        If we change this policy, we will update the date at the top of this page and, for important changes, notify
        signed-in users.
      </p>
    </LegalPage>
  );
}

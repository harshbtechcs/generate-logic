import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-site flex-col items-center justify-center gap-5 px-5 py-24 text-center">
      <p className="font-mono text-sm text-brand-teal">$ curl -I /this-page → 404 Not Found</p>
      <h1 className="font-display text-5xl font-bold">Page not found</h1>
      <p className="max-w-md text-text-muted">The page you are looking for does not exist or has moved.</p>
      <Link href="/" className="gl-btn rounded-xl bg-brand-teal px-6 py-3.5 font-semibold text-ink-900">
        Back to home
      </Link>
    </div>
  );
}

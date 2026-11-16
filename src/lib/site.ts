export const site = {
  name: "Generate Logic",
  tagline: "Learn. Build. Automate. Deploy.",
  description:
    "Practical Cloud and DevOps tutorials, hands-on projects, technical documentation and structured learning paths.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  owner: "Harsh Yadav",
  email: "generate.logiic@gmail.com",
  youtube: "https://www.youtube.com/@GENERATELOGIC",
  youtubeHandle: "@GENERATELOGIC",
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Learning Paths", href: "/#paths" },
  { label: "Playlists", href: "/playlists" },
  { label: "Notes", href: "/notes" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about" },
] as const;

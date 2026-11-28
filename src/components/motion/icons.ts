import { BookOpen, Box, Brain, CalendarCheck, Cloud, Code2, Cpu, Crown, FileText, Flame, GitBranch, GitMerge, Hexagon, Layers, Map, Medal, Play, Rocket, Server, Shield, Sparkles, Star, Terminal, Trophy, User, Workflow, type LucideIcon } from "lucide-react";
import type { IconName } from "@/lib/themes";

export const ICONS: Record<IconName, LucideIcon> = {
  box: Box, hexagon: Hexagon, layers: Layers, cloud: Cloud, server: Server, cpu: Cpu, terminal: Terminal, git: GitBranch, merge: GitMerge,
  workflow: Workflow, brain: Brain, calendar: CalendarCheck, flame: Flame, trophy: Trophy, crown: Crown, medal: Medal, map: Map, play: Play,
  book: BookOpen, code: Code2, sparkles: Sparkles, shield: Shield, user: User, rocket: Rocket, star: Star, file: FileText,
};

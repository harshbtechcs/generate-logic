export type Level = "beginner" | "intermediate" | "advanced";

export type Question = {
  id: string;
  tool: string;
  level: Level;
  question: string;
  options: string[]; // options[0] is correct
  explanation: string;
};

/** [level, question, options (first one is correct), explanation] */
export type Row = [Level, string, string[], string];

export const B: Level = "beginner";
export const I: Level = "intermediate";
export const A: Level = "advanced";

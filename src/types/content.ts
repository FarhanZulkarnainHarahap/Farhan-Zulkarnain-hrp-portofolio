/** Shapes of public collections read on the client (/api/skills, /api/experiences). */
export interface Skill {
  id: string;
  name: string;
  category: string;
}
export interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  technologies: string[];
  sortOrder?: number;
}

import {
  DEFAULT_ABOUT_HIGHLIGHTS,
  DEFAULT_EDUCATION,
  DEFAULT_INTERNSHIP_POINTS,
  DEFAULT_SKILLS,
  EducationItem,
  SkillItem,
} from "./defaults";

export function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export interface ParsedProfile {
  id: string;
  fullName: string;
  designation: string;
  headline: string;
  heroIntro: string;
  biography: string;
  aboutHighlights: string[];
  heroImageUrl: string;
  aboutImageUrl: string;
  resumeUrl: string | null;
  location: string;
  email: string;
  phone: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  internshipChannel: string;
  internshipRole: string;
  internshipDuration: string;
  internshipPoints: string[];
  education: EducationItem[];
  skills: SkillItem[];
  updatedAt: string;
}

export function serializeProfile(row: {
  id: string;
  fullName: string;
  designation: string;
  headline: string;
  heroIntro: string;
  biography: string;
  aboutHighlights: string;
  heroImageUrl: string;
  aboutImageUrl: string;
  resumeUrl: string | null;
  location: string;
  email: string;
  phone: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  internshipChannel: string;
  internshipRole: string;
  internshipDuration: string;
  internshipPoints: string;
  educationJson: string;
  skillsJson: string;
  updatedAt: Date;
}): ParsedProfile {
  return {
    id: row.id,
    fullName: row.fullName,
    designation: row.designation,
    headline: row.headline,
    heroIntro: row.heroIntro,
    biography: row.biography,
    aboutHighlights: safeJsonParse<string[]>(row.aboutHighlights, DEFAULT_ABOUT_HIGHLIGHTS),
    heroImageUrl: row.heroImageUrl,
    aboutImageUrl: row.aboutImageUrl,
    resumeUrl: row.resumeUrl,
    location: row.location,
    email: row.email,
    phone: row.phone,
    instagramUrl: row.instagramUrl,
    linkedinUrl: row.linkedinUrl,
    youtubeUrl: row.youtubeUrl,
    internshipChannel: row.internshipChannel,
    internshipRole: row.internshipRole,
    internshipDuration: row.internshipDuration,
    internshipPoints: safeJsonParse<string[]>(row.internshipPoints, DEFAULT_INTERNSHIP_POINTS),
    education: safeJsonParse<EducationItem[]>(row.educationJson, DEFAULT_EDUCATION),
    skills: safeJsonParse<SkillItem[]>(row.skillsJson, DEFAULT_SKILLS),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function isEditablePlaceholder(val: string | null | undefined): boolean {
  if (!val) return true;
  const trimmed = val.trim();
  return !trimmed || trimmed.startsWith("[Editable");
}

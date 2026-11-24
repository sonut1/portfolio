export const VIDEO_CATEGORIES = [
  "News Reporting",
  "Anchoring",
  "Ground Reporting",
  "Interviews",
  "News Reels",
  "Special Coverage",
] as const;

export const GALLERY_CATEGORIES = [
  "Reporting Moments",
  "Newsroom Activities",
  "Interviews",
  "Events & Media Coverage",
  "Professional Portraits",
] as const;

export const ARTICLE_CATEGORIES = [
  "News Report",
  "Feature Story",
  "Ground Dispatch",
  "Interview",
  "Editorial",
  "Special Coverage",
] as const;

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
  location: string;
  notes?: string;
}

export interface SkillItem {
  name: string;
  domain: "Broadcast & Anchoring" | "Field & Editorial" | "Research & Communication";
  focus: string;
}

export const DEFAULT_ABOUT_HIGHLIGHTS: string[] = [
  "Interest in current affairs and journalism",
  "News reporting and storytelling",
  "Anchoring and on-camera presentation",
  "Interviewing and communication",
  "Research and fact-checking",
  "Passion for responsible journalism",
];

export const DEFAULT_INTERNSHIP_POINTS: string[] = [
  "News reporting and story preparation.",
  "Researching news topics and gathering information.",
  "Supporting interview and reporting activities.",
  "Understanding newsroom workflows.",
  "Developing communication and presentation skills.",
];

export const DEFAULT_EDUCATION: EducationItem[] = [
  {
    id: "edu-bmc",
    degree: "Bachelor of Mass Communication",
    institution: "Ranchi University",
    period: "2024–2027",
    location: "Ranchi, Jharkhand",
    notes: "Pursuing undergraduate studies in journalism, broadcast production, and mass media communication.",
  },
  {
    id: "edu-class12",
    degree: "Class 12",
    institution: "Ursuline Inter College, Ranchi",
    period: "2023–2024",
    location: "Ranchi, Jharkhand",
    notes: "Higher secondary education completed in Ranchi.",
  },
];

export const DEFAULT_SKILLS: SkillItem[] = [
  { name: "News Reporting", domain: "Field & Editorial", focus: "Primary field coverage & structured dispatches" },
  { name: "News Writing", domain: "Field & Editorial", focus: "Clear, factual copy for print and broadcast" },
  { name: "Anchoring", domain: "Broadcast & Anchoring", focus: "Studio desk delivery & live bulletin pacing" },
  { name: "Public Speaking", domain: "Broadcast & Anchoring", focus: "Confident articulation in live environments" },
  { name: "On-Camera Presentation", domain: "Broadcast & Anchoring", focus: "Poised lens presence & teleprompter control" },
  { name: "Interviewing", domain: "Field & Editorial", focus: "Structured questioning & active listening" },
  { name: "Story Research", domain: "Research & Communication", focus: "Background verification & source preparation" },
  { name: "Fact-Checking", domain: "Research & Communication", focus: "Verification discipline before publication" },
  { name: "Voice Modulation", domain: "Broadcast & Anchoring", focus: "Clarity, tone control, and vocal projection" },
  { name: "Communication Skills", domain: "Research & Communication", focus: "Accessible, audience-first storytelling" },
  { name: "Media Presentation", domain: "Broadcast & Anchoring", focus: "Editorial framing across video & digital formats" },
  { name: "Current Affairs Awareness", domain: "Research & Communication", focus: "Tracking regional, national, and civic developments" },
];

export const DEFAULT_PROFILE_DATA = {
  id: "default",
  fullName: "Sanjana Pandey",
  designation: "News Reporter | Journalist | News Anchor",
  headline: "Telling Stories. Reporting Truth. Connecting People.",
  heroIntro:
    "Aspiring news reporter, journalist, and news anchor based in Ranchi, pursuing a Bachelor of Mass Communication at Ranchi University with hands-on newsroom internship experience at Global Awaaz News Channel.",
  biography:
    "I am Sanjana Pandey, a Bachelor of Mass Communication student at Ranchi University (2024–2027) and an aspiring broadcast journalist committed to clear, responsible storytelling.\n\nThrough my News Reporting Internship at Global Awaaz News Channel (August 2026 – November 2026), I am building practical experience in newsroom workflows, story research, interview preparation, and on-camera presentation.\n\nDriven by curiosity about current affairs and public interest journalism, my focus lies in asking thoughtful questions, verifying facts carefully, and presenting stories that connect meaningfully with viewers.",
  aboutHighlights: JSON.stringify(DEFAULT_ABOUT_HIGHLIGHTS),
  heroImageUrl: "/images/sanjana-hero.jpg",
  aboutImageUrl: "/images/sanjana-about.jpg",
  resumeUrl: null as string | null,
  location: "Ranchi, Jharkhand, India",
  email: "sp6154817@gmail.com",
  phone: "92XXXXXXX7",
  instagramUrl: "https://www.instagram.com/sanjana_pndy/",
  linkedinUrl: "https://www.linkedin.com/in/sanjana-pandey14/",
  youtubeUrl: "",
  internshipChannel: "Global Awaaz News Channel",
  internshipRole: "News Reporting Intern",
  internshipDuration: "August 2026 – November 2026",
  internshipPoints: JSON.stringify(DEFAULT_INTERNSHIP_POINTS),
  educationJson: JSON.stringify(DEFAULT_EDUCATION),
  skillsJson: JSON.stringify(DEFAULT_SKILLS),
};

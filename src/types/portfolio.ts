export type { ParsedProfile } from "@/lib/profile-parser";
export type { EducationItem, SkillItem } from "@/lib/defaults";

export interface VideoItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  sourceType: "MP4" | "YOUTUBE" | "INSTAGRAM" | string;
  videoUrl: string;
  thumbnailUrl: string | null;
  location: string | null;
  recordedDate: string;
  featured: boolean;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleItem {
  id: string;
  slug: string;
  headline: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  category: string;
  tags: string; // JSON string array
  location: string | null;
  relatedVideoId: string | null;
  relatedVideo?: {
    id: string;
    slug: string;
    title: string;
    sourceType?: string;
    videoUrl?: string;
    thumbnailUrl?: string | null;
  } | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  title: string | null;
  caption: string;
  category: string;
  imageUrl: string;
  takenDate: string | null;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  organization: string | null;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

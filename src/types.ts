export type CreativeProjectLinkPlatform =
  | "YOUTUBE"
  | "SPOTIFY"
  | "SOUNDCLOUD"
  | "INSTAGRAM_REELS"
  | "TIKTOK"
  | "WEBSITE"
  | "OTHER";

export type CreativeProjectLink = {
  id: string;
  platform: CreativeProjectLinkPlatform;
  url: string;
  label: string | null;
  sortOrder: number;
};

export type CreativeProject = {
  id: string;
  title: string;
  description: string | null;
  startYear: number;
  startMonth: number;
  lyrics: string | null;
  creationMethod: string | null;
  links: CreativeProjectLink[];
  createdAt: string;
  updatedAt: string;
};

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string | null;
};

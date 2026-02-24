
export type Language = 'te' | 'hi' | 'en';

export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'CRP' | 'Farmer';
  email: string;
  phone: string;
  location: string;
  password?: string;
}

export interface Principle {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export interface SubHeading {
  id: string;
  title: string;
  content: string;
}

export interface HandbookItem {
  id: string;
  name: string;
  mediaType: 'image' | 'video' | 'none';
  mediaData: string; // Base64 or URL
  subHeadings: SubHeading[];
}

export interface VideoItem {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
}

export interface AppData {
  principles: Principle[];
  categoryLabels: Record<string, string>;
  videos: VideoItem[];
  handbook: {
    [key: string]: HandbookItem[];
  };
}

export type View = 
  | 'auth' 
  | 'verification-pending' 
  | 'home' 
  | 'principles' 
  | 'chat' 
  | 'admin' 
  | 'admin-login' 
  | 'handbook-categories' 
  | 'handbook-items' 
  | 'handbook-item-detail'
  | 'video-view';

export interface Translations {
  home: string;
  chat: string;
  handbook: string;
  principles: string;
  video: string;
  back: string;
  welcome: string;
  tagline: string;
  askAi: string;
  viewAll: string;
  note: string;
  noteContent: string;
  popularItems: string;
  adminTitle: string;
  edit: string;
  save: string;
  cancel: string;
  delete: string;
  addItem: string;
  content: string;
  adminPanel: string;
  subHeadings: string;
  addSubHeading: string;
  crops: string;
  concoctions: string;
  pestControl: string;
  successStories: string;
  mediaType: string;
  uploadMedia: string;
  nameLabel: string;
  addCategory: string;
  categoryName: string;
  deleteCategory: string;
  weatherTitle: string;
  temperature: string;
  humidity: string;
  condition: string;
  forecastTitle: string;
  pmdsCalculator: string;
  acresLabel: string;
  calculate: string;
  totalSeedsNeeded: string;
  seedVariety: string;
  quantity: string;
  shareTitle: string;
  shareBody: string;
  thinking: string;
  videoUrlLabel: string;
  addVideo: string;
  videoTitle: string;
}

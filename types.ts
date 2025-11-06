export interface Topic {
  id: string;
  name: string;
  description: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  // Stats can be a JSON string from the sheet or a parsed object
  stats: any; 
}

export interface Sponsor {
  name: string;
  logoUrl: string;
  websiteUrl: string;
  isActive: boolean;
  content: string;
}
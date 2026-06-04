import { ObjectId } from 'mongodb';

export interface Project {
  _id?: ObjectId | string;
  title: string;
  studentName: string;
  linkedinUrl?: string;
  description: string;
  topic: string;
  techStack: string[];
  aiToolsUsed: string;
  repoUrl: string;
  videoUrl?: string;
  imageUrl?: string;
  createdAt: Date;
  status?: 'pending' | 'approved';
}

export type ProjectWithId = Project & { _id: string };

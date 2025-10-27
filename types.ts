import { Chat, Part } from "@google/genai";

export enum Role {
  USER = 'user',
  BOT = 'bot',
  SYSTEM = 'system',
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  imageUrl?: string;
  options?: string[];
  isQuestion?: boolean;
}

export interface ImagePart {
  mimeType: string;
  data: string;
}

export interface ChatService {
  chat: Chat | null;
  initializeChat: () => Promise<void>;
  streamResponse: (prompt: string, image?: ImagePart) => Promise<string>;
}
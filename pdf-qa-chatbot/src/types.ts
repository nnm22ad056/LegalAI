export enum IconType {
  Logo,
  Home,
  Chat,
  History,
  File,
  Folder,
  Share,
  Database,
  Help,
  Settings,
  User,
  Sparkles,
  Paperclip,
  ChevronDown,
  Search,
  UserPlus,
  Plus,
  Envelope,
  Comment,
  Code,
  ArrowUp,
  ChevronLeft,
  EllipsisVertical,
  Pencil,
  Trash,
}

export type Source = {
  content: string;
  page: string;
};

export type Message = {
  sender: 'user' | 'ai';
  text: string;
  sources?: Source[]; // Optional sources for AI messages
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  collectionName?: string; // Optional, for RAG chats
};

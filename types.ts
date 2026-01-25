import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  action?: () => void;
}

export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface UseCase {
  title: string;
  description: string;
  // image: string; // Removed in favor of diagramData
  diagramData: MapState; // Live data for rendering
  tags: string[];
  prompt: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SocialLink {
  platform: string;
  href: string;
  icon: LucideIcon;
}

// --- Map App Types ---

export type NodeType = 'idea' | 'process' | 'step' | 'root' | 'topic' | 'subtopic' | 'sticky' | 'text' | 'image' | 'database';
export type NodeShape = 'rectangle' | 'rounded' | 'circle' | 'diamond' | 'cylinder';
export type NodeBorderStyle = 'solid' | 'dashed' | 'dotted';
export type MapStyle = 'flowchart' | 'mindmap' | 'concept' | 'tree';
export type ViewMode = 'canvas' | 'outline' | 'json';
export type InteractionMode = 'pointer' | 'pan';

export interface UserProfile {
  id: string;
  name: string;
  color: string;
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  nodeId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: number;
}

export interface Cursor {
  userId: string;
  userName: string;
  color: string;
  x: number;
  y: number;
  lastActive: number;
}

export interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  align?: 'left' | 'center' | 'right';
  fontSize?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string; // Hex code or tailwind class
}

export interface NodeData {
  id: string;
  x: number;
  y: number;
  label: string;
  type: NodeType;
  shape?: NodeShape;
  color?: string; // Background color class
  borderColor?: string; // Border color class
  borderStyle?: NodeBorderStyle;
  textStyle?: TextStyle;
  icon?: string; // Icon key
  width?: number; // For resizing (future)
  height?: number;
  src?: string; // For image nodes
}

export interface EdgeData {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface MapState {
  nodes: NodeData[];
  edges: EdgeData[];
}

export interface MapMetadata {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string; // Placeholder for future
}

export interface MapDocument extends MapMetadata {
  data: MapState;
  comments?: Comment[]; // Embedded comments for simplicity in local storage
}
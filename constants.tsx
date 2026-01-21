import { 
  Users, 
  Layout, 
  Zap, 
  FolderGit2, 
  Cloud, 
  MonitorSmartphone, 
  Github, 
  MessageCircle, 
  Twitter 
} from 'lucide-react';
import { NavItem, Feature, UseCase, FAQItem, SocialLink } from './types';

export const APP_NAME = "Cooketh Flow";
export const TAGLINE = "Think it. Map it. Cook it.";

export const NAV_ITEMS: NavItem[] = [
  { label: 'Features', href: '#features' },
  { label: 'Use Cases', href: '#use-cases' },
  { label: 'Community', href: '#community' },
  { label: 'FAQ', href: '#faq' },
];

export const FEATURES: Feature[] = [
  {
    title: "Prompt to Map",
    description: "Simply type your idea, and watch Cooketh Flow generate a structured visual map instantly using smart heuristic parsing.",
    icon: Zap,
  },
  {
    title: "Work Together, Anywhere",
    description: "Real-time collaboration engine allows your team to co-create flows instantly, no matter where they are.",
    icon: Users,
  },
  {
    title: "All-in-One Workspace",
    description: "Seamlessly combine brainstorming sticky notes, technical flowcharts, and complex workflows in one infinite canvas.",
    icon: Layout,
  },
  {
    title: "Project Organization",
    description: "Keep your ideas structured. Group related boards, tag diagrams, and manage permissions efficiently.",
    icon: FolderGit2,
  },
  {
    title: "Cloud Sync",
    description: "Powered by Supabase. Your work is automatically saved and synchronized across all your devices.",
    icon: Cloud,
  },
  {
    title: "Works Everywhere",
    description: "A responsive experience designed for desktop, tablet, and mobile browsers. Sketch ideas on the go.",
    icon: MonitorSmartphone,
  },
];

export const USE_CASES: UseCase[] = [
  {
    title: "Brainstorming Sessions",
    description: "Unleash creativity with your team. Use sticky notes, shapes, and connectors to dump ideas quickly and organize them later.",
    image: "https://picsum.photos/800/600?random=1",
    tags: ["Ideation", "Strategy"],
    prompt: "Generate a mind map for a startup marketing strategy including social media, content, and paid ads."
  },
  {
    title: "Workflow Mapping",
    description: "Visualize complex user journeys, backend logic, or organizational processes with precise connector tools and auto-layout.",
    image: "https://picsum.photos/800/600?random=2",
    tags: ["Engineering", "Product"],
    prompt: "Create a flowchart step by step for a user registration process including email verification and database save."
  },
  {
    title: "Study Planning",
    description: "Break down complex topics into digestible visual chunks. Create roadmaps for learning new skills efficiently.",
    image: "https://picsum.photos/800/600?random=3",
    tags: ["Education", "Planning"],
    prompt: "Create a study roadmap for learning React.js in 30 days covering components, hooks, and state management."
  }
];

export const FAQS: FAQItem[] = [
  {
    question: "What is Cooketh Flow?",
    answer: "Cooketh Flow is an open-source visual thinking tool designed for real-time collaboration, flowcharting, and infinite canvas brainstorming."
  },
  {
    question: "How does the prompt-to-map work?",
    answer: "Our system analyzes your natural language prompt to identify key topics, steps, and relationships, then automatically layouts nodes and connections on the canvas."
  },
  {
    question: "Is Cooketh Flow free?",
    answer: "Yes! Cooketh Flow is open-source and free to use. You can also self-host it if you prefer complete control over your data."
  },
  {
    question: "How can I contribute?",
    answer: "We welcome contributions! Check out our GitHub repository to find issues, submit pull requests, or improve documentation."
  }
];

export const SOCIAL_LINKS: SocialLink[] = [
  { platform: "GitHub", href: "https://github.com", icon: Github },
  { platform: "Discord", href: "https://discord.com", icon: MessageCircle },
  { platform: "Twitter", href: "https://twitter.com", icon: Twitter },
];
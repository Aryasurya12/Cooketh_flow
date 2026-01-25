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
    tags: ["Ideation", "Strategy"],
    prompt: "Generate a mind map for a startup marketing strategy including social media, content, and paid ads.",
    diagramData: {
      nodes: [
        { id: 'root', x: 350, y: 250, label: 'Startup Marketing', type: 'root', shape: 'rounded', color: 'bg-brand-500', borderColor: 'border-brand-600', width: 180, height: 80, textStyle: { bold: true, align: 'center' } },
        { id: 'social', x: 100, y: 100, label: 'Social Media', type: 'topic', shape: 'circle', color: 'bg-blue-100', width: 120, height: 120, textStyle: { align: 'center' } },
        { id: 'content', x: 600, y: 150, label: 'Content', type: 'topic', shape: 'circle', color: 'bg-green-100', width: 120, height: 120, textStyle: { align: 'center' } },
        { id: 'ads', x: 350, y: 450, label: 'Paid Ads', type: 'topic', shape: 'circle', color: 'bg-purple-100', width: 120, height: 120, textStyle: { align: 'center' } },
        // Leaves
        { id: 'twitter', x: 50, y: 250, label: 'Twitter/X', type: 'subtopic', shape: 'rectangle', color: 'bg-white', width: 100, height: 50 },
        { id: 'blog', x: 750, y: 100, label: 'Blog Posts', type: 'subtopic', shape: 'rectangle', color: 'bg-white', width: 100, height: 50 },
        { id: 'video', x: 750, y: 250, label: 'Video', type: 'subtopic', shape: 'rectangle', color: 'bg-white', width: 100, height: 50 },
        { id: 'google', x: 200, y: 550, label: 'Google Ads', type: 'subtopic', shape: 'rectangle', color: 'bg-white', width: 100, height: 50 },
        { id: 'meta', x: 500, y: 550, label: 'Meta Ads', type: 'subtopic', shape: 'rectangle', color: 'bg-white', width: 100, height: 50 },
      ],
      edges: [
        { id: 'e1', from: 'root', to: 'social' },
        { id: 'e2', from: 'root', to: 'content' },
        { id: 'e3', from: 'root', to: 'ads' },
        { id: 'e4', from: 'social', to: 'twitter' },
        { id: 'e5', from: 'content', to: 'blog' },
        { id: 'e6', from: 'content', to: 'video' },
        { id: 'e7', from: 'ads', to: 'google' },
        { id: 'e8', from: 'ads', to: 'meta' },
      ]
    }
  },
  {
    title: "Workflow Mapping",
    description: "Visualize complex user journeys, backend logic, or organizational processes with precise connector tools and auto-layout.",
    tags: ["Engineering", "Product"],
    prompt: "Create a flowchart step by step for a user registration process including email verification and database save.",
    diagramData: {
      nodes: [
        { id: 'start', x: 350, y: 50, label: 'Start', type: 'step', shape: 'rounded', color: 'bg-slate-200', width: 100, height: 50, textStyle: { align: 'center' } },
        { id: 'form', x: 320, y: 150, label: 'Register Form', type: 'process', shape: 'rectangle', color: 'bg-white', width: 160, height: 80, icon: 'text', textStyle: { align: 'center' } },
        { id: 'verify', x: 330, y: 280, label: 'Email Valid?', type: 'process', shape: 'diamond', color: 'bg-yellow-50', borderColor: 'border-yellow-500', width: 140, height: 140, textStyle: { bold: true, fontSize: 'sm', align: 'center' } },
        { id: 'save', x: 150, y: 450, label: 'Save to DB', type: 'database', shape: 'cylinder', color: 'bg-green-50', borderColor: 'border-green-500', width: 120, height: 100, icon: 'database', textStyle: { align: 'center' } },
        { id: 'error', x: 550, y: 450, label: 'Show Error', type: 'process', shape: 'rectangle', color: 'bg-red-50', width: 140, height: 80, textStyle: { align: 'center' } },
        { id: 'end', x: 350, y: 600, label: 'End', type: 'step', shape: 'rounded', color: 'bg-slate-200', width: 100, height: 50, textStyle: { align: 'center' } },
      ],
      edges: [
        { id: 'e1', from: 'start', to: 'form' },
        { id: 'e2', from: 'form', to: 'verify' },
        { id: 'e3', from: 'verify', to: 'save', label: 'Yes' },
        { id: 'e4', from: 'verify', to: 'error', label: 'No' },
        { id: 'e5', from: 'save', to: 'end' },
        { id: 'e6', from: 'error', to: 'form' },
      ]
    }
  },
  {
    title: "Study Planning",
    description: "Break down complex topics into digestible visual chunks. Create roadmaps for learning new skills efficiently.",
    tags: ["Education", "Planning"],
    prompt: "Create a study roadmap for learning React.js in 30 days covering components, hooks, and state management.",
    diagramData: {
      nodes: [
        { id: 'w1', x: 50, y: 200, label: 'Week 1:\nJS & JSX', type: 'step', shape: 'rectangle', color: 'bg-blue-50', borderColor: 'border-blue-400', width: 160, height: 100, textStyle: { align: 'center', bold: true } },
        { id: 'w2', x: 280, y: 200, label: 'Week 2:\nComponents', type: 'step', shape: 'rectangle', color: 'bg-indigo-50', borderColor: 'border-indigo-400', width: 160, height: 100, textStyle: { align: 'center', bold: true } },
        { id: 'w3', x: 510, y: 200, label: 'Week 3:\nHooks & State', type: 'step', shape: 'rectangle', color: 'bg-purple-50', borderColor: 'border-purple-400', width: 160, height: 100, textStyle: { align: 'center', bold: true } },
        { id: 'w4', x: 740, y: 200, label: 'Week 4:\nProject Build', type: 'step', shape: 'rectangle', color: 'bg-pink-50', borderColor: 'border-pink-400', width: 160, height: 100, textStyle: { align: 'center', bold: true } },
        
        { id: 'n1', x: 50, y: 350, label: 'ES6 Syntax', type: 'text', shape: 'rectangle', color: 'bg-transparent', width: 160, height: 40, textStyle: { fontSize: 'sm', align: 'center' } },
        { id: 'n2', x: 280, y: 350, label: 'Props vs State', type: 'text', shape: 'rectangle', color: 'bg-transparent', width: 160, height: 40, textStyle: { fontSize: 'sm', align: 'center' } },
        { id: 'n3', x: 510, y: 350, label: 'useEffect', type: 'text', shape: 'rectangle', color: 'bg-transparent', width: 160, height: 40, textStyle: { fontSize: 'sm', align: 'center' } },
        { id: 'n4', x: 740, y: 350, label: 'Deployment', type: 'text', shape: 'rectangle', color: 'bg-transparent', width: 160, height: 40, textStyle: { fontSize: 'sm', align: 'center' } },
      ],
      edges: [
        { id: 'e1', from: 'w1', to: 'w2' },
        { id: 'e2', from: 'w2', to: 'w3' },
        { id: 'e3', from: 'w3', to: 'w4' },
        { id: 'l1', from: 'w1', to: 'n1', label: '' },
        { id: 'l2', from: 'w2', to: 'n2', label: '' },
        { id: 'l3', from: 'w3', to: 'n3', label: '' },
        { id: 'l4', from: 'w4', to: 'n4', label: '' },
      ]
    }
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
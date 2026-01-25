# Cooketh Flow | AI-Powered Visual Thinking Platform

**Cooketh Flow** is an open-source, **AI-assisted visual workspace** that helps individuals and teams **think, map, and structure ideas effortlessly**.  
It transforms natural language prompts into **flowcharts, mind maps, and concept diagrams**, combining the flexibility of a whiteboard with the intelligence of modern AI.

Built with a strong focus on **usability, performance, and creative joy**, Cooketh Flow offers an **infinite canvas**, **real-time collaboration**, and **export-ready diagrams**—all wrapped in a playful yet professional UI.

> **Think it. Map it. Ship it.**

---

## 🔗 Live Preview

- **Marketing / Alpha Website:** https://cookethflow.framer.website/
- **Workspace Prototype:** Deployed via Vercel (local or hosted demo)

---

## 🚀 Core Features

Cooketh Flow is built around four core pillars.

---

## 🧠 AI-Powered Prompt-to-Map

Leverage **Google Gemini** to instantly convert text into structured diagrams.

- **Natural Language Input**
  - Example: *“Create a user registration flow with email verification”*
- **Automatic Diagram Generation**
  - Nodes and connections inferred from prompt
  - Logical grouping of steps and decisions
- **Smart Shape Selection**
  - Process → Rectangle  
  - Decision → Diamond  
  - Database → Cylinder  
- **Layout Intelligence**
  - Flowchart (top-down)
  - Mind map (radial)
  - Tree / hierarchy layouts

Graceful fallbacks ensure the UI remains functional even if AI responses fail.

---

## 🎨 Infinite Canvas & Diagram Tools

A high-performance, browser-native canvas built for scale.

- **Infinite Workspace**
  - Smooth pan & zoom
  - Grid-based alignment
- **Rich Node Types**
  - Process blocks
  - Decision nodes
  - Sticky notes
  - Text nodes
  - Image nodes
  - Database nodes
- **Connections**
  - Drag-to-connect handles
  - Bezier / orthogonal paths
  - Edge labels (Yes / No / Conditions)
- **Customization**
  - Node colors (light & bright palettes)
  - Shape switching
  - Text formatting (bold, italic, underline)
  - Background and border control

---

## 👥 Real-Time Collaboration

Collaborate seamlessly with teammates.

- **Live Cursors**
  - See collaborators’ movements and identities
- **Real-Time Sync**
  - Instant updates across sessions
- **Comments**
  - Leave contextual feedback on nodes
- **Workspace Chat**
  - In-canvas communication
- **Undo / Redo**
  - Robust history stack for safe iteration

Powered by **Supabase Realtime**.

---

## 📂 Map & Workspace Management

Organize and persist your ideas.

- **My Maps Dashboard**
  - View all saved diagrams
  - Open, duplicate, or delete maps
- **Persistence**
  - Local-first storage
  - Cloud sync via Supabase
- **Import / Export**
  - Export as **PNG, JPEG, PDF**
  - Export structured **JSON**
  - Import existing JSON diagrams

---

## 🔐 Authentication & Access

Flexible access modes for quick onboarding.

- **Email / Password Authentication**
- **Guest Mode**
  - Try Cooketh Flow without signing up
- **Session Persistence**
- **Route Protection**
  - Landing → Auth → Workspace flow

---

## 🎨 User Experience Philosophy

Cooketh Flow is designed around **“Joy of Use”**.

- **Playful Mascot (Cooketh Chef)**
  - Contextual animations
  - Visual personality without distraction
- **Micro-Interactions**
  - Hover states, transitions, subtle motion
- **Performance-First**
  - Smooth canvas interactions
  - Optimized rendering for large diagrams
- **Accessible Design**
  - Semantic HTML
  - Readable contrast
  - Keyboard shortcuts

---

## 🛠️ Technical Architecture

### ⚙️ Tech Stack

| Layer | Technology |
|-----|-----------|
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| Animations | CSS Transitions / Framer Motion |
| AI | Google Gemini (`@google/genai`) |
| Backend | Supabase (Auth, Realtime, DB) |
| Storage | LocalStorage + Supabase |
| Export | html-to-image, jsPDF |
| Deployment | Vercel |

---

### 🧠 AI Reliability Pattern

- Strict error handling for AI calls
- Structured JSON parsing
- Graceful fallbacks for failures
- UI never blocks due to AI latency

---

## 📦 Installation & Setup

### 1️⃣ Prerequisites
- Node.js (v18+)
- Google AI Studio API Key
- Supabase Project

---

### 2️⃣ Clone & Install
```bash
git clone https://github.com/your-username/cooketh-flow.git
cd cooketh-flow
npm install
```

---

### 3️⃣ Environment Variables
Create a `.env` file:
```env
VITE_GEMINI_API_KEY=your_google_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

---

### 4️⃣ Run Locally
```bash
npm run dev
```

Open: http://localhost:5173

---

## 🎮 How to Use

### ✨ Create a Diagram
1. Open the workspace
2. Enter a prompt in **Prompt-to-Map**
3. Watch the diagram generate automatically
4. Edit, customize, and connect nodes

---

### 👥 Collaborate
- Share workspace access
- See live cursors and updates
- Leave comments or chat

---

### 📤 Export
- Download diagrams as images or PDFs
- Export JSON for reuse or sharing

---

## 🌍 Use Cases

- **Engineering:** System flows, architecture diagrams
- **Product:** User journeys, feature planning
- **Education:** Concept maps, study plans
- **Business:** SOPs, workflows, brainstorming sessions

---

## 📄 License

**MIT License**

---

<p align="center">
Built with ❤️ using React, Tailwind, Supabase, and Google Gemini  
</p>

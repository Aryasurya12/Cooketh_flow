import { GoogleGenAI, Type } from "@google/genai";
import { MapState, NodeData, EdgeData, MapStyle } from "../types";
import { LayoutService } from "./layout";

// Define the response schema strictly
const MAP_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A creative title for the map based on the idea." },
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING, description: "Short, punchy label for the node (max 6 words)" },
          type: { type: Type.STRING, description: "One of: root, topic, subtopic, step, decision" }
        },
        required: ["id", "label", "type"]
      }
    },
    edges: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          from: { type: Type.STRING },
          to: { type: Type.STRING },
          label: { type: Type.STRING, description: "Optional relationship label" }
        },
        required: ["from", "to"]
      }
    }
  },
  required: ["title", "nodes", "edges"]
};

// Robust Mock Generator
const mockGenerate = (prompt: string, style: MapStyle): any => {
    const isProcess = style === 'flowchart' || prompt.toLowerCase().includes('process');
    
    if (isProcess) {
        return {
            title: "Flow: " + prompt.substring(0, 20),
            nodes: [
                { id: "root", label: "Start", type: "root" },
                { id: "1", label: "Initial Step", type: "step" },
                { id: "2", label: "Check Condition", type: "decision" },
                { id: "3", label: "Proceed", type: "step" },
                { id: "4", label: "Finish", type: "step" }
            ],
            edges: [
                { from: "root", to: "1" },
                { from: "1", to: "2" },
                { from: "2", to: "3", label: "Yes" },
                { from: "2", to: "4", label: "No" },
                { from: "3", to: "4" }
            ]
        };
    }

    return {
        title: "Map: " + prompt.substring(0, 20),
        nodes: [
            { id: "root", label: prompt.substring(0, 20), type: "root" },
            { id: "1", label: "Main Concept A", type: "topic" },
            { id: "2", label: "Main Concept B", type: "topic" },
            { id: "3", label: "Detail A.1", type: "subtopic" },
            { id: "4", label: "Detail B.1", type: "subtopic" },
            { id: "5", label: "Detail B.2", type: "subtopic" }
        ],
        edges: [
            { from: "root", to: "1" },
            { from: "root", to: "2" },
            { from: "1", to: "3" },
            { from: "2", to: "4" },
            { from: "2", to: "5" }
        ]
    };
};

export const AIService = {
  generateMap: async (prompt: string, style: MapStyle = 'mindmap'): Promise<{ title: string; mapState: MapState }> => {
    // Helper to process data uniformly
    const processData = (rawData: any) => {
         // Transform raw AI nodes to NodeData
         const nodes: NodeData[] = rawData.nodes.map((n: any) => ({
             id: n.id,
             x: 0, // Placeholder, layout service will fix
             y: 0,
             label: n.label,
             type: n.type === 'decision' ? 'process' : (n.type === 'root' ? 'root' : (n.type === 'topic' ? 'idea' : 'step')),
             shape: n.type === 'decision' ? 'diamond' : (n.type === 'root' ? 'rounded' : 'rectangle'),
             color: n.type === 'decision' ? 'bg-yellow-50' : (n.type === 'root' ? 'bg-brand-100' : 'bg-white'),
             borderColor: n.type === 'root' ? 'border-brand-500' : (n.type === 'decision' ? 'border-yellow-500' : 'border-slate-200'),
             icon: n.type === 'decision' ? 'process' : (n.type === 'root' ? 'idea' : 'step'),
             width: n.type === 'decision' ? 140 : 200,
             height: n.type === 'decision' ? 140 : 80,
         }));

         const edges: EdgeData[] = rawData.edges.map((e: any, i: number) => ({
             id: `edge-${i}`,
             from: e.from,
             to: e.to,
             label: e.label
         }));

         const laidOutNodes = LayoutService.computeLayout(nodes, edges, style);

         return {
            title: rawData.title,
            mapState: { nodes: laidOutNodes, edges }
         };
    };

    const apiKey = process.env.API_KEY;

    // 1. Check Key Presence
    if (!apiKey) {
      console.warn("No API_KEY found, using mock generator.");
      await new Promise(r => setTimeout(r, 800)); // Simulate thinking
      return processData(mockGenerate(prompt, style));
    }

    // 2. Try API Call with Error Handling
    try {
        const ai = new GoogleGenAI({ apiKey });
        
        let styleInstruction = "";
        switch (style) {
            case 'flowchart':
                styleInstruction = "Create a sequential Process Flowchart. Use types 'step' and 'decision'. Focus on order of operations.";
                break;
            case 'concept':
                styleInstruction = "Create a Concept Map. Focus on relationships between entities. Use labeled edges heavily.";
                break;
            case 'tree':
                styleInstruction = "Create a Hierarchical Tree Diagram. Strict parent-child relationships. Deep structure.";
                break;
            case 'mindmap':
            default:
                styleInstruction = "Create a Mind Map. Central root concept, radiating branches.";
                break;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                systemInstruction: `You are an expert systems architect. ${styleInstruction} 
                Expand ideas logically, avoid shallow lists. Return only valid JSON matching the schema.`,
                responseMimeType: "application/json",
                responseSchema: MAP_SCHEMA
            }
        });
        
        const text = response.text;
        if (!text) throw new Error("Empty response from AI");
        
        const rawData = JSON.parse(text);
        return processData(rawData);

    } catch (error) {
      console.error("AI Generation Failed (switching to fallback):", error);
      return processData(mockGenerate(prompt, style));
    }
  }
};
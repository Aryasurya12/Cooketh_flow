import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Send, Plus, Trash2, Download, Eraser, 
  ZoomIn, ZoomOut, Save, Undo, Redo, Maximize, 
  Database, Globe, Code, Cpu, Cloud, FileText, Lightbulb, GitMerge, Rocket, RefreshCw,
  Loader2, Edit2, Check, Sun, Moon, MousePointer, Hand, StickyNote, Type, 
  Image as ImageIcon, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Box, Wand2,
  MoreVertical, FileJson, FileType, FileImage, Layout as LayoutIcon, Circle, Square, Triangle, Hexagon,
  ChevronDown, Upload, List, Network, FolderOpen, Copy, X
} from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import Button from './Button';
import Mascot from './Mascot';
import { 
    NodeData, EdgeData, MapState, MapMetadata, MapStyle, ViewMode, InteractionMode,
    Comment, ChatMessage, Cursor, UserProfile, TextStyle, NodeShape
} from '../types';
import { StorageService } from '../services/storage';
import { AIService } from '../services/ai';
import { RealtimeService, supabase } from '../services/supabase';
import { LayoutService } from '../services/layout';

// --- Icon Mapping ---
const ICON_MAP: Record<string, React.FC<any>> = {
  'idea': Lightbulb,
  'process': GitMerge,
  'step': FileText,
  'launch': Rocket,
  'sync': RefreshCw,
  'database': Database,
  'globe': Globe,
  'code': Code,
  'cpu': Cpu,
  'cloud': Cloud,
  'root': Lightbulb,
  'sticky': StickyNote,
  'text': Type,
  'image': ImageIcon
};

const COLORS = [
    '#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
];

const BG_COLORS = [
    'bg-white', 'bg-slate-50', 'bg-red-50', 'bg-orange-50', 'bg-amber-50', 
    'bg-green-50', 'bg-blue-50', 'bg-indigo-50', 'bg-purple-50', 'bg-pink-50',
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-blue-500', 
    'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-slate-900'
];

const getContrastColor = (bgClass?: string) => {
  if (!bgClass) return 'text-slate-900 dark:text-slate-100'; 
  const darkBgs = ['bg-brand-500', 'bg-brand-600', 'bg-brand-900', 'bg-slate-900', 'bg-slate-800', 'bg-blue-500', 'bg-blue-600', 'bg-red-500', 'bg-red-600', 'bg-green-500', 'bg-green-600', 'bg-purple-500', 'bg-purple-600', 'bg-indigo-500', 'bg-indigo-600', 'bg-pink-500', 'bg-orange-500', 'bg-amber-500'];
  if (darkBgs.some(cls => bgClass.includes(cls))) return 'text-white';
  if (bgClass.includes('yellow')) return 'text-slate-900';
  return 'text-slate-900 dark:text-slate-100';
};

// --- ORTHOGONAL ROUTING LOGIC ---
const getEdgePath = (source: NodeData, target: NodeData) => {
    const sW = source.width || 200;
    const sH = source.height || 100;
    const tW = target.width || 200;
    const tH = target.height || 100;

    // Anchor Points (Midpoints of edges)
    const srcRight = { x: source.x + sW, y: source.y + sH / 2 };
    const srcBottom = { x: source.x + sW / 2, y: source.y + sH };
    const srcLeft = { x: source.x, y: source.y + sH / 2 };
    const srcTop = { x: source.x + sW / 2, y: source.y };

    const tgtLeft = { x: target.x, y: target.y + tH / 2 };
    const tgtTop = { x: target.x + tW / 2, y: target.y };
    const tgtRight = { x: target.x + tW, y: target.y + tH / 2 };
    const tgtBottom = { x: target.x + tW / 2, y: target.y + tH };
    
    // Relationship determination
    const isTargetRight = target.x >= source.x + sW - 20; 
    const isTargetBelow = target.y >= source.y + sH - 20;
    const isAlignedY = Math.abs((source.y + sH/2) - (target.y + tH/2)) < 50; 
    const isAlignedX = Math.abs((source.x + sW/2) - (target.x + tW/2)) < 50;

    // 1. Horizontal Flow (Main Path)
    if (isTargetRight && isAlignedY) return `M ${srcRight.x} ${srcRight.y} L ${tgtLeft.x} ${tgtLeft.y}`;

    // 2. Vertical Flow (Branch Down)
    if (isTargetBelow && isAlignedX) return `M ${srcBottom.x} ${srcBottom.y} L ${tgtTop.x} ${tgtTop.y}`;

    // 3. Step Down-Right
    if (isTargetBelow) {
        const midY = (srcBottom.y + tgtTop.y) / 2;
        return `M ${srcBottom.x} ${srcBottom.y} L ${srcBottom.x} ${midY} L ${tgtTop.x} ${midY} L ${tgtTop.x} ${tgtTop.y}`;
    }

    // 4. Step Right-Down
    if (isTargetRight) {
        const midX = (srcRight.x + tgtLeft.x) / 2;
        return `M ${srcRight.x} ${srcRight.y} L ${midX} ${srcRight.y} L ${midX} ${tgtLeft.y} L ${tgtLeft.x} ${tgtLeft.y}`;
    }

    // 5. Loop Back
    if (target.x < source.x) {
         return `M ${srcLeft.x} ${srcLeft.y} L ${tgtRight.x} ${tgtRight.y}`; 
    }

    return `M ${srcRight.x} ${srcRight.y} L ${tgtLeft.x} ${tgtLeft.y}`;
};

interface MapAppProps {
  initialPrompt?: string;
  onBack: () => void;
  onLogout?: () => void;
  session?: any;
}

interface HistoryItem extends MapState {
    action: string;
}

const MapApp: React.FC<MapAppProps> = ({ initialPrompt = "", onBack, onLogout, session }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // -- Global App State --
  const [currentUser, setCurrentUser] = useState<UserProfile>({ 
      id: session?.user?.id || 'local-user', 
      name: session?.user?.email?.split('@')[0] || 'Guest', 
      color: COLORS[Math.floor(Math.random() * COLORS.length)] 
  });
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);
  const [mapTitle, setMapTitle] = useState("Untitled Map");
  const [mapList, setMapList] = useState<MapMetadata[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('canvas');
  const [isMapListOpen, setIsMapListOpen] = useState(false);
  
  // -- Canvas State --
  const [prompt, setPrompt] = useState(initialPrompt);
  const [aiStyle, setAiStyle] = useState<MapStyle>('flowchart'); 
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('pointer');

  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [edges, setEdges] = useState<EdgeData[]>([]);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  
  // -- Status State --
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // -- Interaction State --
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // -- Resizing State --
  const [resizingNodeId, setResizingNodeId] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{x: number, y: number} | null>(null);
  const [initialNodeState, setInitialNodeState] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  // -- Edge Editing State --
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [edgeLabelBuffer, setEdgeLabelBuffer] = useState("");

  // -- Collaboration (Cursors) --
  const [cursors, setCursors] = useState<Record<string, Cursor>>({});
  
  const channelRef = useRef<any>(null);

  // --- View Helpers ---
  const toWorldPos = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left - transform.x) / transform.k,
      y: (clientY - rect.top - transform.y) / transform.k
    };
  };

  const handleZoom = (delta: number) => {
    setTransform(prev => ({
      ...prev,
      k: Math.min(Math.max(0.1, prev.k + delta), 2.5)
    }));
  };

  const handleFitView = useCallback((nodesToFit?: NodeData[]) => {
    const targetNodes = nodesToFit || nodes;
    if (targetNodes.length === 0 || !containerRef.current) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    targetNodes.forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + (node.width || 200));
      maxY = Math.max(maxY, node.y + (node.height || 100));
    });

    if (minX === Infinity) return;

    const padding = 50;
    const { width: containerWidth, height: containerHeight } = containerRef.current.getBoundingClientRect();
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    const scaleX = (containerWidth - padding * 2) / contentWidth;
    const scaleY = (containerHeight - padding * 2) / contentHeight;
    const newScale = Math.min(Math.min(scaleX, scaleY), 1);

    const newX = (containerWidth - contentWidth * newScale) / 2 - minX * newScale;
    const newY = (containerHeight - contentHeight * newScale) / 2 - minY * newScale;

    setTransform({ x: newX, y: newY, k: newScale });
  }, [nodes]);

  // -- Initial Load & Realtime --
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
     if (!RealtimeService.isAvailable() || !currentMapId) return;
     if (channelRef.current) supabase?.removeChannel(channelRef.current);
     const channel = RealtimeService.subscribeToMap(
         currentMapId,
         (payload) => console.log('Sync update:', payload),
         (cursorPayload: any) => { if (cursorPayload.userId !== currentUser.id) setCursors(prev => ({ ...prev, [cursorPayload.userId]: cursorPayload })); }
     );
     channelRef.current = channel;
     return () => { if (channelRef.current) supabase?.removeChannel(channelRef.current); };
  }, [currentMapId]);

  const broadcastCursor = useCallback((x: number, y: number) => {
      if (channelRef.current) {
          RealtimeService.sendCursor(channelRef.current, { userId: currentUser.id, userName: currentUser.name, color: currentUser.color, x, y, lastActive: Date.now() });
      }
  }, [currentUser]);

  // -- Undo/Redo/History --
  const applyStateChange = useCallback((newNodes: NodeData[], newEdges: EdgeData[], actionName: string) => {
      setNodes(newNodes);
      setEdges(newEdges);
      setHistory(prev => {
          const newHistory = prev.slice(0, historyIndex + 1);
          newHistory.push({ nodes: newNodes, edges: newEdges, action: actionName });
          if (newHistory.length > 50) newHistory.shift();
          return newHistory;
      });
      setHistoryIndex(prev => { const nextIndex = prev + 1; return nextIndex >= 50 ? 49 : nextIndex; });
      markUnsaved();
  }, [historyIndex]);

  const undo = () => { if (historyIndex > 0) { const prevState = history[historyIndex - 1]; setNodes(prevState.nodes); setEdges(prevState.edges); setHistoryIndex(historyIndex - 1); markUnsaved(); } };
  const redo = () => { if (historyIndex < history.length - 1) { const nextState = history[historyIndex + 1]; setNodes(nextState.nodes); setEdges(nextState.edges); setHistoryIndex(historyIndex + 1); markUnsaved(); } };

  // -- Deletion --
  const deleteSelectedElements = useCallback(() => {
      if (selectedNodeId) {
          const newNodes = nodes.filter(n => n.id !== selectedNodeId);
          const newEdges = edges.filter(e => e.from !== selectedNodeId && e.to !== selectedNodeId);
          applyStateChange(newNodes, newEdges, 'Delete Node');
          setSelectedNodeId(null);
      } else if (selectedEdgeId) {
          const newEdges = edges.filter(e => e.id !== selectedEdgeId);
          applyStateChange(nodes, newEdges, 'Delete Connection');
          setSelectedEdgeId(null);
      }
  }, [nodes, edges, selectedNodeId, selectedEdgeId, applyStateChange]);

  // -- Keyboard Shortcuts --
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).isContentEditable) return;
        if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelectedElements(); return; }
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 'p': e.preventDefault(); setInteractionMode('pointer'); break;
                case 'a': e.preventDefault(); setInteractionMode('pan'); break;
                case 's': e.preventDefault(); addNode('sticky'); break;
                case 'r': e.preventDefault(); handleFitView(); break;
                case 'z': e.preventDefault(); if (e.shiftKey) redo(); else undo(); break;
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, selectedNodeId, selectedEdgeId, historyIndex, deleteSelectedElements, handleFitView]);

  // -- Map Loading --
  useEffect(() => {
    const list = StorageService.listMaps();
    setMapList(list);
    if (!initialPrompt) {
      if (list.length > 0) { if (list.length === 0) loadDemoMap(); else loadMap(list[0].id); } else loadDemoMap();
    } else { createNewMap(true); handleGenerate(); }
  }, []);

  const loadDemoMap = () => {
       const demoNodes: NodeData[] = [
           { id: 'start', x: 0, y: 0, label: 'Start', type: 'step', shape: 'rounded', color: 'bg-green-100', borderColor: 'border-green-500', width: 120, height: 60, textStyle: { bold: true, align: 'center' } },
           { id: 'input', x: 0, y: 0, label: 'Get User Input', type: 'process', shape: 'rectangle', color: 'bg-white', width: 160, height: 80, icon: 'text', textStyle: { align: 'center' } },
           { id: 'decide', x: 0, y: 0, label: 'Valid Format?', type: 'process', shape: 'diamond', color: 'bg-yellow-50', borderColor: 'border-yellow-500', width: 140, height: 140, textStyle: { bold: true, align: 'center' } },
           { id: 'save', x: 0, y: 0, label: 'Save to DB', type: 'database', shape: 'cylinder', color: 'bg-blue-50', borderColor: 'border-blue-500', width: 120, height: 100, icon: 'database', textStyle: { align: 'center' } },
           { id: 'error', x: 0, y: 0, label: 'Show Error', type: 'process', shape: 'rectangle', color: 'bg-red-50', width: 140, height: 80, textStyle: { align: 'center' } },
           { id: 'end', x: 0, y: 0, label: 'End Process', type: 'step', shape: 'rounded', color: 'bg-slate-200', width: 120, height: 50, textStyle: { align: 'center' } }
       ];
       const demoEdges: EdgeData[] = [
           { id: 'e1', from: 'start', to: 'input' },
           { id: 'e2', from: 'input', to: 'decide' },
           { id: 'e3', from: 'decide', to: 'save', label: 'Yes' },
           { id: 'e4', from: 'decide', to: 'error', label: 'No' },
           { id: 'e5', from: 'save', to: 'end' },
           { id: 'e6', from: 'error', to: 'end' }
       ];
       
       const layoutNodes = LayoutService.computeLayout(demoNodes, demoEdges, 'flowchart');
       
       setMapTitle("Demo Flowchart");
       setNodes(layoutNodes);
       setEdges(demoEdges);
       setHistory([{ nodes: layoutNodes, edges: demoEdges, action: 'Load Demo' }]);
       setHistoryIndex(0);
       setSaveStatus('unsaved');
       setCurrentMapId(null); 
       // Pass explicit nodes to center immediately
       setTimeout(() => handleFitView(layoutNodes), 50);
  };

  const loadMap = (id: string) => {
    const mapDoc = StorageService.loadMap(id);
    if (mapDoc) {
      setCurrentMapId(mapDoc.id); setMapTitle(mapDoc.title); setNodes(mapDoc.data.nodes); setEdges(mapDoc.data.edges); 
      setHistory([{ ...mapDoc.data, action: 'Load Map' }]); setHistoryIndex(0); setSaveStatus('saved'); 
      // Pass explicit nodes to center immediately
      setTimeout(() => handleFitView(mapDoc.data.nodes), 50);
    }
  };

  const createNewMap = (skipSave = false) => {
    if (!skipSave && mapList.length >= 10) { alert("Workspace limit (10) reached."); return; }
    const newId = skipSave ? null : StorageService.saveMap({ title: "Untitled Map", data: { nodes: [], edges: [] } }).id;
    setCurrentMapId(newId); setMapTitle("Untitled Map"); setNodes([]); setEdges([]);
    setHistory([{ nodes: [], edges: [], action: 'New Map' }]); setHistoryIndex(0); setTransform({ x: 0, y: 0, k: 1 });
    if (!skipSave) refreshMapList();
  };

  const refreshMapList = () => { setMapList(StorageService.listMaps()); };
  const saveCurrentMap = () => {
    setSaveStatus('saving');
    setTimeout(() => { const savedDoc = StorageService.saveMap({ id: currentMapId || undefined, title: mapTitle, data: { nodes, edges } }); setCurrentMapId(savedDoc.id); setSaveStatus('saved'); refreshMapList(); }, 400);
  };
  
  // -- Map Actions --
  const handleDuplicateMap = (e: React.MouseEvent, mapId: string) => {
    e.stopPropagation();
    const map = StorageService.loadMap(mapId);
    if (map) {
        StorageService.saveMap({
            data: map.data,
            title: `${map.title} (Copy)`
        });
        refreshMapList();
    }
  };

  const handleDeleteMap = (e: React.MouseEvent, mapId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this map? This action cannot be undone.")) {
        StorageService.deleteMap(mapId);
        if (currentMapId === mapId) {
             createNewMap(true); // reset if deleting current active map
        }
        refreshMapList();
    }
  };

  const handleRenameMap = (e: React.MouseEvent, mapId: string, currentTitle: string) => {
    e.stopPropagation();
    // Fix: Explicitly use window.prompt because state variable 'prompt' shadows it
    const newTitle = window.prompt("Enter new map name:", currentTitle);
    if (newTitle && newTitle !== currentTitle) {
        const map = StorageService.loadMap(mapId);
        if (map) {
            StorageService.saveMap({ ...map, title: newTitle });
            refreshMapList();
            if (currentMapId === mapId) setMapTitle(newTitle);
        }
    }
  };

  const handleAutoLayout = () => {
      if (nodes.length === 0) return;
      const newNodes = LayoutService.computeLayout(nodes, edges, aiStyle);
      applyStateChange(newNodes, edges, 'Auto Layout');
      handleFitView(newNodes);
  };

  const handleGenerate = async () => { if (!prompt.trim() || !containerRef.current) return; setIsGenerating(true); try { const { title, mapState } = await AIService.generateMap(prompt, aiStyle); setMapTitle(title); applyStateChange(mapState.nodes, mapState.edges, 'AI Generate'); setTimeout(() => handleFitView(mapState.nodes), 100); } catch (error) { alert("Failed to generate map."); } finally { setIsGenerating(false); } };
  
  // -- Interactions --
  const handleMouseDown = (e: React.MouseEvent) => { 
      if (editingEdgeId) setEditingEdgeId(null); 
      
      // Canvas Pan
      if ((e.target as HTMLElement).classList.contains('canvas-bg')) { 
          if (interactionMode === 'pan' || e.button === 1) { 
              setIsPanning(true); 
              setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y }); 
          }
          setSelectedNodeId(null); 
          setSelectedEdgeId(null);
      } 
  };

  const handleResizeMouseDown = (e: React.MouseEvent, id: string, handle: string) => {
    e.stopPropagation();
    setResizingNodeId(id);
    setResizeHandle(handle);
    setResizeStart({ x: e.clientX, y: e.clientY });
    const node = nodes.find(n => n.id === id);
    if (node) {
        setInitialNodeState({ x: node.x, y: node.y, w: node.width || 200, h: node.height || 100 });
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => { 
      e.stopPropagation(); 
      if (connectingNodeId) return; 
      if (interactionMode === 'pan') return; 
      
      const node = nodes.find(n => n.id === id); 
      if (!node) return; 
      
      setSelectedNodeId(id); 
      setSelectedEdgeId(null);
      setDraggingNodeId(id); 
      const worldPos = toWorldPos(e.clientX, e.clientY); 
      setDragOffset({ x: worldPos.x - node.x, y: worldPos.y - node.y }); 
  };

  const handleConnectStart = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setConnectingNodeId(id);
      const worldPos = toWorldPos(e.clientX, e.clientY);
      setMousePos(worldPos);
  };

  const handleMouseMove = (e: React.MouseEvent) => { 
      const worldPos = toWorldPos(e.clientX, e.clientY); 
      broadcastCursor(worldPos.x, worldPos.y); 
      
      if (isPanning) { 
          setTransform({ ...transform, x: e.clientX - panStart.x, y: e.clientY - panStart.y }); 
          return; 
      }
      
      if (resizingNodeId && resizeStart && initialNodeState && resizeHandle) {
          const dx = (e.clientX - resizeStart.x) / transform.k;
          const dy = (e.clientY - resizeStart.y) / transform.k;
          
          let newW = initialNodeState.w;
          let newH = initialNodeState.h;
          let newX = initialNodeState.x;
          let newY = initialNodeState.y;

          if (resizeHandle.includes('e')) newW = Math.max(50, initialNodeState.w + dx);
          if (resizeHandle.includes('s')) newH = Math.max(50, initialNodeState.h + dy);
          if (resizeHandle.includes('w')) {
              newW = Math.max(50, initialNodeState.w - dx);
              newX = initialNodeState.x + dx;
          }
          if (resizeHandle.includes('n')) {
              newH = Math.max(50, initialNodeState.h - dy);
              newY = initialNodeState.y + dy;
          }
          
          setNodes(prev => prev.map(n => n.id === resizingNodeId ? { ...n, x: newX, y: newY, width: newW, height: newH } : n));
          return;
      }
      
      if (draggingNodeId) { 
          setNodes(prev => prev.map(n => { if (n.id === draggingNodeId) { return { ...n, x: worldPos.x - dragOffset.x, y: worldPos.y - dragOffset.y }; } return n; })); 
      } 
      
      if (connectingNodeId) {
          setMousePos(worldPos);
      }
  };

  const handleMouseUp = (e: React.MouseEvent) => { 
      if (resizingNodeId) {
          applyStateChange(nodes, edges, 'Resize Node');
          setResizingNodeId(null);
          setResizeStart(null);
      }
      if (draggingNodeId) { 
          applyStateChange(nodes, edges, 'Move Node'); 
          setDraggingNodeId(null); 
      } 
      setIsPanning(false); 
      
      if (connectingNodeId) { 
          const target = (e.target as HTMLElement).closest('.node-element'); 
          if (target) { 
              const targetId = target.getAttribute('data-id'); 
              if (targetId && targetId !== connectingNodeId) { 
                  // Avoid duplicate edges
                  if (!edges.some(e => e.from === connectingNodeId && e.to === targetId)) {
                      const newEdges = [...edges, { id: `edge-${Date.now()}`, from: connectingNodeId, to: targetId, label: '' }]; 
                      applyStateChange(nodes, newEdges, 'Add Connection'); 
                  }
              } 
          } 
          setConnectingNodeId(null); 
      } 
  };

  const updateNodeProperty = (prop: keyof NodeData, value: any) => { if (!selectedNodeId) return; const newNodes = nodes.map(n => n.id === selectedNodeId ? { ...n, [prop]: value } : n); applyStateChange(newNodes, edges, `Update Node ${prop}`); };
  const updateNodeTextStyle = (prop: keyof TextStyle, value: any) => { if (!selectedNodeId) return; const newNodes = nodes.map(n => { if (n.id === selectedNodeId) { return { ...n, textStyle: { ...(n.textStyle || {}), [prop]: value } }; } return n; }); applyStateChange(newNodes, edges, 'Update Text Style'); };
  const addNode = (type: string, src?: string) => { if (!containerRef.current) return; const rect = containerRef.current.getBoundingClientRect(); const centerX = (rect.width/2 - transform.x)/transform.k; const centerY = (rect.height/2 - transform.y)/transform.k; const newNode: NodeData = { id: `n-${Date.now()}`, x: centerX - 100, y: centerY - 50, label: 'New Node', type: type as any, shape: type === 'process' ? 'rectangle' : 'rounded', color: 'bg-white', width: 200, height: 100, src }; applyStateChange([...nodes, newNode], edges, 'Add Node'); };
  
  // -- Export/Import Handlers --
  const handleExportImage = async (format: 'png' | 'jpeg') => {
      if (!contentRef.current) return;
      setIsExporting(true);
      try {
        const dataUrl = format === 'png' 
          ? await toPng(contentRef.current, { backgroundColor: darkMode ? '#0f172a' : '#f1f5f9', quality: 0.95 })
          : await toJpeg(contentRef.current, { backgroundColor: darkMode ? '#0f172a' : '#f1f5f9', quality: 0.95 });
        const link = document.createElement('a');
        link.download = `${mapTitle || 'map'}.${format}`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error(err);
        alert("Export failed");
      } finally {
        setIsExporting(false);
        setIsExportMenuOpen(false);
      }
    };
    
    const handleExportPdf = async () => {
      if (!contentRef.current) return;
      setIsExporting(true);
      try {
        const dataUrl = await toPng(contentRef.current, { backgroundColor: '#ffffff' });
        const pdf = new jsPDF({ orientation: 'landscape' });
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${mapTitle || 'map'}.pdf`);
      } catch (err) {
         alert("PDF Export failed");
      } finally {
        setIsExporting(false);
        setIsExportMenuOpen(false);
      }
    };

    const handleExportJson = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ nodes, edges, title: mapTitle }, null, 2));
      const link = document.createElement('a');
      link.setAttribute("href", dataStr);
      link.setAttribute("download", `${mapTitle || 'map'}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    };

    const handleImportMap = (e: React.ChangeEvent<HTMLInputElement>) => {
       const file = e.target.files?.[0];
       if (!file) return;
       const reader = new FileReader();
       reader.onload = (event) => {
         try {
           const json = JSON.parse(event.target?.result as string);
           if (json.nodes && json.edges) {
             setNodes(json.nodes);
             setEdges(json.edges);
             if (json.title) setMapTitle(json.title);
             applyStateChange(json.nodes, json.edges, 'Import JSON');
             setTimeout(() => handleFitView(json.nodes), 100);
           } else {
             alert("Invalid JSON format");
           }
         } catch (err) {
           alert("Failed to parse JSON");
         }
       };
       reader.readAsText(file);
       if (fileInputRef.current) fileInputRef.current.value = '';
    };

  // Render Helpers
  const renderIcon = (iconKey?: string, colorClass?: string) => { const Icon = ICON_MAP[iconKey || 'idea'] || Lightbulb; const contrast = getContrastColor(colorClass); return <Icon size={18} className={contrast === 'text-white' ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'} />; };
  const startEditingEdge = (edge: EdgeData) => { setEditingEdgeId(edge.id); setEdgeLabelBuffer(edge.label || ""); };
  const saveEdgeLabel = () => { if (editingEdgeId) { const newEdges = edges.map(e => e.id === editingEdgeId ? { ...e, label: edgeLabelBuffer } : e); applyStateChange(nodes, newEdges, 'Rename Connection'); setEditingEdgeId(null); } };
  const markUnsaved = () => { if (saveStatus !== 'unsaved') setSaveStatus('unsaved'); };

  // Outline Render
  const renderOutlineView = () => {
      // Build simple hierarchy based on edges
      const roots = nodes.filter(n => !edges.some(e => e.to === n.id));
      const renderNodeTree = (nodeId: string, level: number = 0) => {
          const node = nodes.find(n => n.id === nodeId);
          if (!node) return null;
          const children = edges.filter(e => e.from === nodeId).map(e => e.to);
          return (
              <div key={nodeId} style={{ marginLeft: level * 20 }} className="py-1">
                   <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${node.color?.replace('bg-', 'bg-') || 'bg-slate-400'}`}></div>
                       <span className="font-medium text-slate-700 dark:text-slate-300">{node.label}</span>
                       <span className="text-xs text-slate-400">({node.type})</span>
                   </div>
                   {children.map(c => renderNodeTree(c, level + 1))}
              </div>
          );
      };

      return (
          <div className="w-full h-full p-8 overflow-y-auto bg-white dark:bg-dark-surface">
              <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Document Outline</h2>
              {roots.length === 0 && <p className="text-slate-500">No structured content found.</p>}
              {roots.map(r => renderNodeTree(r.id))}
          </div>
      );
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden font-sans ${darkMode ? 'dark bg-dark-bg text-dark-text' : 'bg-slate-50 text-slate-900'}`}>
      <header className="bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-dark-border h-16 flex items-center px-4 justify-between shrink-0 z-20 shadow-sm transition-colors">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-border rounded-full text-slate-500 dark:text-dark-muted transition-colors"><ArrowLeft size={20} /></button>
          
          {/* My Maps Button */}
          <Button variant="ghost" size="sm" onClick={() => setIsMapListOpen(true)} icon={FolderOpen} className="!px-3 !py-1 text-slate-600 hover:text-brand-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-dark-border">My Maps</Button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2 group">
                <input className="font-bold text-slate-800 dark:text-dark-text text-lg bg-transparent border-none focus:ring-0 p-0 hover:underline cursor-text w-full max-w-[300px]" value={mapTitle} onChange={(e) => { setMapTitle(e.target.value); markUnsaved(); }} placeholder="Untitled Map" />
                <Edit2 size={12} className="text-slate-400 opacity-0 group-hover:opacity-100" />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-dark-muted">
                <span className="bg-brand-600 text-white px-1 rounded text-[10px] font-bold">CF</span>
                {saveStatus === 'saving' ? <span className="flex items-center gap-1"><Loader2 size={10} className="animate-spin"/> Saving...</span> : saveStatus === 'saved' ? <span className="flex items-center gap-1 text-green-600"><Check size={10}/> Saved</span> : <span className="text-amber-500">Unsaved changes</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex bg-slate-100 dark:bg-dark-border p-1 rounded-lg mr-2">
               <button onClick={() => setViewMode('canvas')} className={`p-1.5 rounded ${viewMode === 'canvas' ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`} title="Canvas View"><LayoutIcon size={18}/></button>
               <button onClick={() => setViewMode('outline')} className={`p-1.5 rounded ${viewMode === 'outline' ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`} title="List View"><List size={18}/></button>
           </div>
           
           <input type="file" ref={fileInputRef} onChange={handleImportMap} className="hidden" accept=".json" />
           <Button size="sm" variant="ghost" onClick={() => fileInputRef.current?.click()} icon={Upload} title="Import JSON">Import</Button>
           <Button size="sm" onClick={saveCurrentMap} icon={Save} className="mr-2" disabled={saveStatus === 'saving'}>Save</Button>
           <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-500 dark:text-dark-muted hover:bg-slate-100 dark:hover:bg-dark-border rounded-full mr-2">{darkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
           
           {/* Export Menu */}
           <div className="relative">
               <Button size="sm" variant="outline" icon={isExporting ? Loader2 : Download} onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} disabled={isExporting || nodes.length === 0}>Export</Button>
               {isExportMenuOpen && (
                   <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-xl rounded-xl p-1 z-50 flex flex-col gap-1">
                       <button onClick={() => handleExportImage('png')} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-dark-text hover:bg-slate-100 dark:hover:bg-dark-border rounded-lg text-left"><FileImage size={16}/> PNG Image</button>
                       <button onClick={() => handleExportImage('jpeg')} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-dark-text hover:bg-slate-100 dark:hover:bg-dark-border rounded-lg text-left"><FileImage size={16}/> JPEG Image</button>
                       <button onClick={handleExportPdf} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-dark-text hover:bg-slate-100 dark:hover:bg-dark-border rounded-lg text-left"><FileType size={16}/> PDF Document</button>
                       <div className="h-px bg-slate-100 dark:bg-dark-border my-1"></div>
                       <button onClick={handleExportJson} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-dark-text hover:bg-slate-100 dark:hover:bg-dark-border rounded-lg text-left"><FileJson size={16}/> Export JSON</button>
                   </div>
               )}
           </div>
        </div>
      </header>

      <div className="flex flex-grow overflow-hidden relative">
        {/* Sidebar */}
        <aside className="w-80 bg-white dark:bg-dark-surface border-r border-slate-200 dark:border-dark-border flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-colors">
          <div className="p-4 border-b border-slate-100 dark:border-dark-border">
            <h2 className="font-semibold text-slate-700 dark:text-dark-text mb-2 flex items-center gap-2"><Lightbulb size={16} className="text-brand-500"/> AI Mapper</h2>
            <div className="flex gap-1 mb-2">{(['mindmap', 'flowchart', 'concept', 'tree'] as MapStyle[]).map(style => (<button key={style} onClick={() => setAiStyle(style)} className={`text-[10px] px-2 py-1 rounded uppercase font-bold transition-all ${aiStyle === style ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300' : 'bg-slate-100 text-slate-500 dark:bg-dark-bg dark:text-dark-muted'}`}>{style}</button>))}</div>
            <div className="relative">
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={`Describe your ${aiStyle}...`} className="w-full h-32 p-3 text-sm bg-slate-50 dark:bg-dark-bg dark:text-dark-text border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-500 resize-none" disabled={isGenerating}/>
              <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="absolute bottom-3 right-3 p-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50 shadow-md">{isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}</button>
            </div>
          </div>
          <div className="p-4 flex-grow overflow-y-auto">
             <div className="mt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Add Elements</h3>
                <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" className="justify-start gap-2 h-auto py-2 px-2" onClick={() => addNode('process')}><Box size={16} /> Process</Button>
                    <Button size="sm" variant="outline" className="justify-start gap-2 h-auto py-2 px-2" onClick={() => addNode('database')}><Database size={16} /> Data</Button>
                    <Button size="sm" variant="outline" className="justify-start gap-2 h-auto py-2 px-2" onClick={() => addNode('idea')}><Lightbulb size={16} /> Idea</Button>
                    <Button size="sm" variant="outline" className="justify-start gap-2 h-auto py-2 px-2" onClick={() => addNode('text')}><Type size={16} /> Text</Button>
                    <Button size="sm" variant="outline" className="justify-start gap-2 h-auto py-2 px-2" onClick={() => addNode('sticky')}><StickyNote size={16} /> Sticky</Button>
                    <Button size="sm" variant="outline" className="justify-start gap-2 h-auto py-2 px-2" onClick={() => addNode('topic')}><Network size={16} /> Topic</Button>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-dark-border">
                    <Button fullWidth variant="ghost" className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50" icon={Eraser} disabled={nodes.length === 0} onClick={() => { if(confirm("Clear canvas?")) { applyStateChange([], [], 'Clear'); setTransform({x:0,y:0,k:1}); } }}>Clear Canvas</Button>
                </div>
             </div>
          </div>
        </aside>

        {/* View Switching */}
        {viewMode === 'outline' ? (
            renderOutlineView()
        ) : (
            /* Canvas Area */
            <div className={`flex-grow relative overflow-hidden canvas-bg transition-colors ${interactionMode === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`} ref={containerRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} style={{ backgroundColor: darkMode ? '#0f172a' : '#f1f5f9', backgroundImage: `radial-gradient(${darkMode ? '#334155' : '#cbd5e1'} 1px, transparent 1px)`, backgroundSize: `${24 * transform.k}px ${24 * transform.k}px`, backgroundPosition: `${transform.x}px ${transform.y}px` }}>
                {interactionMode === 'pan' && <div className="absolute top-4 left-4 z-30 bg-brand-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse flex items-center gap-2 pointer-events-none"><Hand size={14}/> PANNING MODE (CTRL+P to exit)</div>}
                
                {/* Canvas Controls */}
                <div className="absolute bottom-6 left-6 flex bg-white dark:bg-dark-surface rounded-lg shadow-md border border-slate-200 dark:border-dark-border p-1 z-30 controls-layer">
                    <button onClick={() => setInteractionMode('pointer')} className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-dark-border ${interactionMode === 'pointer' ? 'text-brand-600 bg-brand-50' : 'text-slate-600'}`} title="Select"><MousePointer size={20}/></button>
                    <button onClick={() => setInteractionMode('pan')} className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-dark-border ${interactionMode === 'pan' ? 'text-brand-600 bg-brand-50' : 'text-slate-600'}`} title="Pan"><Hand size={20}/></button>
                    <div className="w-px bg-slate-200 dark:bg-dark-border mx-1 my-1"></div>
                    <button onClick={undo} disabled={historyIndex <= 0} className="p-2 hover:bg-slate-50 dark:hover:bg-dark-border rounded text-slate-600 disabled:opacity-30" title="Undo"><Undo size={20} /></button>
                    <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-slate-50 dark:hover:bg-dark-border rounded text-slate-600 disabled:opacity-30" title="Redo"><Redo size={20} /></button>
                    <div className="w-px bg-slate-200 dark:bg-dark-border mx-1 my-1"></div>
                    <button onClick={() => handleZoom(0.1)} className="p-2 hover:bg-slate-50 dark:hover:bg-dark-border rounded text-slate-600" title="Zoom In"><ZoomIn size={20} /></button>
                    <button onClick={() => handleZoom(-0.1)} className="p-2 hover:bg-slate-50 dark:hover:bg-dark-border rounded text-slate-600" title="Zoom Out"><ZoomOut size={20} /></button>
                    <button onClick={() => handleFitView()} className="p-2 hover:bg-slate-50 dark:hover:bg-dark-border rounded text-slate-600" title="Fit Content (CTRL+R)"><Maximize size={20} /></button>
                    <button onClick={handleAutoLayout} className="p-2 hover:bg-slate-50 dark:hover:bg-dark-border rounded text-slate-600" title="Auto Layout"><Wand2 size={20} /></button>
                </div>
                
                <div ref={contentRef} style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`, transformOrigin: '0 0', width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-0">
                        <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill={darkMode ? '#94a3b8' : '#cbd5e1'} /></marker></defs>
                        {edges.map(edge => {
                        const fromNode = nodes.find(n => n.id === edge.from);
                        const toNode = nodes.find(n => n.id === edge.to);
                        if (!fromNode || !toNode) return null;
                        
                        const d = getEdgePath(fromNode, toNode);
                        const isSelected = selectedEdgeId === edge.id;

                        return (
                            <g key={edge.id} 
                            className="pointer-events-auto cursor-pointer" 
                            onClick={(e) => { e.stopPropagation(); setSelectedEdgeId(edge.id); setSelectedNodeId(null); }}
                            >
                                <path d={d} stroke="transparent" strokeWidth="15" fill="none" />
                                <path d={d} stroke={isSelected ? '#f97316' : (darkMode ? '#475569' : '#cbd5e1')} strokeWidth={isSelected ? "3" : "2"} fill="none" markerEnd="url(#arrowhead)" />
                            </g>
                        );
                        })}
                        {connectingNodeId && (<path d={`M ${mousePos.x} ${mousePos.y} L ${mousePos.x} ${mousePos.y}`} stroke="#brand-500" strokeWidth="2" strokeDasharray="5,5" fill="none" className="stroke-brand-500 animate-dash" />)}
                    </svg>

                    {edges.map(edge => {
                        const fromNode = nodes.find(n => n.id === edge.from);
                        const toNode = nodes.find(n => n.id === edge.to);
                        if (!fromNode || !toNode) return null;
                        
                        // Smart Label Placement logic for orthogonal lines
                        let labelX = 0, labelY = 0;
                        const isBelow = toNode.y > fromNode.y + (fromNode.height||100);
                        if (isBelow && Math.abs(toNode.x - fromNode.x) < 50) {
                            labelX = fromNode.x + (fromNode.width||200)/2 + 20; 
                            labelY = fromNode.y + (fromNode.height||100) + 20;
                        } else {
                            const sW = fromNode.width || 200;
                            const startX = fromNode.x + sW;
                            const targetX = toNode.x;
                            labelX = (startX + targetX) / 2;
                            labelY = fromNode.y + (fromNode.height || 100)/2 - 12;
                        }

                        if (editingEdgeId === edge.id) { return (<div key={edge.id} className="absolute pointer-events-auto z-20" style={{ left: labelX, top: labelY, transform: 'translate(-50%, -50%)' }}><input autoFocus className="text-xs text-center border border-brand-500 rounded shadow-lg px-2 py-1 outline-none min-w-[60px] bg-white dark:bg-dark-surface dark:text-dark-text" value={edgeLabelBuffer} onChange={(e) => setEdgeLabelBuffer(e.target.value)} onBlur={saveEdgeLabel} onKeyDown={(e) => e.key === 'Enter' && saveEdgeLabel()} /></div>) }
                        if (edge.label) { 
                        return (
                            <div key={edge.id} className="absolute pointer-events-auto cursor-pointer flex justify-center items-center z-10" style={{ left: labelX, top: labelY, transform: 'translate(-50%, -50%)' }} onDoubleClick={(e) => { e.stopPropagation(); startEditingEdge(edge); }}>
                                <span className="bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 shadow-sm px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-600 dark:text-slate-300 pointer-events-auto select-none backdrop-blur-sm">
                                    {edge.label}
                                </span>
                            </div>
                        ) 
                        }
                        return null;
                    })}

                    {nodes.map(node => {
                        const isSelected = selectedNodeId === node.id;
                        const contrastColor = getContrastColor(node.color);
                        const finalTextColor = node.textStyle?.color || contrastColor;

                        return (
                        <div key={node.id} data-id={node.id}
                        className={`node-element absolute transition-shadow pointer-events-auto group/node
                            ${node.type === 'text' ? 'bg-transparent border-none shadow-none min-w-[100px]' : (node.type === 'image' ? 'border-2 border-transparent bg-transparent shadow-none p-0 overflow-hidden rounded-lg' : '')}
                            ${node.type !== 'text' && node.type !== 'image' && node.shape !== 'diamond' && node.shape !== 'cylinder' ? `p-4 border-2 ${node.shape === 'circle' ? 'rounded-full' : 'rounded-lg'} shadow-sm` : ''}
                            ${node.type === 'sticky' ? 'p-6 !bg-yellow-200 !text-slate-900 rotate-1 shadow-lg' : ''}
                            ${node.type !== 'sticky' && node.type !== 'text' && node.type !== 'image' && node.shape !== 'diamond' && node.shape !== 'cylinder' ? (node.color || 'bg-white dark:bg-dark-surface') : ''}
                            ${node.type !== 'sticky' && node.type !== 'text' && node.type !== 'image' && node.shape !== 'diamond' && node.shape !== 'cylinder' ? (node.borderColor || 'border-slate-200 dark:border-dark-border') : ''}
                            ${isSelected ? 'ring-2 ring-brand-500 shadow-xl z-20' : 'hover:shadow-md z-10'}
                        `}
                        style={{ transform: `translate(${node.x}px, ${node.y}px)`, width: node.width ? `${node.width}px` : 'auto', height: node.height ? `${node.height}px` : 'auto' }}
                        onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                        >
                            {/* Diamond Shape */}
                            {node.shape === 'diamond' && (
                                <div className={`absolute inset-0 ${node.color || 'bg-white'} ${node.borderColor || 'border-slate-200'} border-2`} style={{ transform: 'rotate(45deg) scale(0.70)' }}></div>
                            )}
                            {/* Cylinder Shape */}
                            {node.shape === 'cylinder' && (
                                <div className="absolute inset-0 flex flex-col">
                                    <div className={`h-4 w-full rounded-[100%] ${node.color || 'bg-white'} ${node.borderColor || 'border-slate-200'} border-2 border-b-0 absolute top-0 z-10`}></div>
                                    <div className={`flex-grow w-full ${node.color || 'bg-white'} ${node.borderColor || 'border-slate-200'} border-x-2 border-b-2 mt-2 rounded-b-[20px] relative z-0`}></div>
                                </div>
                            )}

                            {/* Image Node */}
                            {node.type === 'image' && node.src && <img src={node.src} alt={node.label} className="w-full h-full object-cover pointer-events-none select-none rounded-lg" />}

                            {/* Node Content */}
                            <div className={`relative z-10 w-full h-full flex flex-col ${node.textStyle?.align === 'center' ? 'items-center justify-center text-center' : node.textStyle?.align === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
                                {node.type !== 'text' && node.type !== 'sticky' && node.type !== 'image' && node.icon && (
                                    <div className="mb-1 pointer-events-none">{renderIcon(node.icon, node.color)}</div>
                                )}
                                {node.type !== 'image' && (
                                    <div className={`outline-none min-h-[1.5em] w-full leading-tight
                                        ${node.type === 'sticky' ? 'font-handwriting text-lg leading-relaxed h-full text-slate-900' : `${finalTextColor} font-medium`}
                                        ${node.type === 'text' ? 'text-lg' : 'text-sm'}
                                        ${node.textStyle?.bold ? 'font-bold' : ''}
                                        ${node.textStyle?.italic ? 'italic' : ''}
                                        ${node.textStyle?.underline ? 'underline' : ''}
                                    `} contentEditable suppressContentEditableWarning onBlur={(e) => updateNodeProperty('label', e.currentTarget.innerText)}>{node.label}</div>
                                )}
                            </div>

                            {/* Connection Handles (On Hover) */}
                            <div className="absolute top-1/2 -right-3 w-4 h-4 rounded-full bg-transparent hover:bg-brand-200 flex items-center justify-center cursor-crosshair group-hover/node:opacity-100 opacity-0 transition-opacity z-30" onMouseDown={(e) => handleConnectStart(e, node.id)}><div className="w-2 h-2 rounded-full bg-brand-500"></div></div>
                            <div className="absolute top-1/2 -left-3 w-4 h-4 rounded-full bg-transparent hover:bg-brand-200 flex items-center justify-center cursor-crosshair group-hover/node:opacity-100 opacity-0 transition-opacity z-30" onMouseDown={(e) => handleConnectStart(e, node.id)}><div className="w-2 h-2 rounded-full bg-brand-500"></div></div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-transparent hover:bg-brand-200 flex items-center justify-center cursor-crosshair group-hover/node:opacity-100 opacity-0 transition-opacity z-30" onMouseDown={(e) => handleConnectStart(e, node.id)}><div className="w-2 h-2 rounded-full bg-brand-500"></div></div>
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-transparent hover:bg-brand-200 flex items-center justify-center cursor-crosshair group-hover/node:opacity-100 opacity-0 transition-opacity z-30" onMouseDown={(e) => handleConnectStart(e, node.id)}><div className="w-2 h-2 rounded-full bg-brand-500"></div></div>

                            {/* Selection & Resize Handles */}
                            {isSelected && (
                                <>
                                    {/* Resize Handles */}
                                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border border-brand-500 rounded-full cursor-nwse-resize z-50" onMouseDown={(e) => handleResizeMouseDown(e, node.id, 'nw')} />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-brand-500 rounded-full cursor-nesw-resize z-50" onMouseDown={(e) => handleResizeMouseDown(e, node.id, 'ne')} />
                                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-brand-500 rounded-full cursor-nesw-resize z-50" onMouseDown={(e) => handleResizeMouseDown(e, node.id, 'sw')} />
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-brand-500 rounded-full cursor-nwse-resize z-50" onMouseDown={(e) => handleResizeMouseDown(e, node.id, 'se')} />
                                    
                                    {/* Floating Context Menu */}
                                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-xl rounded-lg flex items-center p-1 gap-1 z-50 animate-fade-in-up controls-layer whitespace-nowrap">
                                        <button onClick={() => deleteSelectedElements()} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Delete"><Trash2 size={14}/></button>
                                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                        <button onClick={() => updateNodeTextStyle('bold', !node.textStyle?.bold)} className={`p-1.5 rounded hover:bg-slate-100 ${node.textStyle?.bold ? 'bg-slate-100 text-brand-600' : 'text-slate-500'}`}><Bold size={14}/></button>
                                        <button onClick={() => updateNodeTextStyle('align', 'left')} className={`p-1.5 rounded hover:bg-slate-100 ${node.textStyle?.align === 'left' ? 'text-brand-600' : 'text-slate-500'}`}><AlignLeft size={14}/></button>
                                        <button onClick={() => updateNodeTextStyle('align', 'center')} className={`p-1.5 rounded hover:bg-slate-100 ${node.textStyle?.align === 'center' ? 'text-brand-600' : 'text-slate-500'}`}><AlignCenter size={14}/></button>
                                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                        <div className="flex gap-1 px-1">
                                            {['rectangle', 'rounded', 'diamond', 'circle', 'cylinder'].map(s => (
                                                <button key={s} onClick={() => updateNodeProperty('shape', s)} className={`p-1 rounded hover:bg-slate-100 ${node.shape === s ? 'text-brand-600' : 'text-slate-400'}`}>
                                                    {s === 'rectangle' ? <Square size={12}/> : s === 'circle' ? <Circle size={12}/> : s === 'diamond' ? <Hexagon size={12}/> : s === 'cylinder' ? <Database size={12}/> : <LayoutIcon size={12}/>}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                        <div className="flex gap-1 px-1">
                                            {COLORS.slice(0, 5).map(c => (
                                                <button key={c} onClick={() => updateNodeProperty('color', `bg-[${c}]`)} className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: c }} />
                                            ))}
                                            <button onClick={() => updateNodeProperty('color', 'bg-white')} className="w-3 h-3 rounded-full border border-slate-200 bg-white" />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )})}
                </div>
                {nodes.length === 0 && !isGenerating && <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-dark-muted pointer-events-none"><div className="text-center flex flex-col items-center"><Mascot pose="idle" size={100} className="mb-4 opacity-75" /><p className="text-lg font-medium">Canvas is empty</p><p className="text-sm">Use the AI on the left to start.</p></div></div>}
            </div>
        )}
      </div>

      {/* My Maps Modal */}
      {isMapListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in-up">
            <div className="bg-white dark:bg-dark-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-4 border-b border-slate-100 dark:border-dark-border flex justify-between items-center bg-white dark:bg-dark-surface z-10 sticky top-0">
                     <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-dark-text"><FolderOpen className="text-brand-500"/> My Maps</h2>
                     <button onClick={() => setIsMapListOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-border rounded-full text-slate-500"><X size={20}/></button>
                </div>
                <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3 bg-slate-50 dark:bg-dark-bg">
                     <Button onClick={() => { createNewMap(); setIsMapListOpen(false); }} fullWidth icon={Plus} variant="outline" className="border-dashed py-4 justify-center bg-white dark:bg-dark-surface dark:border-dark-border dark:text-dark-text">Create New Map</Button>
                     {mapList.map(m => (
                         <div key={m.id} onClick={() => { loadMap(m.id); setIsMapListOpen(false); }} className="cursor-pointer group flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-dark-border hover:border-brand-300 hover:shadow-md transition-all bg-white dark:bg-dark-surface">
                             <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
                                     <LayoutIcon size={24} />
                                 </div>
                                 <div>
                                     <h3 className="font-bold text-slate-800 dark:text-dark-text group-hover:text-brand-600 transition-colors">{m.title}</h3>
                                     <p className="text-xs text-slate-400">Last edited: {new Date(m.updatedAt).toLocaleDateString()} {new Date(m.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                 </div>
                             </div>
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={(e) => handleRenameMap(e, m.id, m.title)} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-border rounded-full text-slate-500 dark:text-dark-muted" title="Rename"><Edit2 size={16}/></button>
                                 <button onClick={(e) => handleDuplicateMap(e, m.id)} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-border rounded-full text-slate-500 dark:text-dark-muted" title="Duplicate"><Copy size={16}/></button>
                                 <button onClick={(e) => handleDeleteMap(e, m.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-red-500" title="Delete"><Trash2 size={16}/></button>
                             </div>
                         </div>
                     ))}
                     {mapList.length === 0 && <p className="text-center text-slate-400 py-8">No saved maps yet. Create one to get started!</p>}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MapApp;
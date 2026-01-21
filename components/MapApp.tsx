import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Send, Plus, Trash2, Download, Eraser, 
  ZoomIn, ZoomOut, GripVertical, Save, Share2, 
  Undo, Redo, Maximize, Circle, Square, Triangle, 
  Database, Globe, Code, Cpu, Cloud, FileText, Lightbulb, GitMerge, Rocket, RefreshCw,
  FolderOpen, Check, Loader2, MoreVertical, Edit2, ChevronDown, FileJson, FileImage, FileType,
  Sun, Moon, MousePointer, Hand, StickyNote, Type, LayoutList, Grid, Network, Upload, Copy,
  ArrowUpRight, Image as ImageIcon, MessageSquare, X, User, MessageCircle,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Box, Wand2, LogOut, Palette
} from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import Button from './Button';
import { 
    NodeData, EdgeData, MapState, NodeBorderStyle, MapMetadata, MapStyle, ViewMode, InteractionMode,
    Comment, ChatMessage, Cursor, UserProfile, NodeShape, TextStyle
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
    'bg-green-50', 'bg-blue-50', 'bg-indigo-50', 'bg-purple-50', 'bg-pink-50'
];

// Helper to generate a demo map
const getDemoMap = (): { nodes: NodeData[], edges: EdgeData[] } => {
    const nodes: NodeData[] = [
        { id: 'start', x: 50, y: 250, label: 'Start', type: 'step', shape: 'circle', color: 'bg-green-50', borderColor: 'border-green-500', width: 80, height: 80, textStyle: { bold: true, align: 'center' } },
        { id: 'process1', x: 200, y: 240, label: 'Analyze Input', type: 'process', shape: 'rectangle', color: 'bg-white', width: 160, height: 100, icon: 'code', textStyle: { align: 'center' } },
        { id: 'decision', x: 450, y: 240, label: 'Is Valid?', type: 'process', shape: 'diamond', color: 'bg-yellow-50', borderColor: 'border-yellow-500', width: 140, height: 140, textStyle: { bold: true, align: 'center', fontSize: 'sm' } },
        { id: 'db', x: 450, y: 450, label: 'Save to DB', type: 'database', shape: 'cylinder', color: 'bg-blue-50', borderColor: 'border-blue-500', width: 120, height: 120, icon: 'database', textStyle: { align: 'center' } },
        { id: 'end_success', x: 700, y: 470, label: 'Success', type: 'step', shape: 'rounded', color: 'bg-green-100', width: 100, height: 60, textStyle: { bold: true } },
        { id: 'review', x: 700, y: 260, label: 'Manual Review', type: 'process', shape: 'rectangle', color: 'bg-red-50', width: 140, height: 80, icon: 'step' },
        { id: 'note', x: 200, y: 100, label: 'Check API \nRate Limits', type: 'text', shape: 'rectangle', color: 'bg-transparent', width: 150, height: 60, textStyle: { italic: true, fontSize: 'sm', align: 'left' } }
    ];

    const edges: EdgeData[] = [
        { id: 'e1', from: 'start', to: 'process1' },
        { id: 'e2', from: 'process1', to: 'decision' },
        { id: 'e3', from: 'decision', to: 'db', label: 'Yes' },
        { id: 'e4', from: 'decision', to: 'review', label: 'No' },
        { id: 'e5', from: 'db', to: 'end_success' },
        { id: 'e6', from: 'note', to: 'process1' } // Annotation
    ];
    return { nodes, edges };
};

const getSmoothPath = (x1: number, y1: number, x2: number, y2: number) => {
  const curvature = 0.4;
  const hx1 = x1 + Math.abs(x2 - x1) * curvature;
  const hx2 = x2 - Math.abs(x2 - x1) * curvature;
  return `M ${x1} ${y1} C ${hx1} ${y1} ${hx2} ${y2} ${x2} ${y2}`;
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
  const imageInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  // -- Global App State --
  const [currentUser, setCurrentUser] = useState<UserProfile>({ 
      id: session?.user?.id || 'local-user', 
      name: session?.user?.email?.split('@')[0] || 'Guest', 
      color: COLORS[Math.floor(Math.random() * COLORS.length)] 
  });
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);
  const [mapTitle, setMapTitle] = useState("Untitled Map");
  const [mapList, setMapList] = useState<MapMetadata[]>([]);
  const [isMapListOpen, setIsMapListOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // -- Canvas State --
  const [prompt, setPrompt] = useState(initialPrompt);
  const [aiStyle, setAiStyle] = useState<MapStyle>('mindmap');
  const [viewMode, setViewMode] = useState<ViewMode>('canvas');
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

  // -- Collaboration & Productivity Features --
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeCommentsNodeId, setActiveCommentsNodeId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [cursors, setCursors] = useState<Record<string, Cursor>>({});
  
  // -- Color Picker State --
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  
  // -- Realtime --
  const channelRef = useRef<any>(null);

  // --- Theme Effect ---
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- Initialize Supabase/Realtime ---
  useEffect(() => {
     if (!RealtimeService.isAvailable() || !currentMapId) return;
     if (channelRef.current) supabase?.removeChannel(channelRef.current);

     const channel = RealtimeService.subscribeToMap(
         currentMapId,
         (payload) => console.log('Sync update:', payload),
         (cursorPayload: any) => {
             if (cursorPayload.userId !== currentUser.id) {
                setCursors(prev => ({ ...prev, [cursorPayload.userId]: cursorPayload }));
             }
         }
     );
     channelRef.current = channel;
     return () => { if (channelRef.current) supabase?.removeChannel(channelRef.current); };
  }, [currentMapId]);

  const broadcastCursor = useCallback((x: number, y: number) => {
      if (channelRef.current) {
          RealtimeService.sendCursor(channelRef.current, {
              userId: currentUser.id,
              userName: currentUser.name,
              color: currentUser.color,
              x, y,
              lastActive: Date.now()
          });
      }
  }, [currentUser]);

  // --- State Management with Robust Undo/Redo ---
  // ... (applyStateChange, undo, redo, deleteSelectedElements logic unchanged) ...
  const applyStateChange = useCallback((newNodes: NodeData[], newEdges: EdgeData[], actionName: string) => {
      setNodes(newNodes);
      setEdges(newEdges);
      setHistory(prev => {
          const newHistory = prev.slice(0, historyIndex + 1);
          newHistory.push({ nodes: newNodes, edges: newEdges, action: actionName });
          if (newHistory.length > 50) newHistory.shift();
          return newHistory;
      });
      setHistoryIndex(prev => {
          const nextIndex = prev + 1;
          return nextIndex >= 50 ? 49 : nextIndex; 
      });
      markUnsaved();
  }, [historyIndex]);

  const undo = () => { if (historyIndex > 0) { const prevState = history[historyIndex - 1]; setNodes(prevState.nodes); setEdges(prevState.edges); setHistoryIndex(historyIndex - 1); markUnsaved(); } };
  const redo = () => { if (historyIndex < history.length - 1) { const nextState = history[historyIndex + 1]; setNodes(nextState.nodes); setEdges(nextState.edges); setHistoryIndex(historyIndex + 1); markUnsaved(); } };

  const deleteSelectedElements = useCallback(() => {
      if (!selectedNodeId) return;
      const newNodes = nodes.filter(n => n.id !== selectedNodeId);
      const newEdges = edges.filter(e => e.from !== selectedNodeId && e.to !== selectedNodeId);
      applyStateChange(newNodes, newEdges, 'Delete Node');
      setSelectedNodeId(null);
  }, [nodes, edges, selectedNodeId, applyStateChange]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).isContentEditable) return;
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (selectedNodeId) { e.preventDefault(); deleteSelectedElements(); }
            return;
        }
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 'p': e.preventDefault(); setInteractionMode('pointer'); break;
                case 'a': e.preventDefault(); setInteractionMode('pan'); break;
                case 's': e.preventDefault(); addNode('sticky'); break;
                case 'r': e.preventDefault(); handleFitView(); break;
                case 'z': e.preventDefault(); if (e.shiftKey) redo(); else undo(); break;
            }
        } else if (e.altKey) {
             if (e.key.toLowerCase() === 't') { e.preventDefault(); addNode('text'); }
        } else {
            if (e.key === 'Escape') { setSelectedNodeId(null); setConnectingNodeId(null); setEditingEdgeId(null); setActiveCommentsNodeId(null); }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, selectedNodeId, historyIndex, deleteSelectedElements]);

  // --- Map Management (Load/Save/Create) ---
  // ... (unchanged logic for map management) ...
  useEffect(() => {
    const list = StorageService.listMaps();
    setMapList(list);
    if (!initialPrompt) {
      if (list.length > 0) {
        if (list.length === 0) loadDemoMap();
        else loadMap(list[0].id);
      } else loadDemoMap();
    } else {
      createNewMap(true);
      handleGenerate();
    }
  }, []);

  const loadDemoMap = () => {
      const demoData = getDemoMap();
      setMapTitle("Demo Workflow");
      setNodes(demoData.nodes);
      setEdges(demoData.edges);
      setHistory([{ nodes: demoData.nodes, edges: demoData.edges, action: 'Load Demo' }]);
      setHistoryIndex(0);
      setSaveStatus('unsaved');
      setCurrentMapId(null); 
      setTimeout(handleFitView, 100);
  };

  const loadMap = (id: string) => {
    const mapDoc = StorageService.loadMap(id);
    if (mapDoc) {
      setCurrentMapId(mapDoc.id);
      setMapTitle(mapDoc.title);
      setNodes(mapDoc.data.nodes);
      setEdges(mapDoc.data.edges);
      setComments(mapDoc.comments || []);
      setHistory([{ ...mapDoc.data, action: 'Load Map' }]);
      setHistoryIndex(0);
      setSaveStatus('saved');
      handleFitView();
      setIsMapListOpen(false);
      setChatMessages([]); 
    }
  };

  const createNewMap = (skipSave = false) => {
    if (!skipSave && mapList.length >= 10) { alert("Workspace limit (10) reached. Please delete a map first."); return; }
    const newId = skipSave ? null : StorageService.saveMap({ title: "Untitled Map", data: { nodes: [], edges: [] } }).id;
    setCurrentMapId(newId);
    setMapTitle("Untitled Map");
    setNodes([]);
    setEdges([]);
    setComments([]);
    setHistory([{ nodes: [], edges: [], action: 'New Map' }]);
    setHistoryIndex(0);
    setTransform({ x: 0, y: 0, k: 1 });
    if (!skipSave) refreshMapList();
  };

  const refreshMapList = () => { setMapList(StorageService.listMaps()); };

  const saveCurrentMap = () => {
    setSaveStatus('saving');
    setTimeout(() => {
        const savedDoc = StorageService.saveMap({
            id: currentMapId || undefined,
            title: mapTitle,
            data: { nodes, edges },
            comments: comments
        });
        setCurrentMapId(savedDoc.id);
        setSaveStatus('saved');
        refreshMapList();
    }, 400);
  };

  const handleDeleteMap = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this map?")) {
      StorageService.deleteMap(id);
      refreshMapList();
      if (currentMapId === id) createNewMap();
    }
  };

  const handleDuplicateMap = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (mapList.length >= 10) { alert("Workspace limit (10) reached."); return; }
    const mapToDup = StorageService.loadMap(id);
    if (mapToDup) { StorageService.saveMap({ title: `Copy of ${mapToDup.title}`, data: mapToDup.data }); refreshMapList(); }
  };

  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!json.nodes || !json.edges) throw new Error("Invalid map format");
        const newMap = StorageService.saveMap({ title: json.meta?.title || "Imported Map", data: { nodes: json.nodes, edges: json.edges } });
        loadMap(newMap.id);
        setIsMapListOpen(false);
      } catch (err) { console.error("Import failed", err); alert("Failed to import map."); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => { addNode('image', e.target?.result as string); };
      reader.readAsDataURL(file);
      event.target.value = '';
  };

  const handleAutoLayout = () => {
      if (nodes.length === 0) return;
      const newNodes = LayoutService.computeLayout(nodes, edges, aiStyle);
      applyStateChange(newNodes, edges, 'Auto Layout');
      setTimeout(handleFitView, 50);
  };

  // Auto-save
  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0 && !currentMapId) return;
    const timer = setTimeout(() => { if (saveStatus === 'unsaved') saveCurrentMap(); }, 2000);
    return () => clearTimeout(timer);
  }, [nodes, edges, mapTitle, saveStatus, comments]);

  const markUnsaved = () => { if (saveStatus !== 'unsaved') setSaveStatus('unsaved'); };

  // --- Reset Color Picker on selection change ---
  useEffect(() => {
      setIsColorPickerOpen(false);
  }, [selectedNodeId]);

  // --- Chat/AI/Layout Handlers (unchanged) ---
  const sendChatMessage = () => { if (!chatInput.trim()) return; const msg: ChatMessage = { id: crypto.randomUUID(), userId: currentUser.id, userName: currentUser.name, content: chatInput, createdAt: Date.now() }; setChatMessages(prev => [...prev, msg]); setChatInput(""); setTimeout(() => chatScrollRef.current?.scrollTo(0, chatScrollRef.current.scrollHeight), 100); };
  const addComment = (text: string) => { if (!activeCommentsNodeId || !text.trim()) return; setComments(prev => [...prev, { id: crypto.randomUUID(), nodeId: activeCommentsNodeId, userId: currentUser.id, userName: currentUser.name, content: text, createdAt: Date.now() }]); markUnsaved(); };
  const deleteComment = (id: string) => { setComments(prev => prev.filter(c => c.id !== id)); markUnsaved(); };
  const handleGenerate = async () => { if (!prompt.trim() || !containerRef.current) return; setIsGenerating(true); try { const { title, mapState } = await AIService.generateMap(prompt, aiStyle); setMapTitle(title); applyStateChange(mapState.nodes, mapState.edges, 'AI Generate'); setTimeout(handleFitView, 100); } catch (error) { alert("Failed to generate map."); } finally { setIsGenerating(false); } };
  
  // --- Viewport & Coords (unchanged) ---
  const toWorldPos = (clientX: number, clientY: number) => { if (!containerRef.current) return { x: 0, y: 0 }; const rect = containerRef.current.getBoundingClientRect(); return { x: (clientX - rect.left - transform.x) / transform.k, y: (clientY - rect.top - transform.y) / transform.k }; };
  const getMapBounds = () => { if (nodes.length === 0) return { minX: 0, minY: 0, width: 800, height: 600 }; let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity; nodes.forEach(n => { minX = Math.min(minX, n.x); minY = Math.min(minY, n.y); maxX = Math.max(maxX, n.x + (n.width || 200)); maxY = Math.max(maxY, n.y + (n.height || 100)); }); const padding = 50; return { minX: minX - padding, minY: minY - padding, width: Math.max(800, maxX - minX + padding * 2), height: Math.max(600, maxY - minY + padding * 2) }; };
  
  // --- Interactions (unchanged) ---
  const handleMouseDown = (e: React.MouseEvent) => { if (editingEdgeId) setEditingEdgeId(null); if ((e.target as HTMLElement).classList.contains('canvas-bg')) { if (interactionMode === 'pan' || e.button === 1) { setIsPanning(true); setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y }); setSelectedNodeId(null); } else { setSelectedNodeId(null); } } };
  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => { e.stopPropagation(); if (connectingNodeId) return; if (interactionMode === 'pan') return; const node = nodes.find(n => n.id === id); if (!node) return; setSelectedNodeId(id); setDraggingNodeId(id); const worldPos = toWorldPos(e.clientX, e.clientY); setDragOffset({ x: worldPos.x - node.x, y: worldPos.y - node.y }); };
  const handleResizeStart = (e: React.MouseEvent, id: string, handle: string) => { e.stopPropagation(); e.preventDefault(); const node = nodes.find(n => n.id === id); if(!node) return; setResizingNodeId(id); setResizeHandle(handle); setResizeStart({ x: e.clientX, y: e.clientY }); setInitialNodeState({ x: node.x, y: node.y, w: node.width || 200, h: node.height || 100 }); };
  const handleConnectStart = (e: React.MouseEvent, id: string) => { e.stopPropagation(); e.preventDefault(); setConnectingNodeId(id); const worldPos = toWorldPos(e.clientX, e.clientY); setMousePos(worldPos); };
  const handleMouseUp = (e: React.MouseEvent) => { if (resizingNodeId) { applyStateChange(nodes, edges, 'Resize Node'); setResizingNodeId(null); setResizeStart(null); setInitialNodeState(null); setResizeHandle(null); return; } if (draggingNodeId) { applyStateChange(nodes, edges, 'Move Node'); setDraggingNodeId(null); } setIsPanning(false); if (connectingNodeId) { const target = (e.target as HTMLElement).closest('.node-element'); if (target) { const targetId = target.getAttribute('data-id'); if (targetId && targetId !== connectingNodeId) { const newEdges = [...edges, { id: `edge-${Date.now()}`, from: connectingNodeId, to: targetId, label: '' }]; applyStateChange(nodes, newEdges, 'Add Connection'); } } setConnectingNodeId(null); } };
  const handleMouseMove = (e: React.MouseEvent) => { const worldPos = toWorldPos(e.clientX, e.clientY); broadcastCursor(worldPos.x, worldPos.y); if (isPanning) { setTransform({ ...transform, x: e.clientX - panStart.x, y: e.clientY - panStart.y }); return; } if (resizingNodeId && resizeStart && initialNodeState && resizeHandle) { const scale = transform.k; const dx = (e.clientX - resizeStart.x) / scale; const dy = (e.clientY - resizeStart.y) / scale; setNodes(prev => prev.map(n => { if (n.id === resizingNodeId) { let newX = initialNodeState.x, newY = initialNodeState.y, newW = initialNodeState.w, newH = initialNodeState.h; if (resizeHandle.includes('e')) newW = Math.max(50, initialNodeState.w + dx); if (resizeHandle.includes('s')) newH = Math.max(50, initialNodeState.h + dy); if (resizeHandle.includes('w')) { const w = Math.max(50, initialNodeState.w - dx); newX = initialNodeState.x + (initialNodeState.w - w); newW = w; } if (resizeHandle.includes('n')) { const h = Math.max(50, initialNodeState.h - dy); newY = initialNodeState.y + (initialNodeState.h - h); newH = h; } return { ...n, x: newX, y: newY, width: newW, height: newH }; } return n; })); return; } setMousePos(worldPos); if (draggingNodeId) { setNodes(prev => prev.map(n => { if (n.id === draggingNodeId) { return { ...n, x: worldPos.x - dragOffset.x, y: worldPos.y - dragOffset.y }; } return n; })); } };
  const handleZoom = (delta: number) => { setTransform(prev => ({ ...prev, k: Math.max(0.1, Math.min(3, prev.k + delta)) })); };
  const handleFitView = () => { if (nodes.length === 0 || !containerRef.current) { setTransform({ x: 0, y: 0, k: 1 }); return; } let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity; nodes.forEach(n => { minX = Math.min(minX, n.x); minY = Math.min(minY, n.y); maxX = Math.max(maxX, n.x + (n.width || 200)); maxY = Math.max(maxY, n.y + (n.height || 100)); }); const padding = 100; const container = containerRef.current.getBoundingClientRect(); const contentWidth = maxX - minX + padding * 2; const contentHeight = maxY - minY + padding * 2; const scaleX = container.width / contentWidth; const scaleY = container.height / contentHeight; const scale = Math.min(scaleX, scaleY, 1); const x = (container.width - contentWidth * scale) / 2 - minX * scale + padding * scale; const y = (container.height - contentHeight * scale) / 2 - minY * scale + padding * scale; setTransform({ x, y, k: scale }); };
  const updateNodeProperty = (prop: keyof NodeData, value: any) => { if (!selectedNodeId && viewMode !== 'outline') return; if (!selectedNodeId) return; const newNodes = nodes.map(n => n.id === selectedNodeId ? { ...n, [prop]: value } : n); applyStateChange(newNodes, edges, `Update Node ${prop}`); };
  const updateNodeTextStyle = (prop: keyof TextStyle, value: any) => { if (!selectedNodeId) return; const newNodes = nodes.map(n => { if (n.id === selectedNodeId) { const currentStyle = n.textStyle || {}; return { ...n, textStyle: { ...currentStyle, [prop]: value } }; } return n; }); applyStateChange(newNodes, edges, 'Update Text Style'); };
  const addNode = (type: string, src?: string) => { if (!containerRef.current) return; const rect = containerRef.current.getBoundingClientRect(); const centerX = (rect.width / 2 - transform.x) / transform.k; const centerY = (rect.height / 2 - transform.y) / transform.k; let label = 'New Node'; let color = 'bg-white'; let icon = type; let width = 200; let height = 100; let shape: NodeShape = 'rectangle'; if (type === 'sticky') { label = 'Note...'; color = 'bg-yellow-200'; icon = 'sticky'; width = 200; height = 200; } else if (type === 'text') { label = 'Type here'; color = 'bg-transparent'; icon = 'text'; } else if (type === 'image') { label = 'Image'; color = 'bg-white'; icon = 'image'; width = 300; height = 200; } else if (type === 'process') { shape = 'rectangle'; height = 80; } else if (type === 'idea') { shape = 'rounded'; height = 80; } else if (type === 'database') { shape = 'cylinder'; height = 80; icon = 'database'; width = 120; } const newNode: NodeData = { id: `manual-${Date.now()}`, x: centerX - (width/2), y: centerY - (height/2), label: label, type: type as any, shape, color, borderColor: 'border-slate-200', borderStyle: 'solid', icon: icon, width, height, src }; applyStateChange([...nodes, newNode], edges, 'Add Node'); };
  const handleClearCanvas = () => { if (nodes.length === 0) return; if (confirm("Are you sure you want to clear the canvas?")) { applyStateChange([], [], 'Clear Canvas'); setTransform({ x: 0, y: 0, k: 1 }); } };
  
  // Export handlers (unchanged)
  const handleExportJson = () => { if (nodes.length === 0) return; const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ meta: { title: mapTitle, created: Date.now() }, nodes, edges })); const downloadAnchorNode = document.createElement('a'); downloadAnchorNode.setAttribute("href", dataStr); downloadAnchorNode.setAttribute("download", `${mapTitle.replace(/\s+/g, '-').toLowerCase()}.json`); document.body.appendChild(downloadAnchorNode); downloadAnchorNode.click(); downloadAnchorNode.remove(); setIsExportMenuOpen(false); };
  const handleExportImage = async (format: 'png' | 'jpeg') => { if (!contentRef.current || nodes.length === 0) return; setIsExporting(true); try { const bounds = getMapBounds(); const padding = 50; const config = { backgroundColor: darkMode ? '#0f172a' : '#f1f5f9', width: bounds.width, height: bounds.height, style: { transform: `translate(${-bounds.minX + padding}px, ${-bounds.minY + padding}px) scale(1)`, transformOrigin: 'top left', width: '100%', height: '100%' }, filter: (node: HTMLElement) => !node.classList?.contains('controls-layer') }; const dataUrl = format === 'png' ? await toPng(contentRef.current, config) : await toJpeg(contentRef.current, config); const link = document.createElement('a'); link.download = `${mapTitle.replace(/\s+/g, '-').toLowerCase()}.${format}`; link.href = dataUrl; link.click(); } catch (err) { console.error("Export failed", err); alert("Failed to export image. Please try again."); } finally { setIsExporting(false); setIsExportMenuOpen(false); } };
  const handleExportPdf = async () => { if (!contentRef.current || nodes.length === 0) return; setIsExporting(true); try { const bounds = getMapBounds(); const padding = 50; const config = { backgroundColor: darkMode ? '#0f172a' : '#ffffff', width: bounds.width, height: bounds.height, style: { transform: `translate(${-bounds.minX + padding}px, ${-bounds.minY + padding}px) scale(1)`, transformOrigin: 'top left', width: '100%', height: '100%' }, filter: (node: HTMLElement) => !node.classList?.contains('controls-layer') }; const imgData = await toPng(contentRef.current, config); const pdf = new jsPDF({ orientation: bounds.width > bounds.height ? 'landscape' : 'portrait', unit: 'px', format: [bounds.width, bounds.height] }); pdf.addImage(imgData, 'PNG', 0, 0, bounds.width, bounds.height); pdf.save(`${mapTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`); } catch (err) { console.error("PDF Export failed", err); alert("Failed to export PDF."); } finally { setIsExporting(false); setIsExportMenuOpen(false); } };

  // Render Helpers
  const getNodeCenter = (node: NodeData) => { const width = node.width || 200; const height = node.height || 100; return { x: node.x + width / 2, y: node.y + height / 2 }; };
  const renderIcon = (iconKey?: string) => { const Icon = ICON_MAP[iconKey || 'idea'] || Lightbulb; return <Icon size={18} />; };
  const startEditingEdge = (edge: EdgeData) => { setEditingEdgeId(edge.id); setEdgeLabelBuffer(edge.label || ""); };
  const saveEdgeLabel = () => { if (editingEdgeId) { const newEdges = edges.map(e => e.id === editingEdgeId ? { ...e, label: edgeLabelBuffer } : e); applyStateChange(nodes, newEdges, 'Rename Connection'); setEditingEdgeId(null); } };

  return (
    <div className={`flex flex-col h-screen overflow-hidden font-sans ${darkMode ? 'dark bg-dark-bg text-dark-text' : 'bg-slate-50 text-slate-900'}`}>
      <input type="file" ref={fileInputRef} onChange={handleImportJson} className="hidden" accept=".json" />
      <input type="file" ref={imageInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

      {/* Top Bar */}
      <header className="bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-dark-border h-16 flex items-center px-4 justify-between shrink-0 z-20 shadow-sm transition-colors">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-border rounded-full text-slate-500 dark:text-dark-muted transition-colors"><ArrowLeft size={20} /></button>
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
           <Button size="sm" onClick={saveCurrentMap} icon={Save} className="mr-2" disabled={saveStatus === 'saving'}>Save</Button>
           
           {/* View Mode */}
           <div className="flex bg-slate-100 dark:bg-dark-bg p-0.5 rounded-lg mr-2">
                <button onClick={() => setViewMode('canvas')} className={`p-1.5 rounded-md transition-all ${viewMode === 'canvas' ? 'bg-white dark:bg-dark-surface shadow text-brand-600' : 'text-slate-500 dark:text-dark-muted'}`} title="Canvas Mode"><Grid size={18}/></button>
                <button onClick={() => setViewMode('outline')} className={`p-1.5 rounded-md transition-all ${viewMode === 'outline' ? 'bg-white dark:bg-dark-surface shadow text-brand-600' : 'text-slate-500 dark:text-dark-muted'}`} title="Document Mode"><LayoutList size={18}/></button>
           </div>

           <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-500 dark:text-dark-muted hover:bg-slate-100 dark:hover:bg-dark-border rounded-full mr-2">{darkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
           <button onClick={() => setIsMapListOpen(!isMapListOpen)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isMapListOpen ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20' : 'hover:bg-slate-100 dark:hover:bg-dark-border text-slate-600 dark:text-dark-muted'}`}><FolderOpen size={18} /> My Maps</button>
           
           <div className="h-6 w-px bg-slate-200 dark:bg-dark-border mx-2"></div>
           
           <div className="relative">
               <Button size="sm" variant="outline" icon={isExporting ? Loader2 : Download} onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} disabled={isExporting || nodes.length === 0}>
                  {isExporting ? 'Exporting...' : 'Export'} <ChevronDown size={14} className="ml-1 opacity-50"/>
               </Button>
               {isExportMenuOpen && (
                   <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-slate-100 dark:border-dark-border overflow-hidden z-50 animate-fade-in-up">
                       <div className="p-2">
                           <button onClick={handleExportJson} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-dark-text hover:bg-slate-50 dark:hover:bg-dark-border rounded-lg transition-colors">
                               <FileJson size={16} className="text-brand-500"/> JSON Data
                           </button>
                           <button onClick={() => handleExportImage('png')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-dark-text hover:bg-slate-50 dark:hover:bg-dark-border rounded-lg transition-colors">
                               <FileImage size={16} className="text-blue-500"/> PNG Image
                           </button>
                           <button onClick={() => handleExportImage('jpeg')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-dark-text hover:bg-slate-50 dark:hover:bg-dark-border rounded-lg transition-colors">
                               <FileImage size={16} className="text-purple-500"/> JPEG Image
                           </button>
                           <button onClick={handleExportPdf} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-dark-text hover:bg-slate-50 dark:hover:bg-dark-border rounded-lg transition-colors">
                               <FileType size={16} className="text-red-500"/> PDF Document
                           </button>
                       </div>
                   </div>
               )}
           </div>

           <div className="h-6 w-px bg-slate-200 dark:bg-dark-border mx-2"></div>
           
           <div className="relative group">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs border border-brand-200"
              >
                  {currentUser.name.charAt(0).toUpperCase()}
              </button>
              {/* Profile Dropdown */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-slate-100 dark:border-dark-border overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-3 border-b border-slate-50 dark:border-dark-border">
                      <p className="font-bold text-sm text-slate-800 dark:text-dark-text">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 truncate">{session?.user?.email || 'Guest User'}</p>
                  </div>
                  <div className="p-1">
                      {onLogout && (
                          <button 
                            onClick={onLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                             <LogOut size={16} /> Sign Out
                          </button>
                      )}
                  </div>
              </div>
           </div>
        </div>
      </header>

      {/* ... Rest of the component (Canvas, Sidebar, etc.) remains identical ... */}
      <div className="flex flex-grow overflow-hidden relative">
        {/* Map List Drawer */}
        {isMapListOpen && (
            <div className="absolute top-0 right-0 w-72 h-full bg-white dark:bg-dark-surface border-l border-slate-200 dark:border-dark-border z-40 shadow-xl flex flex-col animate-fade-in-up">
                <div className="p-4 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
                    <h3 className="font-bold text-slate-700 dark:text-dark-text">My Maps</h3>
                    <div className="flex gap-2">
                        <button onClick={() => fileInputRef.current?.click()} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 flex items-center gap-1"><Upload size={12}/> Import</button>
                        <button onClick={() => createNewMap()} className="text-xs bg-brand-600 text-white px-2 py-1 rounded hover:bg-brand-700 flex items-center gap-1"><Plus size={12}/> New</button>
                    </div>
                </div>
                <div className="overflow-y-auto flex-grow p-2 space-y-2">
                    {mapList.map(map => (
                        <div key={map.id} onClick={() => loadMap(map.id)} className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all group relative ${currentMapId === map.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface'}`}>
                            <div className="font-medium text-slate-800 dark:text-dark-text truncate pr-16">{map.title}</div>
                            <div className="text-xs text-slate-400 mt-1">Edited {new Date(map.updatedAt).toLocaleDateString()}</div>
                            <div className="absolute top-3 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => handleDuplicateMap(e, map.id)} className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded"><Copy size={14} /></button>
                                <button onClick={(e) => handleDeleteMap(e, map.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

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
                    <Button size="sm" variant="outline" className="justify-start gap-2 h-auto py-2 px-2" onClick={() => addNode('idea')}><Lightbulb size={16} /> Idea</Button>
                    <Button size="sm" variant="outline" className="justify-start gap-2 h-auto py-2 px-2" onClick={() => addNode('sticky')}><StickyNote size={16} /> Sticky</Button>
                    <Button size="sm" variant="outline" className="justify-start gap-2 h-auto py-2 px-2" onClick={() => addNode('text')}><Type size={16} /> Text</Button>
                    <Button size="sm" variant="outline" className="justify-start gap-2 h-auto py-2 px-2" onClick={() => imageInputRef.current?.click()}><ImageIcon size={16} /> Image</Button>
                    <Button size="sm" variant="outline" className="justify-start gap-2 h-auto py-2 px-2" onClick={() => addNode('process')}><Box size={16} /> Process</Button>
                    <Button size="sm" variant="outline" className="justify-start gap-2 h-auto py-2 px-2" onClick={() => addNode('database')}><Database size={16} /> Data</Button>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-dark-border">
                    <Button fullWidth variant="ghost" className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50" icon={Eraser} disabled={nodes.length === 0} onClick={handleClearCanvas}>Clear Canvas</Button>
                </div>
             </div>
          </div>
        </aside>

        {viewMode === 'outline' ? (
             <div className="flex-grow bg-slate-50 dark:bg-dark-bg p-8 overflow-y-auto">
                 <div className="max-w-3xl mx-auto bg-white dark:bg-dark-surface shadow-sm border border-slate-200 dark:border-dark-border rounded-xl p-8 min-h-[500px]">
                     <div className="flex items-center justify-between mb-6 border-b pb-4 dark:border-dark-border">
                        <input 
                            className="text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 text-slate-900 dark:text-dark-text w-full"
                            value={mapTitle}
                            onChange={(e) => { setMapTitle(e.target.value); markUnsaved(); }}
                        />
                        <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Document Mode</span>
                     </div>
                     {nodes.length === 0 ? (
                         <p className="text-slate-400 italic">Map is empty. Switch to canvas to add nodes.</p>
                     ) : (
                         <div className="space-y-6">
                             {/* Editable Outline - Grouped by Type */}
                             {Array.from(new Set(nodes.map(n => n.type))).map(type => {
                                 const groupNodes = nodes.filter(n => n.type === type);
                                 if (groupNodes.length === 0) return null;
                                 return (
                                     <div key={type}>
                                         <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">{type}s</h3>
                                         <div className="space-y-2 pl-2 border-l-2 border-slate-100 dark:border-dark-border">
                                             {groupNodes.map(node => (
                                                 <div key={node.id} className="flex items-center gap-2 group">
                                                     <div className={`w-2 h-2 rounded-full ${node.color?.includes('yellow') ? 'bg-yellow-400' : 'bg-brand-500'}`}></div>
                                                     {node.type === 'text' || node.type === 'sticky' ? (
                                                         <textarea 
                                                            className="flex-grow bg-transparent border border-transparent hover:border-slate-200 focus:border-brand-500 rounded px-2 py-1 text-slate-700 dark:text-dark-text text-sm resize-none"
                                                            value={node.label}
                                                            onChange={(e) => {
                                                                const newNodes = nodes.map(n => n.id === node.id ? { ...n, label: e.target.value } : n);
                                                                setNodes(newNodes);
                                                                markUnsaved();
                                                            }}
                                                            onBlur={() => {
                                                                // Commit to history on blur
                                                                applyStateChange(nodes, edges, 'Update Text');
                                                            }}
                                                         />
                                                     ) : (
                                                        <input 
                                                            className="flex-grow bg-transparent border-b border-transparent hover:border-slate-200 focus:border-brand-500 px-2 py-1 text-slate-700 dark:text-dark-text text-sm"
                                                            value={node.label}
                                                            onChange={(e) => {
                                                                const newNodes = nodes.map(n => n.id === node.id ? { ...n, label: e.target.value } : n);
                                                                setNodes(newNodes);
                                                                markUnsaved();
                                                            }}
                                                            onBlur={() => {
                                                                applyStateChange(nodes, edges, 'Update Text');
                                                            }}
                                                        />
                                                     )}
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 )
                             })}
                         </div>
                     )}
                 </div>
             </div>
        ) : (
        /* Canvas Area */
        <div className={`flex-grow relative overflow-hidden canvas-bg transition-colors ${interactionMode === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`} ref={containerRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} style={{ backgroundColor: darkMode ? '#0f172a' : '#f1f5f9', backgroundImage: `radial-gradient(${darkMode ? '#334155' : '#cbd5e1'} 1px, transparent 1px)`, backgroundSize: `${24 * transform.k}px ${24 * transform.k}px`, backgroundPosition: `${transform.x}px ${transform.y}px` }}>
            {interactionMode === 'pan' && <div className="absolute top-4 left-4 z-30 bg-brand-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse flex items-center gap-2 pointer-events-none"><Hand size={14}/> PANNING MODE (CTRL+P to exit)</div>}
            
            {/* Cursors Layer */}
            <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden controls-layer" style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`, transformOrigin: '0 0', width: '100%', height: '100%' }}>
                {Object.values(cursors).map((cursor: Cursor) => (<div key={cursor.userId} className="absolute transition-all duration-100 ease-linear" style={{ left: cursor.x, top: cursor.y }}><MousePointer size={24} fill={cursor.color} color={darkMode ? '#fff' : '#000'} /><span className="absolute left-4 top-4 px-2 py-1 rounded bg-slate-800 text-white text-[10px] whitespace-nowrap opacity-80">{cursor.userName}</span></div>))}
            </div>

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
                <button onClick={handleFitView} className="p-2 hover:bg-slate-50 dark:hover:bg-dark-border rounded text-slate-600" title="Fit Content (CTRL+R)"><Maximize size={20} /></button>
                <button onClick={handleAutoLayout} className="p-2 hover:bg-slate-50 dark:hover:bg-dark-border rounded text-slate-600" title="Auto Layout"><Wand2 size={20} /></button>
            </div>
            
            <div ref={contentRef} style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`, transformOrigin: '0 0', width: '100%', height: '100%', pointerEvents: 'none' }}>
                <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-0">
                    <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill={darkMode ? '#94a3b8' : '#cbd5e1'} /></marker></defs>
                    {edges.map(edge => {
                    const fromNode = nodes.find(n => n.id === edge.from);
                    const toNode = nodes.find(n => n.id === edge.to);
                    if (!fromNode || !toNode) return null;
                    const start = getNodeCenter(fromNode);
                    const end = getNodeCenter(toNode);
                    return (<g key={edge.id}><path d={getSmoothPath(start.x, start.y, end.x, end.y)} stroke={darkMode ? '#475569' : '#cbd5e1'} strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" /></g>);
                    })}
                    {connectingNodeId && (<path d={getSmoothPath(getNodeCenter(nodes.find(n => n.id === connectingNodeId)!).x, getNodeCenter(nodes.find(n => n.id === connectingNodeId)!).y, mousePos.x, mousePos.y)} stroke="#brand-500" strokeWidth="2" strokeDasharray="5,5" fill="none" className="stroke-brand-500 animate-dash" />)}
                </svg>

                {edges.map(edge => {
                     const fromNode = nodes.find(n => n.id === edge.from);
                     const toNode = nodes.find(n => n.id === edge.to);
                     if (!fromNode || !toNode) return null;
                     const start = getNodeCenter(fromNode);
                     const end = getNodeCenter(toNode);
                     const centerX = (start.x + end.x) / 2;
                     const centerY = (start.y + end.y) / 2;
                     if (editingEdgeId === edge.id) { return (<div key={edge.id} className="absolute pointer-events-auto z-20" style={{ left: centerX, top: centerY, transform: 'translate(-50%, -50%)' }}><input autoFocus className="text-xs text-center border border-brand-500 rounded shadow-lg px-2 py-1 outline-none min-w-[60px] bg-white dark:bg-dark-surface dark:text-dark-text" value={edgeLabelBuffer} onChange={(e) => setEdgeLabelBuffer(e.target.value)} onBlur={saveEdgeLabel} onKeyDown={(e) => e.key === 'Enter' && saveEdgeLabel()} /></div>) }
                     if (edge.label) { return (<div key={edge.id} className="absolute pointer-events-auto cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-border px-1 rounded transition-colors" style={{ left: centerX, top: centerY, transform: 'translate(-50%, -50%)' }} onDoubleClick={(e) => { e.stopPropagation(); startEditingEdge(edge); }}><span className="text-[10px] text-slate-400 font-medium dark:text-dark-muted bg-white/80 dark:bg-dark-bg/80 px-1 rounded">{edge.label}</span></div>) }
                     return (<div key={edge.id} className="absolute pointer-events-auto cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 group" style={{ left: centerX, top: centerY, width: 24, height: 24, transform: 'translate(-50%, -50%)' }} onDoubleClick={(e) => { e.stopPropagation(); startEditingEdge(edge); }}><div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-dark-border"></div></div>)
                })}

                {nodes.map(node => {
                    const nodeComments = comments.filter(c => c.nodeId === node.id);
                    const isSelected = selectedNodeId === node.id;
                    return (
                    <div key={node.id} data-id={node.id}
                    className={`node-element absolute transition-shadow pointer-events-auto group
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
                        {/* Custom Shapes (Diamond, Cylinder) */}
                        {node.shape === 'diamond' && (
                             <div className={`absolute inset-0 ${node.color || 'bg-white'} ${node.borderColor || 'border-slate-200'} border-2`} style={{ transform: 'rotate(45deg) scale(0.70)' }}></div>
                        )}
                         {node.shape === 'cylinder' && (
                             <div className="absolute inset-0 flex flex-col">
                                 <div className={`h-4 w-full rounded-[100%] ${node.color || 'bg-white'} ${node.borderColor || 'border-slate-200'} border-2 border-b-0 absolute top-0 z-10`}></div>
                                 <div className={`flex-grow w-full ${node.color || 'bg-white'} ${node.borderColor || 'border-slate-200'} border-x-2 border-b-2 mt-2 rounded-b-[20px] relative z-0`}></div>
                             </div>
                        )}

                        {node.type === 'image' && node.src && <img src={node.src} alt={node.label} className="w-full h-full object-cover pointer-events-none select-none rounded-lg" />}

                        <div className={`relative z-10 w-full h-full flex flex-col ${node.textStyle?.align === 'center' ? 'items-center justify-center text-center' : node.textStyle?.align === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
                            {node.type !== 'text' && node.type !== 'sticky' && node.type !== 'image' && node.icon && (
                                <div className="text-slate-500 dark:text-dark-muted mb-1 pointer-events-none">{renderIcon(node.icon)}</div>
                            )}
                            {node.type !== 'image' && (
                                <div className={`font-medium outline-none min-h-[1.5em] w-full
                                    ${node.type === 'sticky' ? 'font-handwriting text-lg leading-relaxed h-full' : 'text-slate-800 dark:text-dark-text'}
                                    ${node.type === 'text' ? 'text-lg' : ''}
                                    ${node.textStyle?.bold ? 'font-bold' : ''}
                                    ${node.textStyle?.italic ? 'italic' : ''}
                                    ${node.textStyle?.underline ? 'underline' : ''}
                                `} contentEditable suppressContentEditableWarning onBlur={(e) => updateNodeProperty('label', e.currentTarget.innerText)}>{node.label}</div>
                            )}
                        </div>

                        {/* Floating Toolbar */}
                        {isSelected && (
                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-xl rounded-lg flex items-center p-1 gap-1 z-50 animate-fade-in-up controls-layer">
                                <button onClick={() => deleteSelectedElements()} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Delete"><Trash2 size={14}/></button>
                                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                <button onClick={() => updateNodeTextStyle('bold', !node.textStyle?.bold)} className={`p-1.5 rounded hover:bg-slate-100 ${node.textStyle?.bold ? 'bg-slate-100 text-brand-600' : 'text-slate-500'}`}><Bold size={14}/></button>
                                <button onClick={() => updateNodeTextStyle('italic', !node.textStyle?.italic)} className={`p-1.5 rounded hover:bg-slate-100 ${node.textStyle?.italic ? 'bg-slate-100 text-brand-600' : 'text-slate-500'}`}><Italic size={14}/></button>
                                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                <button onClick={() => updateNodeTextStyle('align', 'left')} className={`p-1.5 rounded hover:bg-slate-100 ${!node.textStyle?.align || node.textStyle?.align === 'left' ? 'bg-slate-100 text-brand-600' : 'text-slate-500'}`}><AlignLeft size={14}/></button>
                                <button onClick={() => updateNodeTextStyle('align', 'center')} className={`p-1.5 rounded hover:bg-slate-100 ${node.textStyle?.align === 'center' ? 'bg-slate-100 text-brand-600' : 'text-slate-500'}`}><AlignCenter size={14}/></button>
                                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                <div className="relative">
                                    <button 
                                        onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                                        className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
                                        title="Change Color"
                                    >
                                        <Palette size={14} />
                                    </button>
                                    {isColorPickerOpen && (
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-xl rounded-lg grid grid-cols-5 gap-1 w-32 z-50">
                                            {BG_COLORS.map(c => (
                                                <button 
                                                    key={c} 
                                                    onClick={() => { updateNodeProperty('color', c); setIsColorPickerOpen(false); }} 
                                                    className={`w-5 h-5 rounded-full border border-slate-200 ${c} hover:scale-110 transition-transform`}
                                                    title={c.replace('bg-', '')}
                                                ></button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                <button onClick={() => updateNodeProperty('shape', 'rectangle')} title="Rectangle" className="p-1 text-slate-500 hover:text-brand-600"><Square size={14}/></button>
                                <button onClick={() => updateNodeProperty('shape', 'circle')} title="Circle" className="p-1 text-slate-500 hover:text-brand-600"><Circle size={14}/></button>
                                <button onClick={() => updateNodeProperty('shape', 'diamond')} title="Diamond" className="p-1 text-slate-500 hover:text-brand-600"><Triangle size={14}/></button>
                                <button onClick={() => updateNodeProperty('shape', 'cylinder')} title="Database" className="p-1 text-slate-500 hover:text-brand-600"><Database size={14}/></button>
                            </div>
                        )}

                        {nodeComments.length > 0 && <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow border-2 border-white z-20 cursor-pointer hover:scale-110 transition-transform" onClick={(e) => { e.stopPropagation(); setActiveCommentsNodeId(node.id); }}>{nodeComments.length}</div>}
                        {interactionMode !== 'pan' && node.type !== 'text' && <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-crosshair group/handle z-50" onMouseDown={(e) => handleConnectStart(e, node.id)}><div className={`w-3 h-3 bg-slate-200 dark:bg-dark-border border border-slate-400 rounded-full transition-colors ${connectingNodeId === node.id ? 'bg-brand-500 scale-125' : 'group-hover/handle:bg-brand-400'}`}></div></div>}
                        {isSelected && node.type !== 'text' && (<><div className="absolute top-0 left-0 w-3 h-3 -translate-x-1 -translate-y-1 bg-white border border-brand-500 cursor-nw-resize z-50 rounded-full" onMouseDown={(e) => handleResizeStart(e, node.id, 'nw')}></div><div className="absolute top-0 right-0 w-3 h-3 translate-x-1 -translate-y-1 bg-white border border-brand-500 cursor-ne-resize z-50 rounded-full" onMouseDown={(e) => handleResizeStart(e, node.id, 'ne')}></div><div className="absolute bottom-0 left-0 w-3 h-3 -translate-x-1 translate-y-1 bg-white border border-brand-500 cursor-sw-resize z-50 rounded-full" onMouseDown={(e) => handleResizeStart(e, node.id, 'sw')}></div><div className="absolute bottom-0 right-0 w-3 h-3 translate-x-1 translate-y-1 bg-white border border-brand-500 cursor-se-resize z-50 rounded-full" onMouseDown={(e) => handleResizeStart(e, node.id, 'se')}></div></>)}
                    </div>
                )})}
            </div>
            {nodes.length === 0 && !isGenerating && <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-dark-muted pointer-events-none"><div className="text-center"><p className="text-lg font-medium">Canvas is empty</p><p className="text-sm">Use the AI on the left to start cooking.</p></div></div>}
        </div>
        )}
        
        {/* Comments & Chat Panels */}
        {activeCommentsNodeId && (
            <div className="absolute top-16 right-4 w-80 bg-white dark:bg-dark-surface shadow-xl rounded-lg border border-slate-200 dark:border-dark-border z-40 flex flex-col max-h-[500px] animate-fade-in-up">
                <div className="p-3 border-b border-slate-100 dark:border-dark-border flex items-center justify-between"><h3 className="font-bold text-sm text-slate-700 dark:text-dark-text">Comments</h3><button onClick={() => setActiveCommentsNodeId(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button></div>
                <div className="flex-grow overflow-y-auto p-3 space-y-3">{comments.filter(c => c.nodeId === activeCommentsNodeId).map(comment => (<div key={comment.id} className="bg-slate-50 dark:bg-dark-bg p-2 rounded text-sm group"><div className="flex justify-between items-start mb-1"><span className="font-bold text-xs text-slate-600 dark:text-dark-muted">{comment.userName}</span><span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div><p className="text-slate-800 dark:text-dark-text">{comment.content}</p>{comment.userId === currentUser.id && (<button onClick={() => deleteComment(comment.id)} className="text-[10px] text-red-400 hover:text-red-600 mt-1 opacity-0 group-hover:opacity-100">Delete</button>)}</div>))}</div>
                <div className="p-3 border-t border-slate-100 dark:border-dark-border"><input className="w-full text-sm border border-slate-200 dark:border-dark-border rounded px-2 py-1.5 focus:ring-2 focus:ring-brand-500 bg-transparent" placeholder="Add a comment..." onKeyDown={(e) => { if (e.key === 'Enter') { addComment(e.currentTarget.value); e.currentTarget.value = ''; } }} /></div>
            </div>
        )}
        <div className={`absolute bottom-4 right-4 z-40 flex flex-col items-end pointer-events-none`}>
            {isChatOpen && (
                <div className="bg-white dark:bg-dark-surface shadow-2xl rounded-lg border border-slate-200 dark:border-dark-border w-80 h-96 mb-4 flex flex-col pointer-events-auto animate-fade-in-up">
                    <div className="p-3 border-b border-slate-100 dark:border-dark-border flex items-center justify-between bg-slate-50 dark:bg-dark-bg rounded-t-lg"><h3 className="font-bold text-sm text-slate-700 dark:text-dark-text flex items-center gap-2"><MessageCircle size={16}/> Workspace Chat</h3><button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button></div>
                    <div ref={chatScrollRef} className="flex-grow overflow-y-auto p-3 space-y-3">{chatMessages.length === 0 && <div className="text-center text-slate-400 text-xs py-8">Start the conversation...</div>}{chatMessages.map(msg => (<div key={msg.id} className={`flex flex-col ${msg.userId === currentUser.id ? 'items-end' : 'items-start'}`}><div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${msg.userId === currentUser.id ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-dark-border text-slate-800 dark:text-dark-text'}`}>{msg.content}</div><span className="text-[10px] text-slate-400 mt-1 px-1">{msg.userName} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>))}</div>
                    <div className="p-3 border-t border-slate-100 dark:border-dark-border"><div className="relative"><input className="w-full text-sm border border-slate-200 dark:border-dark-border rounded-full px-4 py-2 pr-10 focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-transparent" placeholder="Type a message..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()} /><button onClick={sendChatMessage} className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-500 hover:text-brand-600 p-1"><Send size={16}/></button></div></div>
                </div>
            )}
            <button onClick={() => setIsChatOpen(!isChatOpen)} className="bg-brand-600 hover:bg-brand-700 text-white p-3 rounded-full shadow-lg pointer-events-auto transition-transform hover:scale-105 flex items-center justify-center relative">{isChatOpen ? <X size={24}/> : <MessageCircle size={24}/>}{!isChatOpen && chatMessages.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full border-2 border-white"></span>}</button>
        </div>

      </div>
    </div>
  );
};

export default MapApp;
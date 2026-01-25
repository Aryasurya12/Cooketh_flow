import React, { useEffect, useRef, useState } from 'react';
import { 
  Database, Globe, Code, Cpu, Cloud, FileText, Lightbulb, 
  GitMerge, Rocket, RefreshCw, StickyNote, Type, Image as ImageIcon 
} from 'lucide-react';
import { MapState, NodeData } from '../types';

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

interface DiagramPreviewProps {
  data: MapState;
}

// --- ORTHOGONAL ROUTING LOGIC (Mirrors MapApp) ---
const getEdgePath = (source: NodeData, target: NodeData) => {
    const sW = source.width || 200;
    const sH = source.height || 100;
    const tW = target.width || 200;
    const tH = target.height || 100;

    const src = {
        right: { x: source.x + sW, y: source.y + sH / 2 },
        bottom: { x: source.x + sW / 2, y: source.y + sH },
    };

    const tgt = {
        left: { x: target.x, y: target.y + tH / 2 },
        top: { x: target.x + tW / 2, y: target.y },
    };

    const isTargetRight = target.x > source.x + sW;
    const isTargetBelow = target.y > source.y + sH;
    const isTargetAlignedY = Math.abs((source.y + sH/2) - (target.y + tH/2)) < 30;
    const isTargetAlignedX = Math.abs((source.x + sW/2) - (target.x + tW/2)) < 30;

    // Horizontal Flow
    if (isTargetRight && isTargetAlignedY) {
        return `M ${src.right.x} ${src.right.y} L ${tgt.left.x} ${tgt.left.y}`;
    }

    // Vertical Flow (Branch Down)
    if (isTargetBelow && isTargetAlignedX) {
        return `M ${src.bottom.x} ${src.bottom.y} L ${tgt.top.x} ${tgt.top.y}`;
    }

    // Fallback
    return `M ${src.right.x} ${src.right.y} L ${tgt.left.x} ${tgt.left.y}`;
};

const getContrastColor = (bgClass?: string) => {
  if (!bgClass) return 'text-slate-900';
  const darkBgs = ['bg-brand-500', 'bg-brand-600', 'bg-brand-900', 'bg-slate-900', 'bg-slate-800', 'bg-blue-500', 'bg-blue-600', 'bg-red-500', 'bg-red-600', 'bg-green-500', 'bg-green-600', 'bg-purple-600', 'bg-indigo-600'];
  if (darkBgs.some(cls => bgClass.includes(cls))) return 'text-white';
  return 'text-slate-900';
};

const DiagramPreview: React.FC<DiagramPreviewProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current || data.nodes.length === 0) return;

    const padding = 60; 
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    data.nodes.forEach(n => {
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + (n.width || 200));
        maxY = Math.max(maxY, n.y + (n.height || 100));
    });

    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;
    const { width: containerWidth, height: containerHeight } = containerRef.current.getBoundingClientRect();

    const scaleX = containerWidth / contentWidth;
    const scaleY = containerHeight / contentHeight;
    const fitScale = Math.min(scaleX, scaleY, 1) * 0.9;

    const offsetX = (containerWidth - contentWidth * fitScale) / 2 - minX * fitScale + padding * fitScale;
    const offsetY = (containerHeight - contentHeight * fitScale) / 2 - minY * fitScale + padding * fitScale;

    setScale(fitScale);
    setOffset({ x: offsetX, y: offsetY });

  }, [data]);

  const renderIcon = (iconKey?: string, colorClass?: string) => {
    const Icon = ICON_MAP[iconKey || 'idea'] || Lightbulb;
    const textColor = getContrastColor(colorClass);
    return <Icon size={20} className={textColor === 'text-white' ? 'text-white/90' : 'text-slate-500'} />;
  };

  return (
    <div ref={containerRef} className="w-full h-[400px] bg-slate-50/50 relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-50 pointer-events-none"></div>

      <div 
        className="absolute top-0 left-0 w-full h-full origin-top-left transition-transform duration-500 ease-out"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
      >
        <svg className="absolute top-0 left-0 w-[4000px] h-[4000px] pointer-events-none overflow-visible z-0">
            <defs>
                <marker id="preview-arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                </marker>
            </defs>
            {data.edges.map(edge => {
                const fromNode = data.nodes.find(n => n.id === edge.from);
                const toNode = data.nodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;
                
                const d = getEdgePath(fromNode, toNode);
                
                // Label positioning approx
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

                return (
                    <g key={edge.id} className="animate-[dash_1s_linear_infinite]">
                        <path 
                            d={d} 
                            stroke="#cbd5e1" 
                            strokeWidth="2" 
                            fill="none" 
                            markerEnd="url(#preview-arrowhead)" 
                        />
                        {edge.label && (
                            <foreignObject x={labelX - 50} y={labelY - 12} width="100" height="24" style={{ overflow: 'visible' }}>
                                <div className="flex justify-center items-center w-full h-full">
                                    <span 
                                      className="bg-white border border-slate-200 shadow-sm px-2 py-0.5 rounded-full font-semibold text-slate-600 text-[12px]"
                                    >
                                        {edge.label}
                                    </span>
                                </div>
                            </foreignObject>
                        )}
                    </g>
                );
            })}
        </svg>

        {data.nodes.map((node, index) => {
             const textColorClass = getContrastColor(node.color);

             return (
                <div 
                    key={node.id}
                    className={`absolute flex flex-col items-center justify-center transition-all duration-700
                        ${node.type === 'text' ? 'bg-transparent' : (node.color || 'bg-white')}
                        ${node.borderColor || 'border-slate-200'}
                        ${node.type !== 'text' ? 'border-2 shadow-sm' : ''}
                        ${node.shape === 'circle' ? 'rounded-full' : node.shape === 'rounded' ? 'rounded-xl' : 'rounded-lg'}
                        ${node.shape === 'diamond' ? 'transform rotate-45' : ''}
                        ${node.type === 'sticky' ? 'shadow-lg rotate-1' : ''}
                    `}
                    style={{
                        left: node.x,
                        top: node.y,
                        width: node.width || 200,
                        height: node.height || 100,
                        opacity: 0,
                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`
                    }}
                >
                    {/* Content Rotator fix for Diamonds */}
                    <div className={`w-full h-full flex flex-col items-center justify-center p-2 relative ${node.shape === 'diamond' ? 'transform -rotate-45' : ''}`}>
                        
                        {node.type === 'database' && (
                            <div className="absolute inset-0 flex flex-col pointer-events-none z-0">
                                <div className={`h-3 w-full rounded-[100%] ${node.color || 'bg-white'} border-2 border-inherit border-b-0 absolute top-0 -mt-[2px]`}></div>
                                <div className={`flex-grow w-full border-x-2 border-inherit border-b-2 mt-1 rounded-b-[15px]`}></div>
                            </div>
                        )}
                        
                        {node.type !== 'text' && node.icon && (
                            <div className="mb-2 z-10">{renderIcon(node.icon, node.color)}</div>
                        )}
                        
                        <div 
                            className={`z-10 leading-tight w-full
                                ${node.textStyle?.align === 'left' ? 'text-left' : node.textStyle?.align === 'right' ? 'text-right' : 'text-center'}
                                ${node.textStyle?.bold ? 'font-bold' : 'font-medium'}
                                ${node.type === 'sticky' ? 'font-handwriting text-[18px]' : 'text-[14px]'}
                                ${node.type === 'text' ? 'text-[18px]' : ''}
                                ${textColorClass}
                            `}
                        >
                            {node.label.split('\n').map((line, i) => (
                                <span key={i} className="block">{line}</span>
                            ))}
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default DiagramPreview;
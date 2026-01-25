import { NodeData, EdgeData, MapStyle } from '../types';

export const LayoutService = {
  computeLayout: (nodes: NodeData[], edges: EdgeData[], style: MapStyle = 'mindmap'): NodeData[] => {
    // Clone nodes to avoid mutating state directly
    const newNodes = nodes.map(n => ({ ...n }));
    if (newNodes.length === 0) return [];

    // Build Graph Adjacency
    const adj: Record<string, { id: string; label?: string }[]> = {};
    const parents: Record<string, string[]> = {};
    
    newNodes.forEach(n => { 
        adj[n.id] = []; 
        parents[n.id] = [];
    });
    
    edges.forEach(e => {
        if (adj[e.from]) adj[e.from].push({ id: e.to, label: e.label?.toLowerCase() || '' });
        if (parents[e.to]) parents[e.to].push(e.from);
    });

    // Find Root
    let rootId = newNodes.find(n => n.type === 'root')?.id;
    if (!rootId) {
        const noParents = newNodes.find(n => parents[n.id].length === 0);
        rootId = noParents ? noParents.id : newNodes[0].id;
    }

    const getDims = (n?: NodeData) => ({ w: n?.width || 200, h: n?.height || 100 });

    if (style === 'flowchart') {
        // --- Strict Grid-Based Layout ---
        const COL_WIDTH = 280; 
        const ROW_HEIGHT = 180; 
        
        const occupied = new Set<string>();
        const positions = new Map<string, { col: number, row: number }>();
        const processed = new Set<string>();

        const isFree = (c: number, r: number) => !occupied.has(`${c},${r}`);

        const reserve = (id: string, c: number, minRow: number): number => {
            let r = minRow;
            while (!isFree(c, r)) {
                r++;
            }
            occupied.add(`${c},${r}`);
            positions.set(id, { col: c, row: r });
            processed.add(id);
            return r;
        };

        const layoutNode = (id: string, col: number, minRow: number) => {
            if (processed.has(id)) return;

            const actualRow = reserve(id, col, minRow);

            const children = adj[id] || [];
            const branchChildren = children.filter(c => c.label.includes('yes') || c.label.includes('true'));
            const mainChildren = children.filter(c => !branchChildren.includes(c));

            if (mainChildren.length > 0) {
                mainChildren.forEach((child) => {
                    layoutNode(child.id, col + 1, actualRow);
                });
            }

            if (branchChildren.length > 0) {
                branchChildren.forEach((child) => {
                    layoutNode(child.id, col, actualRow + 1);
                });
            }
        };

        layoutNode(rootId, 0, 0);

        newNodes.forEach(n => {
            const pos = positions.get(n.id);
            if (pos) {
                n.x = pos.col * COL_WIDTH;
                n.y = pos.row * ROW_HEIGHT;
            } else if (!processed.has(n.id)) {
                n.x = 0; 
                n.y = (newNodes.length * ROW_HEIGHT); 
            }
        });

    } else if (style === 'tree') {
        // --- Hierarchical Tree Layout ---
        const LEVEL_HEIGHT = 150;
        const SIBLING_GAP = 220;
        const processed = new Set<string>();
        
        // Recursive width calculation with cycle detection
        const getSubtreeWidth = (id: string, visited: Set<string> = new Set()): number => {
             if (visited.has(id)) return SIBLING_GAP; // Cycle detected or visited in this calculation
             visited.add(id);
             
             const children = adj[id];
             if (!children || children.length === 0) return SIBLING_GAP;
             
             return children.reduce((sum, child) => sum + getSubtreeWidth(child.id, new Set(visited)), 0);
        };

        const layoutTree = (id: string, xOffset: number, depth: number) => {
            if (processed.has(id)) return;
            processed.add(id);

            const node = newNodes.find(n => n.id === id);
            if (node) {
                node.x = xOffset;
                node.y = depth * LEVEL_HEIGHT;
            }

            const children = adj[id];
            if (!children || children.length === 0) return;

            const totalWidth = getSubtreeWidth(id);
            let currentX = xOffset - (totalWidth / 2);

            children.forEach(child => {
                 const childWidth = getSubtreeWidth(child.id);
                 layoutTree(child.id, currentX + (childWidth / 2), depth + 1);
                 currentX += childWidth;
            });
        };

        // Start from root
        layoutTree(rootId, 400, 0); // Center horizontally at start

        // Center entire tree
        const minX = Math.min(...newNodes.map(n => n.x));
        const shiftX = Math.abs(minX) + 100;
        newNodes.forEach(n => n.x += shiftX);

    } else {
        // --- Standard Mindmap / Radial Layout ---
        const processed = new Set<string>();
        const queue: { id: string, layer: number, angleStart: number, angleEnd: number }[] = [];
        
        const rootNode = newNodes.find(n => n.id === rootId);
        if (rootNode) {
            const { w, h } = getDims(rootNode);
            rootNode.x = -w / 2;
            rootNode.y = -h / 2;
        }
        processed.add(rootId);
        
        queue.push({ id: rootId, layer: 0, angleStart: 0, angleEnd: Math.PI * 2 });

        while(queue.length > 0) {
            const { id, layer, angleStart, angleEnd } = queue.shift()!;
            const children = adj[id]?.map(c => c.id) || [];
            const validChildren = children.filter(cid => !processed.has(cid));

            if (validChildren.length === 0) continue;

            const totalAngle = angleEnd - angleStart;
            const step = totalAngle / validChildren.length;
            const radius = 300 + (layer * 220);

            validChildren.forEach((childId, idx) => {
                processed.add(childId);
                const node = newNodes.find(n => n.id === childId);
                const angle = angleStart + (step * idx) + (step / 2);
                
                if (node) {
                    const { w, h } = getDims(node);
                    node.x = (Math.cos(angle) * radius) - (w / 2);
                    node.y = (Math.sin(angle) * radius) - (h / 2);
                }

                queue.push({ 
                    id: childId, 
                    layer: layer + 1, 
                    angleStart: angleStart + (step * idx), 
                    angleEnd: angleStart + (step * (idx + 1)) 
                });
            });
        }
    }

    return newNodes;
  }
};
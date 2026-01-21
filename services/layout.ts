import { NodeData, EdgeData, MapStyle } from '../types';

export const LayoutService = {
  computeLayout: (nodes: NodeData[], edges: EdgeData[], style: MapStyle = 'mindmap'): NodeData[] => {
    // Clone nodes to avoid mutating state directly reference
    const newNodes = nodes.map(n => ({ ...n }));
    
    if (newNodes.length === 0) return [];

    // Build Adjacency Graph
    const adj: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};
    
    newNodes.forEach(n => { 
        adj[n.id] = []; 
        if (inDegree[n.id] === undefined) inDegree[n.id] = 0;
    });
    
    edges.forEach(e => {
        if (adj[e.from]) adj[e.from].push(e.to);
        if (inDegree[e.to] !== undefined) inDegree[e.to]++;
        else inDegree[e.to] = 1;
    });

    // Find Root Node(s)
    // Priority: Explicit 'root' type > Node with 0 in-degree > First defined node
    let rootId = newNodes.find(n => n.type === 'root')?.id;
    if (!rootId) {
        const minIn = Math.min(...Object.values(inDegree).filter(v => typeof v === 'number'));
        rootId = Object.keys(inDegree).find(id => inDegree[id] === minIn);
    }
    if (!rootId) rootId = newNodes[0].id;

    // Helper for node dimensions
    const getDims = (n?: NodeData) => ({ w: n?.width || 200, h: n?.height || 100 });

    if (style === 'flowchart' || style === 'tree') {
         // --- Hierarchical Layout (Top-Down) ---
         const LEVEL_HEIGHT = 180;
         const NODE_SPACING = 250;
         
         const processed = new Set<string>();
         const queue: { id: string, level: number }[] = [{ id: rootId, level: 0 }];
         processed.add(rootId);

         const levelNodes: Record<number, string[]> = {};

         // BFS to assign levels
         while(queue.length > 0) {
             const { id, level } = queue.shift()!;
             if (!levelNodes[level]) levelNodes[level] = [];
             levelNodes[level].push(id);

             const children = adj[id] || [];
             children.forEach(childId => {
                 if (!processed.has(childId)) {
                     processed.add(childId);
                     queue.push({ id: childId, level: level + 1 });
                 }
             });
         }

         // Handle disconnected nodes by placing them at level 0 or below last level
         // For simplicity, we just process connected components from root. 
         // (A production version would handle multiple connected components)

         // Assign positions
         Object.entries(levelNodes).forEach(([lvl, ids]) => {
             const level = parseInt(lvl);
             const rowWidth = ids.length * NODE_SPACING;
             const startX = -(rowWidth / 2) + (NODE_SPACING / 2);
             
             (ids as string[]).forEach((id, index) => {
                 const node = newNodes.find(n => n.id === id);
                 if (node) {
                     const { w, h } = getDims(node);
                     node.x = startX + (index * NODE_SPACING) - (w / 2); // Center align
                     node.y = (level * LEVEL_HEIGHT) - (h / 2);
                 }
             });
         });

    } else {
        // --- Radial Layout (Mindmap) ---
        const processed = new Set<string>();
        const queue: { id: string, layer: number, angleStart: number, angleEnd: number }[] = [];
        
        const rootNode = newNodes.find(n => n.id === rootId);
        if (rootNode) {
            const { w, h } = getDims(rootNode);
            rootNode.x = -w / 2;
            rootNode.y = -h / 2;
        }
        processed.add(rootId);
        
        // Initial circle
        queue.push({ id: rootId, layer: 0, angleStart: 0, angleEnd: Math.PI * 2 });

        while(queue.length > 0) {
            const { id, layer, angleStart, angleEnd } = queue.shift()!;
            const children = adj[id] || [];
            const validChildren = children.filter(cid => !processed.has(cid));

            if (validChildren.length === 0) continue;

            const totalAngle = angleEnd - angleStart;
            const step = totalAngle / validChildren.length;
            const radius = 300 + (layer * 200); // Increase radius per layer

            validChildren.forEach((childId, idx) => {
                processed.add(childId);
                const node = newNodes.find(n => n.id === childId);
                
                // Bisect the angle segment for this child
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
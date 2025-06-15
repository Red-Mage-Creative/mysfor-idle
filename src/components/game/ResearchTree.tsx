
import React, { useState, useRef, useCallback } from 'react';
import { researchNodes } from '@/lib/researchTree';
import ResearchNodeComponent from './ResearchNodeComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/formatters';

interface ResearchTreeProps {
  unlockedNodes: Set<string>;
  onUnlockNode: (nodeId: string) => void;
  researchPoints: number;
}

const NODE_SPACING_REM = 5;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;

const ResearchTree: React.FC<ResearchTreeProps> = ({ unlockedNodes, onUnlockNode, researchPoints }) => {
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const isPrerequisiteMet = (prerequisites: string[]) => {
    if (prerequisites.length === 0) return true;
    return prerequisites.every(id => unlockedNodes.has(id));
  };

  const getNodePosition = (nodeId: string) => {
    const node = researchNodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return { x: node.position.x * NODE_SPACING_REM, y: node.position.y * NODE_SPACING_REM };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - view.x,
      y: e.clientY - view.y,
    };
    if (containerRef.current) {
        containerRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const x = e.clientX - dragStartRef.current.x;
    const y = e.clientY - dragStartRef.current.y;
    setView(prev => ({ ...prev, x, y }));
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    if (containerRef.current) {
        containerRef.current.style.cursor = 'grab';
    }
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const (mouseX, mouseY) = (e.clientX - rect.left, e.clientY - rect.top);

    const zoomFactor = 1.1;
    const newZoom = e.deltaY < 0 ? view.zoom * zoomFactor : view.zoom / zoomFactor;
    const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    
    const zoomRatio = clampedZoom / view.zoom;

    const newX = mouseX - (mouseX - view.x) * zoomRatio;
    const newY = mouseY - (mouseY - view.y) * zoomRatio;

    setView({ x: newX, y: newY, zoom: clampedZoom });
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Research Tree</CardTitle>
        <p className="text-muted-foreground">
          You have <span className="font-bold text-primary">{formatNumber(researchPoints)}</span> Research Points.
        </p>
      </CardHeader>
      <CardContent>
        <div 
            ref={containerRef}
            className="w-full h-[600px] overflow-hidden bg-grid-slate-900/[0.2] p-4 rounded-lg border cursor-grab relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onWheel={handleWheel}
        >
          <div 
            className="relative w-full h-full"
            style={{
                transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
                transformOrigin: '0 0',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            <svg className="absolute top-0 left-0 w-[200rem] h-[100rem]" style={{ pointerEvents: 'none' }}>
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                    </marker>
                    <marker id="arrowhead-unlocked" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" className="fill-green-500" />
                    </marker>
                </defs>
                {researchNodes.map(node => (
                    node.prerequisites.map(prereqId => {
                        const startPos = getNodePosition(prereqId);
                        const endPos = getNodePosition(node.id);
                        const isUnlocked = unlockedNodes.has(node.id) && unlockedNodes.has(prereqId);

                        // Offset to center of node (w-16 h-16 -> 2rem offset)
                        const offset = 2;

                        return (
                            <line
                                key={`${prereqId}-${node.id}`}
                                x1={`${startPos.x + offset}rem`}
                                y1={`${startPos.y + offset}rem`}
                                x2={`${endPos.x + offset}rem`}
                                y2={`${endPos.y + offset}rem`}
                                className={isUnlocked ? 'stroke-green-500' : 'stroke-slate-600'}
                                strokeWidth="2"
                                markerEnd={isUnlocked ? 'url(#arrowhead-unlocked)' : 'url(#arrowhead)'}
                            />
                        )
                    })
                ))}
            </svg>
            <div className="relative">
                {researchNodes.map(node => (
                    <ResearchNodeComponent
                        key={node.id}
                        node={node}
                        isUnlocked={unlockedNodes.has(node.id)}
                        canUnlock={isPrerequisiteMet(node.prerequisites) && !unlockedNodes.has(node.id)}
                        onUnlock={onUnlockNode}
                        researchPoints={researchPoints}
                        nodeSpacing={NODE_SPACING_REM}
                    />
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResearchTree;


import React from 'react';
import { researchNodes } from '@/lib/researchTree';
import ResearchNodeComponent from './ResearchNodeComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/formatters';

interface ResearchTreeProps {
  unlockedNodes: Set<string>;
  onUnlockNode: (nodeId: string) => void;
  researchPoints: number;
}

const ResearchTree: React.FC<ResearchTreeProps> = ({ unlockedNodes, onUnlockNode, researchPoints }) => {
  const isPrerequisiteMet = (prerequisites: string[]) => {
    if (prerequisites.length === 0) return true;
    return prerequisites.every(id => unlockedNodes.has(id));
  };

  const getNodePosition = (nodeId: string) => {
    const node = researchNodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return { x: node.position.x * 7, y: node.position.y * 7 };
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
        <div className="w-full h-[600px] overflow-auto bg-grid-slate-900/[0.2] p-8 rounded-lg border">
          <div className="relative w-[100rem] h-[100rem]">
            <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }}>
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

                        return (
                            <line
                                key={`${prereqId}-${node.id}`}
                                x1={`${startPos.x}rem`}
                                y1={`${startPos.y}rem`}
                                x2={`${endPos.x}rem`}
                                y2={`${endPos.y}rem`}
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

import React, { useState, useRef, useMemo } from 'react';
import { researchNodes, researchNodeMap, researchNodeDependentsMap } from '@/lib/researchTree';
import ResearchNodeComponent from './ResearchNodeComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatNumber } from '@/lib/formatters';
import { Currencies, ResearchEffect } from '@/lib/gameTypes';

interface ResearchTreeProps {
  unlockedNodes: Set<string>;
  onUnlockNode: (nodeId: string) => void;
  currencies: Currencies;
  ancientKnowledgePoints: number;
}

const NODE_SPACING_REM = 4;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 2;

const ResearchTree: React.FC<ResearchTreeProps> = ({ unlockedNodes, onUnlockNode, currencies, ancientKnowledgePoints }) => {
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const researchBonuses = useMemo(() => {
    const bonuses = {
        mana: 1,
        allProduction: 1,
        costReduction: 1,
        manaPerClick: 1,
        essenceFlux: 1,
        researchPoints: 1,
        specificItem: {} as Record<string, number>,
        prestigeLevelBonus: 1,
        offlineProduction: 1,
        golemEffect: 1,
        aetherShardBonus: 1,
        ancientKnowledgeBonus: 1,
        synergyEffect: 1,
    };

    const processEffect = (effect: ResearchEffect) => {
        switch (effect.type) {
            case 'manaMultiplier': bonuses.mana *= effect.value; break;
            case 'allProductionMultiplier': bonuses.allProduction *= effect.value; break;
            case 'costReductionMultiplier': bonuses.costReduction *= effect.value; break;
            case 'manaPerClickMultiplier': bonuses.manaPerClick *= effect.value; break;
            case 'essenceFluxMultiplier': bonuses.essenceFlux *= effect.value; break;
            case 'researchPointsMultiplier': bonuses.researchPoints *= effect.value; break;
            case 'specificItemMultiplier':
                bonuses.specificItem[effect.itemId] = (bonuses.specificItem[effect.itemId] || 1) * effect.value;
                break;
            case 'multiEffect': effect.effects.forEach(processEffect); break;
            case 'prestigeLevelBonusMultiplier': bonuses.prestigeLevelBonus *= effect.value; break;
            case 'offlineProductionMultiplier': bonuses.offlineProduction *= effect.value; break;
            case 'golemEffectMultiplier': bonuses.golemEffect *= effect.value; break;
            case 'aetherShardBonusMultiplier': bonuses.aetherShardBonus *= effect.value; break;
            case 'ancientKnowledgeBonusMultiplier': bonuses.ancientKnowledgeBonus *= effect.value; break;
            case 'prestigeBonusMultiplier': 
                if (effect.target === 'aetherShards') {
                    bonuses.aetherShardBonus *= effect.value;
                }
                break;
            case 'synergyEffectMultiplier': bonuses.synergyEffect *= effect.value; break;
        }
    };

    unlockedNodes.forEach(nodeId => {
        const node = researchNodeMap.get(nodeId);
        if (node) {
            processEffect(node.effect);
        }
    });

    return bonuses;
  }, [unlockedNodes]);

  const formatBonus = (value: number) => {
      if (value === 1) return null;
      const sign = value > 1 ? '+' : '';
      return `${sign}${((value - 1) * 100).toFixed(0)}%`;
  }
  
  const formatItemId = (itemId: string) => {
      return itemId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  const isPrerequisiteMet = (prerequisites: string[]) => {
    if (prerequisites.length === 0) return true;
    return prerequisites.every(id => unlockedNodes.has(id));
  };

  const getNodePosition = (nodeId: string) => {
    const node = researchNodeMap.get(nodeId);
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
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

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
          You have <span className="font-bold text-primary">{formatNumber(currencies.researchPoints)}</span> Research Points.
        </p>
        {ancientKnowledgePoints > 0 && (
            <p className="text-sm text-purple-400">
                Your <span className="font-bold">{ancientKnowledgePoints}</span> points of Ancient Knowledge provide a <span className="font-bold">+{ancientKnowledgePoints * 2}%</span> bonus to all production.
            </p>
        )}
        <Accordion type="single" collapsible className="w-full pt-2">
            <AccordionItem value="bonuses">
                <AccordionTrigger>Show Current Research Bonuses</AccordionTrigger>
                <AccordionContent>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        {formatBonus(researchBonuses.allProduction) && <li>All Production: <span className="font-semibold text-green-400">{formatBonus(researchBonuses.allProduction)}</span></li>}
                        {formatBonus(researchBonuses.mana) && <li>Mana Generation: <span className="font-semibold text-green-400">{formatBonus(researchBonuses.mana)}</span></li>}
                        {formatBonus(researchBonuses.manaPerClick) && <li>Mana Per Click: <span className="font-semibold text-green-400">{formatBonus(researchBonuses.manaPerClick)}</span></li>}
                        {formatBonus(researchBonuses.essenceFlux) && <li>Essence Flux Generation: <span className="font-semibold text-green-400">{formatBonus(researchBonuses.essenceFlux)}</span></li>}
                        {formatBonus(researchBonuses.researchPoints) && <li>Research Point Gain: <span className="font-semibold text-green-400">{formatBonus(researchBonuses.researchPoints)}</span></li>}
                        {formatBonus(researchBonuses.costReduction) && <li>Cost Reduction: <span className="font-semibold text-green-400">{formatBonus(researchBonuses.costReduction)}</span></li>}
                        {formatBonus(researchBonuses.prestigeLevelBonus) && <li>Prestige Level Bonus: <span className="font-semibold text-green-400">{formatBonus(researchBonuses.prestigeLevelBonus)}</span></li>}
                        {formatBonus(researchBonuses.offlineProduction) && <li>Offline Production: <span className="font-semibold text-green-400">{formatBonus(researchBonuses.offlineProduction)}</span></li>}
                        {formatBonus(researchBonuses.golemEffect) && <li>Golem Effectiveness: <span className="font-semibold text-green-400">{formatBonus(researchBonuses.golemEffect)}</span></li>}
                        {formatBonus(researchBonuses.synergyEffect) && <li>Golem Synergy: <span className="font-semibold text-green-400">{formatBonus(researchBonuses.synergyEffect)}</span></li>}
                        {formatBonus(researchBonuses.aetherShardBonus) && <li>Aether Shard Bonus: <span className="font-semibold text-green-400">{formatBonus(researchBonuses.aetherShardBonus)}</span></li>}
                        {formatBonus(researchBonuses.ancientKnowledgeBonus) && <li>Ancient Knowledge Bonus: <span className="font-semibold text-green-400">{formatBonus(researchBonuses.ancientKnowledgeBonus)}</span></li>}
                        {Object.entries(researchBonuses.specificItem).map(([itemId, value]) => (
                            formatBonus(value) && <li key={itemId}>{formatItemId(itemId)} Production: <span className="font-semibold text-green-400">{formatBonus(value)}</span></li>
                        ))}
                    </ul>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
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
            <div className="relative">
                {researchNodes.map(node => (
                    <ResearchNodeComponent
                        key={node.id}
                        node={node}
                        isUnlocked={unlockedNodes.has(node.id)}
                        canUnlock={isPrerequisiteMet(node.prerequisites) && !unlockedNodes.has(node.id)}
                        onUnlock={onUnlockNode}
                        currencies={currencies}
                        nodeSpacing={NODE_SPACING_REM}
                        unlockedNodes={unlockedNodes}
                    />
                ))}
            </div>
            <svg className="absolute top-0 left-0 w-[300rem] h-[200rem]" style={{ pointerEvents: 'none' }}>
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                    </marker>
                    <marker id="arrowhead-unlocked" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" className="fill-green-500" />
                    </marker>
                </defs>
                {researchNodes.map(sourceNode => {
                    const dependents = researchNodeDependentsMap.get(sourceNode.id) || [];
                    return dependents.map(dependentId => {
                        const dependentNode = researchNodeMap.get(dependentId);
                        if (!dependentNode) return null;

                        const startPos = getNodePosition(sourceNode.id);
                        const endPos = getNodePosition(dependentId);
                        const isFullyUnlocked = unlockedNodes.has(sourceNode.id) && unlockedNodes.has(dependentId);
                        const prereqsMetForDependent = isPrerequisiteMet(dependentNode.prerequisites);
                        const isAvailable = unlockedNodes.has(sourceNode.id) && prereqsMetForDependent;

                        const offset = 32; // Half of node size in pixels (w-16 -> 4rem -> 64px, radius 32px)
                        
                        const centerX1 = startPos.x * 16 + offset;
                        const centerY1 = startPos.y * 16 + offset;
                        const centerX2 = endPos.x * 16 + offset;
                        const centerY2 = endPos.y * 16 + offset;

                        const dx = centerX2 - centerX1;
                        const dy = centerY2 - centerY1;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        let x1 = centerX1, y1 = centerY1, x2 = centerX2, y2 = centerY2;

                        if (distance > 0) {
                            const nodeRadiusPixels = 32;
                            const unitX = dx / distance;
                            const unitY = dy / distance;
                        
                            x1 = centerX1 + unitX * nodeRadiusPixels;
                            y1 = centerY1 + unitY * nodeRadiusPixels;
                            x2 = centerX2 - unitX * nodeRadiusPixels;
                            y2 = centerY2 - unitY * nodeRadiusPixels;
                        }

                        return (
                            <line
                                key={`${sourceNode.id}-${dependentId}`}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                className={isFullyUnlocked ? 'stroke-green-500' : (isAvailable ? 'stroke-yellow-500' : 'stroke-slate-600')}
                                strokeWidth="2"
                                markerEnd={isFullyUnlocked ? 'url(#arrowhead-unlocked)' : (isAvailable ? 'url(#arrowhead)' : 'url(#arrowhead)')}
                            />
                        )
                    })
                })}
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResearchTree;

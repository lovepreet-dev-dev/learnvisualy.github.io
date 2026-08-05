import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { NetworkState } from '../../engine/types';


interface NetworkGraphProps {
    network: NetworkState | null;
    width?: number;
    height?: number;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ network, width = 800, height = 500 }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !network) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous

        const layers = network.layers;

        // Configuration for layout
        const margin = { top: 50, right: 50, bottom: 50, left: 100 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // X scale for layers
        // We include "Input" layer visually as index -1ish or 0.
        // Actually network.layers starts at Hidden Layer 1. 
        // We need to visualize inputs as well.
        const numLayers = layers.length + 1; // +1 for Input
        const layerX = d3.scalePoint()
            .domain(d3.range(numLayers).map(String))
            .range([0, innerWidth])
            .padding(0.5);

        // Prepare Nodes
        interface NodeData {
            id: string;
            layerIndex: number;
            neuronIndex: number;
            x: number;
            y: number;
            value: number; // Activation or Input
            type: 'input' | 'hidden' | 'output';
            bias?: number;
        }

        const nodes: NodeData[] = [];
        const links: { source: NodeData, target: NodeData, weight: number, gradient?: number }[] = [];

        // 1. Input Layer Nodes
        const inputSpacing = innerHeight / (network.inputs.length + 1);
        network.inputs.forEach((val, i) => {
            nodes.push({
                id: `Input-${i}`,
                layerIndex: 0,
                neuronIndex: i,
                x: layerX('0') || 0,
                y: (i + 1) * inputSpacing,
                value: val,
                type: 'input'
            });
        });

        // 2. Hidden/Output Layers
        layers.forEach((layer, lIdx) => {
            const visualLayerIndex = lIdx + 1;
            const spacing = innerHeight / (layer.neurons.length + 1);

            layer.neurons.forEach((neuron, nIdx) => {
                const node: NodeData = {
                    id: neuron.id,
                    layerIndex: visualLayerIndex,
                    neuronIndex: nIdx,
                    x: layerX(String(visualLayerIndex)) || 0,
                    y: (nIdx + 1) * spacing,
                    value: neuron.a, // Show activation by default
                    type: lIdx === layers.length - 1 ? 'output' : 'hidden',
                    bias: neuron.bias
                };
                nodes.push(node);

                // Create links from previous layer
                neuron.weights.forEach((w, wIdx) => {
                    // Find source node
                    // If layer is 0 (first hidden), source is Input
                    // Else source is in previous hidden layer
                    let sourceId = '';
                    if (lIdx === 0) {
                        sourceId = `Input-${wIdx}`;
                    } else {
                        const prevLayer = layers[lIdx - 1];
                        // Assuming previous layer neurons are fully connected and in order
                        sourceId = prevLayer.neurons[wIdx].id;
                    }

                    const source = nodes.find(n => n.id === sourceId);
                    if (source) {
                        links.push({
                            source,
                            target: node,
                            weight: w,
                            gradient: neuron.dLoss_dW?.[wIdx]
                        });
                    }
                });
            });
        });

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Draw Links
        g.selectAll('line')
            .data(links)
            .enter()
            .append('line')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)
            .attr('stroke', d => d.weight > 0 ? '#4ade80' : '#f87171') // Green pos, Red neg
            .attr('stroke-width', d => Math.min(Math.abs(d.weight) * 2 + 0.5, 5))
            .attr('stroke-opacity', 0.6);

        // Draw Nodes
        const nodeGroup = g.selectAll('circle')
            .data(nodes)
            .enter()
            .append('g')
            .attr('transform', d => `translate(${d.x},${d.y})`);

        nodeGroup.append('circle')
            .attr('r', 15)
            .attr('fill', () => {
                // Color intensity based on activation?
                // White = 0, Blue = 1?
                // Or just standard slate-800
                return '#1e293b';
            })
            .attr('stroke', '#94a3b8')
            .attr('stroke-width', 2);

        // Text Value inside
        nodeGroup.append('text')
            .text(d => d.value.toFixed(2))
            .attr('dy', 4)
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .attr('font-size', '10px')
            .style('pointer-events', 'none');

        // Label (Bias)
        nodeGroup.filter(d => d.type !== 'input')
            .append('text')
            .text(d => `b:${d.bias?.toFixed(2)}`)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('fill', '#94a3b8')
            .attr('font-size', '10px');

    }, [network, width, height]);

    return (
        <div className="bg-slate-900 rounded-lg shadow-xl overflow-hidden border border-slate-800">
            <svg ref={svgRef} width={width} height={height} className="w-full h-auto" />
        </div>
    );
};

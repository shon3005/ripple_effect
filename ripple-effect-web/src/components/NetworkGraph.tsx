"use client"
// pages/index.tsx
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

import { useCompletionContext } from "@/contexts/completion-context";

// Define TypeScript interfaces for node and link data
type Node = {
	id: string;
	type: 'InitialEvent' | 'Company' | 'PostEvent' | 'Sector/Industry' | 'Macro/GeoPolitical';
	label: string;
	x?: number;
	y?: number;
	fx?: number | null;
	fy?: number | null;
}

type Edge = {
	source: string | Node;
	target: string | Node;
}

const NetworkGraph: React.FC = () => {
	const { graphCompletion, } = useCompletionContext();
	// Create a ref for the SVG element
	const svgRef = useRef<SVGSVGElement | null>(null);

	useEffect(() => {
		try {
			// Assign JSON to network elements
			const nodes: Node[] = JSON.parse(graphCompletion).nodes;
			const links: Edge[] = JSON.parse(graphCompletion).edges;

			// Define dimensions for the SVG container
			const width = window.innerWidth;
			const height = 800;

			if (!svgRef.current) return;

			// Select the SVG element and clear previous content if any
			const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
			svg.selectAll('*').remove();

			// Create the main SVG element with zoom and pan enabled
			const mainSvg = svg
				.attr('width', width)
				.attr('height', height)
				.call(
					d3.zoom<SVGSVGElement, unknown>().on('zoom', (event) => {
						g.attr('transform', event.transform);
					})
				);

			// Append a group element to apply zoom/pan transformations
			const g = mainSvg.append('g');

			// Define an arrow marker for the directed edges
			g.append('defs')
				.append('marker')
				.attr('id', 'arrowhead')
				.attr('viewBox', '0 -5 10 10')
				.attr('refX', 25) // Adjust this based on your node radius
				.attr('refY', 0)
				.attr('markerWidth', 10)
				.attr('markerHeight', 10)
				.attr('orient', 'auto')
				.append('path')
				.attr('d', 'M0,-5L10,0L0,5')
				.attr('fill', '#999');

			// Create a force simulation for the graph layout
			const simulation = d3
				.forceSimulation<Node, Edge>(nodes)
				.force(
					'link',
					d3
						.forceLink<Node, Edge>(links)
						.id((d) => d.id)
						.distance(150)
				)
				.force('charge', d3.forceManyBody().strength(-500))
				.force('center', d3.forceCenter(width / 2, height / 3));

			// Add links (edges) to the graph
			const link = g
				.append('g')
				.attr('class', 'links')
				.selectAll('line')
				.data(links)
				.enter()
				.append('line')
				.attr('stroke', '#999')
				.attr('stroke-width', 2)
				.attr('marker-end', 'url(#arrowhead)');

			// Add nodes to the graph
			const node = g
				.append('g')
				.attr('class', 'nodes')
				.selectAll('circle')
				.data(nodes)
				.enter()
				.append('circle')
				.attr('r', 20)
				.attr('fill', (d) => {
					switch (d.type) {
						case 'InitialEvent':
							return '#f38ba8';
						case 'Company':
							return '#fab387';
						case 'PostEvent':
							return '#a6e3a1';
						case 'Sector/Industry':
							return '#cba6f7';
						case 'Macro/GeoPolitical':
							return '#89b4fa';
						default:
							return 'gray';
					}
				})
				.call(
					d3
						.drag<SVGCircleElement, Node>()
						.on('start', (event, d) => {
							if (!event.active) simulation.alphaTarget(0.3).restart();
							d.fx = d.x;
							d.fy = d.y;
						})
						.on('drag', (event, d) => {
							d.fx = event.x;
							d.fy = event.y;
						})
						.on('end', (event, d) => {
							if (!event.active) simulation.alphaTarget(0);
							d.fx = null;
							d.fy = null;
						})
				);

			// Add labels for the nodes
			const label = g
				.append('g')
				.attr('class', 'labels')
				.selectAll('text')
				.data(nodes)
				.enter()
				.append('text')
				.attr('dy', -25)
				.attr('text-anchor', 'middle')
				.text((d) => d.label);

			// Update positions on every tick of the simulation
			simulation.on('tick', () => {
				// Update link positions
				link
					?.attr('x1', (d) => (d.source as Node).x!)
					?.attr('y1', (d) => (d.source as Node).y!)
					?.attr('x2', (d) => (d.target as Node).x!)
					?.attr('y2', (d) => (d.target as Node).y!);

				// Update node positions
				node?.attr('cx', (d) => d.x!)?.attr('cy', (d) => d.y!);

				// Update label positions
				label?.attr('x', (d) => d.x!)?.attr('y', (d) => d.y!);
			});

			// Cleanup: stop simulation on component unmount
			return () => {
				simulation.stop();
			};
		} catch (_e: unknown) {
			console.log(_e);
			return
		}
	}, [graphCompletion]);

	return (
		<div style={{ padding: '20px' }}>
			<h1>Directed Network Graph</h1>
			<svg ref={svgRef} />
		</div>
	);
};

export default NetworkGraph;


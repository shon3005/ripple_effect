"use client"
// pages/index.tsx
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

// Define TypeScript interfaces for node and link data
type Node = {
	id: string;
	type: 'Event' | 'Company' | 'PostEvent' | 'Sector/Industry' | 'Macro/GeoPolitical';
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
	// Create a ref for the SVG element
	const svgRef = useRef<SVGSVGElement | null>(null);

	useEffect(() => {
		// Sample data based on the earlier graph structure
		const nodes: Node[] = [
			{
				"id": "AA",
				"label": "Event: Klarna IPO",
				"type": "Event"
			},
			{
				"id": "AB",
				"label": "Investor Sentiment Changes",
				"type": "PostEvent"
			},
			{
				"id": "AC",
				"label": "Increased BNPL Awareness",
				"type": "PostEvent"
			},
			{
				"id": "AD",
				"label": "Market Valuation Fluctuations",
				"type": "PostEvent"
			},
			{
				"id": "AE",
				"label": "Consumer Adoption of BNPL",
				"type": "PostEvent"
			},
			{
				"id": "AF",
				"label": "Competitive Pressure on BNPL Company",
				"type": "PostEvent"
			},
			{
				"id": "AG",
				"label": "Klarna (Company)",
				"type": "Company"
			},
			{
				"id": "AH",
				"label": "Affirm",
				"type": "Company"
			},
			{
				"id": "AI",
				"label": "Afterpay",
				"type": "Company"
			},
			{
				"id": "AJ",
				"label": "PayPal",
				"type": "Company"
			},
			{
				"id": "AK",
				"label": "Traditional Banks",
				"type": "Company"
			},
			{
				"id": "AL",
				"label": "Regulatory Scrutiny & Compliance Pressure",
				"type": "Macro/GeoPolitical"
			},
			{
				"id": "AM",
				"label": "Increased Investment in Fintech",
				"type": "PostEvent"
			},
			{
				"id": "AN",
				"label": "BNPL Market Expansion",
				"type": "PostEvent"
			},
			{
				"id": "AO",
				"label": "Economic Climate Uncertainty",
				"type": "Macro/GeoPolitical"
			},
			{
				"id": "AP",
				"label": "Global Competition in Fintech",
				"type": "Macro/GeoPolitical"
			},
			{
				"id": "AQ",
				"label": "Sector: Fintech & Digital Payments Innovation",
				"type": "Sector/Industry"
			},
			{
				"id": "AR",
				"label": "Sector: Retail & E-commerce Growth",
				"type": "Sector/Industry"
			},
			{
				"id": "AS",
				"label": "Sector: Traditional Payment Systems Under Pressure",
				"type": "Sector/Industry"
			},
			{
				"id": "AU",
				"label": "Sector: Changing Consumer Payment Preferences",
				"type": "Sector/Industry"
			}
		];

		const links: Edge[] = [
			{ "source": "AA", "target": "AB" },
			{ "source": "AA", "target": "AC" },
			{ "source": "AA", "target": "AD" },
			{ "source": "AA", "target": "AL" },
			{ "source": "AA", "target": "AM" },
			{ "source": "AB", "target": "AG" },
			{ "source": "AB", "target": "AM" },
			{ "source": "AC", "target": "AE" },
			{ "source": "AC", "target": "AF" },
			{ "source": "AE", "target": "AN" },
			{ "source": "AF", "target": "AH" },
			{ "source": "AF", "target": "AI" },
			{ "source": "AF", "target": "AJ" },
			{ "source": "AF", "target": "AK" },
			{ "source": "AD", "target": "AG" },
			{ "source": "AD", "target": "AH" },
			{ "source": "AD", "target": "AI" },
			{ "source": "AD", "target": "AJ" },
			{ "source": "AD", "target": "AK" },
			{ "source": "AL", "target": "AF" },
			{ "source": "AL", "target": "AG" },
			{ "source": "AL", "target": "AH" },
			{ "source": "AL", "target": "AI" },
			{ "source": "AL", "target": "AJ" },
			{ "source": "AL", "target": "AK" },
			{ "source": "AO", "target": "AB" },
			{ "source": "AO", "target": "AD" },
			{ "source": "AO", "target": "AL" },
			{ "source": "AP", "target": "AF" },
			{ "source": "AP", "target": "AH" },
			{ "source": "AP", "target": "AI" },
			{ "source": "AP", "target": "AJ" },
			{ "source": "AP", "target": "AK" },
			{ "source": "AM", "target": "AN" },
			{ "source": "AM", "target": "AG" },
			{ "source": "AQ", "target": "AC" },
			{ "source": "AQ", "target": "AM" },
			{ "source": "AR", "target": "AE" },
			{ "source": "AR", "target": "AN" },
			{ "source": "AS", "target": "AF" },
			{ "source": "AU", "target": "AE" },
			{ "source": "AU", "target": "AC" }
		];

		// Define dimensions for the SVG container
		const width = window.innerWidth;
		const height = 1200;

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
			.force('center', d3.forceCenter(width / 2, height / 2));

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
					case 'Event':
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
				.attr('x1', (d) => (d.source as Node).x!)
				.attr('y1', (d) => (d.source as Node).y!)
				.attr('x2', (d) => (d.target as Node).x!)
				.attr('y2', (d) => (d.target as Node).y!);

			// Update node positions
			node.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);

			// Update label positions
			label.attr('x', (d) => d.x!).attr('y', (d) => d.y!);
		});

		// Cleanup: stop simulation on component unmount
		return () => {
			simulation.stop();
		};
	}, []);

	return (
		<div style={{ padding: '20px' }}>
			<h1>Directed Network Graph</h1>
			<svg ref={svgRef} />
		</div>
	);
};

export default NetworkGraph;


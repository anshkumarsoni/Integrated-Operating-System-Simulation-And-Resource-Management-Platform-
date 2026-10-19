import React, { useEffect, useRef } from 'react';

const DeadlockGraph = ({ data }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !data.nodes || !data.edges || !svgRef.current) return;

    // A very basic manual layout for nodes since we don't have a library like d3 installed
    const svg = svgRef.current;
    const width = svg.clientWidth || 600;
    const height = svg.clientHeight || 400;

    const processes = data.nodes.filter(n => n.type === 'process');
    const resources = data.nodes.filter(n => n.type === 'resource');

    // Position processes on the left arc, resources on the right arc
    const processNodes = processes.map((n, i) => ({
      ...n,
      x: width * 0.3,
      y: (height / (processes.length + 1)) * (i + 1)
    }));

    const resourceNodes = resources.map((n, i) => ({
      ...n,
      x: width * 0.7,
      y: (height / (resources.length + 1)) * (i + 1)
    }));

    const positionedNodes = [...processNodes, ...resourceNodes];

    // Clear previous SVG content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Add marker for arrows
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Allocation arrow
    const markerAlloc = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    markerAlloc.setAttribute('id', 'arrow-alloc');
    markerAlloc.setAttribute('viewBox', '0 -5 10 10');
    markerAlloc.setAttribute('refX', '20'); // Offset for node radius
    markerAlloc.setAttribute('refY', '0');
    markerAlloc.setAttribute('markerWidth', '6');
    markerAlloc.setAttribute('markerHeight', '6');
    markerAlloc.setAttribute('orient', 'auto');
    const pathAlloc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathAlloc.setAttribute('d', 'M0,-5L10,0L0,5');
    pathAlloc.setAttribute('fill', '#3b82f6'); // blue-500
    markerAlloc.appendChild(pathAlloc);
    
    // Request arrow
    const markerReq = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    markerReq.setAttribute('id', 'arrow-req');
    markerReq.setAttribute('viewBox', '0 -5 10 10');
    markerReq.setAttribute('refX', '20');
    markerReq.setAttribute('refY', '0');
    markerReq.setAttribute('markerWidth', '6');
    markerReq.setAttribute('markerHeight', '6');
    markerReq.setAttribute('orient', 'auto');
    const pathReq = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathReq.setAttribute('d', 'M0,-5L10,0L0,5');
    pathReq.setAttribute('fill', '#f59e0b'); // amber-500
    markerReq.appendChild(pathReq);

    defs.appendChild(markerAlloc);
    defs.appendChild(markerReq);
    svg.appendChild(defs);

    // Draw edges
    data.edges.forEach(edge => {
      const source = positionedNodes.find(n => n.id === edge.from);
      const target = positionedNodes.find(n => n.id === edge.to);

      if (source && target) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', source.x);
        line.setAttribute('y1', source.y);
        line.setAttribute('x2', target.x);
        line.setAttribute('y2', target.y);
        
        if (edge.type === 'allocation') {
          line.setAttribute('stroke', '#3b82f6'); // blue-500
          line.setAttribute('stroke-width', '2');
          line.setAttribute('marker-end', 'url(#arrow-alloc)');
        } else {
          line.setAttribute('stroke', '#f59e0b'); // amber-500
          line.setAttribute('stroke-width', '2');
          line.setAttribute('stroke-dasharray', '5,5');
          line.setAttribute('marker-end', 'url(#arrow-req)');
        }
        
        if (edge.isCycle) {
          line.setAttribute('stroke', '#ef4444'); // red-500
        }
        
        svg.appendChild(line);
      }
    });

    // Draw nodes
    positionedNodes.forEach(node => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${node.x}, ${node.y})`);

      if (node.type === 'process') {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', '16');
        circle.setAttribute('fill', '#1e293b'); // slate-800
        circle.setAttribute('stroke', '#3b82f6'); // blue-500
        circle.setAttribute('stroke-width', '2');
        g.appendChild(circle);
      } else {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '-14');
        rect.setAttribute('y', '-14');
        rect.setAttribute('width', '28');
        rect.setAttribute('height', '28');
        rect.setAttribute('fill', '#1e293b');
        rect.setAttribute('stroke', '#10b981'); // emerald-500
        rect.setAttribute('stroke-width', '2');
        rect.setAttribute('rx', '4');
        g.appendChild(rect);
      }

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dy', '4');
      text.setAttribute('fill', '#f1f5f9'); // slate-100
      text.setAttribute('font-size', '12px');
      text.setAttribute('font-weight', 'bold');
      text.textContent = node.label;
      g.appendChild(text);

      svg.appendChild(g);
    });

  }, [data]);

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-900 border border-slate-800 rounded-xl">
        <span className="text-slate-500">No RAG data available</span>
      </div>
    );
  }

  return (
    <div className="w-full h-80 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative">
      <div className="absolute top-4 left-4 flex flex-col space-y-2 bg-slate-800/80 p-2 rounded text-xs">
        <div className="flex items-center"><div className="w-3 h-3 rounded-full border border-blue-500 mr-2"></div> Process</div>
        <div className="flex items-center"><div className="w-3 h-3 rounded border border-emerald-500 mr-2"></div> Resource</div>
        <div className="flex items-center"><div className="w-4 h-0.5 bg-blue-500 mr-2"></div> Allocation</div>
        <div className="flex items-center"><div className="w-4 h-0.5 border-t border-dashed border-amber-500 mr-2"></div> Request</div>
      </div>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default DeadlockGraph;

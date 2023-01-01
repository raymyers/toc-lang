import React from "react";
import "./Cloud.css";
import { wrapLines }  from "./util"

const intermediatePoint = (start, end, distance) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const ratio = distance / length;
  return {
    x: start.x + dx * ratio,
    y: start.y + dy * ratio
  };
}

const CloudNode = ({text, x, y, width, height}) => {
  const lines = wrapLines(text, 20);
  const lineHeight = 16;
  const textMargin = 12;
  const textHeight = lines.length * lineHeight;
  const textY = y + height / 2 - textHeight / 2 - 4;
  const textX = x + textMargin;
  return (
    <>
      <rect x={x} y={y} rx="10" ry="10" width={width} height={height} />
      <text x={textX} y={textY}>
        {lines.map((line, i) => {
          return (
            <tspan key={i} x={textX} dy={lineHeight}>
              {line}
            </tspan>
          );
        })}
      </text>
    </>
  );
};

const CloudEdge = ({edge}) => {
  return <line
      x1={edge.adjStart.x}
      y1={edge.adjStart.y}
      x2={edge.end.x}
      y2={edge.end.y}
      stroke="#000"
      strokeWidth="3"
      markerStart="url(#startarrow)"
    />
}
export default function Cloud({ ast }) {
  const nodeLabels = {
    "A": "A",
    "B": "B",
    "C": "C",
    "D": "D",
    "D'": "D'"
  };
  if (ast) {
    ast.statements.filter(statement => statement.type = "label").forEach((statement) => {
      nodeLabels[statement.id] = statement.text;
    });
    ast.statements.filter(statement => statement.type = "requirement").forEach((statement) => {
      nodeLabels[statement.id2] = statement.id2Text;
    });
  }
  const x1 = 25;
  const x2 = 250;
  const x3 = 500;
  const y1 = 50;
  const y3 = 300;
  const y2 = (y1 + y3) / 2;
  const nodeWidth = 150;
  const nodeHeight = 75;
  const nodeA = {x: x1, y: y2, w: nodeWidth, h: nodeHeight}
  const nodeB = {x: x2, y: y1, w: nodeWidth, h: nodeHeight}
  const nodeC = {x: x2, y: y3, w: nodeWidth, h: nodeHeight}
  const nodeD = {x: x3, y: y1, w: nodeWidth, h: nodeHeight}
  const nodeDp = {x: x3, y: y3, w: nodeWidth, h: nodeHeight}
  const edgeAB = createEdge(nodeA, nodeB);
  const edgeAC = createEdge(nodeA, nodeC);
  const edgeBD = createEdge(nodeB, nodeD);
  const edgeCDp = createEdge(nodeC, nodeDp);
  const conflictStart = nodeBottomCenterPont(nodeD);
  const conflictEnd = nodeTopCenterPont(nodeDp);
  const conflictMid = midPoint(conflictStart, conflictEnd);
  const conflictEdgePoints = [
    displacePoint(conflictStart, 0, 16),
    displacePoint(conflictMid, -15, 5),
    displacePoint(conflictMid, 15, -5),
    displacePoint(conflictEnd, 0, -16),
  ];
  const conflictEdgePointsString = conflictEdgePoints.map(p => `${p.x},${p.y}`).join(" ");
  return (
    <svg id="cloudSvg" width="800" height="800">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="0"
          refY="1.75"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" transform="scale(0.5 0.5)" />
        </marker>
        <marker id="startarrow" markerWidth="10" markerHeight="7" 
          refX="5" refY="1.75" orient="auto">
          <polygon points="10 0, 10 7, 0 3.5" fill="" transform="scale(0.5 0.5)"  />
        </marker>
        <marker id="endarrow" markerWidth="10" markerHeight="7" 
          refX="0" refY="1.75" orient="auto" markerUnits="strokeWidth">
          <polygon points="0 0, 10 3.5, 0 7" fill="" transform="scale(0.5 0.5)"/>
        </marker>
      </defs>
      <CloudNode text={nodeLabels['A']} x={nodeA.x} y={nodeA.y} width={nodeWidth} height={nodeHeight}/>
      <CloudNode text={nodeLabels['B']} x={nodeB.x} y={nodeB.y} width={nodeWidth} height={nodeHeight}/>
      <CloudNode text={nodeLabels['C']} x={nodeC.x} y={nodeC.y} width={nodeWidth} height={nodeHeight}/>
      <CloudNode text={nodeLabels['D']} x={nodeD.x} y={nodeD.y} width={nodeWidth} height={nodeHeight}/>
      <CloudNode text={nodeLabels["D'"]} x={nodeDp.x} y={nodeDp.y} width={nodeWidth} height={nodeHeight}/>
      <CloudEdge edge={edgeAB} />
      <CloudEdge edge={edgeAC} />
      <CloudEdge edge={edgeBD} />
      <CloudEdge edge={edgeCDp} />
      <polyline 
        points={conflictEdgePointsString}
        markerStart="url(#startarrow)"
        markerEnd="url(#endarrow)"
        style={{fill: "none", stroke: "black", strokeWidth:3}} />
    </svg>
  );
}
function createEdge(startNode: { x: number; y: number; h: number; w: number }, endNode: { x: number; y: number; h: number; w: number }) {
  const edge = {
    start: {
      x: startNode.x + startNode.w,
      y: startNode.y + startNode.h / 2
    },
    adjStart: { x: 0, y: 0 },
    end: {
      x: endNode.x,
      y: endNode.y + endNode.h / 2
    }
  };
  edge.adjStart = intermediatePoint(edge.start, edge.end, 16);
  return edge;
}

function nodeBottomCenterPont(node: { x: number; y: number; w: number; h: number; }) {
  return {
    x: node.x + node.w / 2,
    y: node.y + node.h
  }
}

function nodeTopCenterPont(node: { x: number; y: number; w: number; h: number; }) {
  return {
    x: node.x + node.w / 2,
    y: node.y
  }
}
function midPoint(start: { x: number; y: number; }, end: { x: number; y: number; }) {
  return {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2
  } 
}

function displacePoint(point: { x: number; y: number; }, xDelta: number, yDelta: number) {
  return {
    x: point.x + xDelta,
    y: point.y + yDelta
  }
}


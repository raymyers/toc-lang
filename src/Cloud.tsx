import React from "react"
import { computeResizeTransform, wrapLines } from "./util"

const intermediatePoint = (start, end, distance) => {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.sqrt(dx * dx + dy * dy)
  const ratio = distance / length
  return {
    x: start.x + dx * ratio,
    y: start.y + dy * ratio
  }
}

const CloudNode = ({ text, x, y, width, height, annotation }) => {
  const lines = wrapLines(text, 20)
  const lineHeight = 16
  const textMargin = 12
  const textHeight = lines.length * lineHeight
  const textY = y + height / 2 - textHeight / 2 - 4
  const textX = x + textMargin
  return (
    <>
      <rect x={x} y={y} rx="10" ry="10" width={width} height={height} />
      <text x={textX} y={textY}>
        {lines.map((line, i) => {
          return (
            <tspan key={i} x={textX} dy={lineHeight}>
              {line}
            </tspan>
          )
        })}
      </text>
      <circle
        cx={x}
        cy={y}
        r="10"
        style={{ fill: "white", stroke: "black", strokeWidth: "2px" }}
      ></circle>
      <text x={x - 4} y={y + 4}>
        {annotation}
      </text>
    </>
  )
}

const CloudEdge = ({ edge }) => {
  return (
    <line
      x1={edge.adjStart.x}
      y1={edge.adjStart.y}
      x2={edge.end.x}
      y2={edge.end.y}
      stroke="#000"
      strokeWidth="3"
      markerStart="url(#startarrow)"
    />
  )
}

const Injection = ({ text, edge, dx, dy }) => {
  if (!text) {
    return <></>
  }
  const lines = wrapLines(text, 35)
  const edgeMidPoint = midPoint(edge.start, edge.end)
  const lineHeight = 16
  const textCenterX = edgeMidPoint.x + dx
  const textX = textCenterX - 75
  const textY = edgeMidPoint.y + dy
  const dYMagnitude = dy / Math.abs(dy)
  const textBottomY = textY + lines.length * lineHeight + 7
  const textTopY = textY
  const lineStartY = dYMagnitude === 1 ? textTopY : textBottomY
  const lineStartX = textCenterX
  return (
    <>
      <text x={textX} y={textY}>
        {lines.map((line, i) => {
          return (
            <tspan key={i} x={textX} dy={lineHeight}>
              {line}
            </tspan>
          )
        })}
      </text>
      <line
        x1={lineStartX}
        y1={lineStartY}
        x2={edgeMidPoint.x}
        y2={edgeMidPoint.y}
        stroke="#000"
        strokeDasharray="4 5"
        strokeWidth="2"
      />
    </>
  )
}

export default function Cloud ({
  ast,
  setSvgElem
}: {
  ast: any
  setSvgElem: (svgElem: SVGElement | null) => void
}) {
  const nodeLabels = {
    A: "",
    B: "",
    C: "",
    D: "",
    "D'": ""
  }
  const injections = new Map<string, string>()
  if (ast) {
    ast.statements
      .filter((statement) => statement.type === "label")
      .forEach((statement) => {
        nodeLabels[statement.id] = statement.text
      })
    ast.statements
      .filter((statement) => statement.type === "requirement")
      .forEach((statement) => {
        nodeLabels[statement.id2] = statement.id2Text
      })
    let prevEdgeName = null as string | null
    ast.statements.forEach((statement) => {
      if (statement.type === "inject" && prevEdgeName) {
        injections[prevEdgeName] = statement.text
      }
      if (statement.type === "requirement" || statement.type === "conflict") {
        prevEdgeName = `${statement.id1}-${statement.id2}`
      } else {
        prevEdgeName = null
      }
    })
  }
  const x1 = 25
  const x2 = 250
  const x3 = 500
  const y1 = 50
  const y3 = 300
  const y2 = (y1 + y3) / 2
  const nodeWidth = 150
  const nodeHeight = 75
  const nodeA = { x: x1, y: y2, w: nodeWidth, h: nodeHeight }
  const nodeB = { x: x2, y: y1, w: nodeWidth, h: nodeHeight }
  const nodeC = { x: x2, y: y3, w: nodeWidth, h: nodeHeight }
  const nodeD = { x: x3, y: y1, w: nodeWidth, h: nodeHeight }
  const nodeDp = { x: x3, y: y3, w: nodeWidth, h: nodeHeight }
  const edgeAB = createEdge(nodeA, nodeB)
  const edgeAC = createEdge(nodeA, nodeC)
  const edgeBD = createEdge(nodeB, nodeD)
  const edgeCDp = createEdge(nodeC, nodeDp)
  const conflictStart = nodeBottomCenterPont(nodeD)
  const conflictEnd = nodeTopCenterPont(nodeDp)
  const conflictMid = midPoint(conflictStart, conflictEnd)
  const conflictEdgePoints = [
    displacePoint(conflictStart, 0, 16),
    displacePoint(conflictMid, -15, 5),
    displacePoint(conflictMid, 15, -5),
    displacePoint(conflictEnd, 0, -16)
  ]
  const edgeDDp = {
    start: conflictEdgePoints[0],
    end: conflictEdgePoints[3]
  }
  const conflictEdgePointsString = conflictEdgePoints
    .map((p) => `${p.x},${p.y}`)
    .join(" ")
  React.useEffect(() => {
    const g = document.getElementById("cloudSvgInner")
    const svgContainer = document.getElementById("cloudSvgContainer")
    g?.setAttribute(
      "transform",
      computeResizeTransform(g, svgContainer, 10, 0) + ", translate(-10, 0)"
    )
    setSvgElem(document.getElementById("cloudSvg") as any as SVGElement)
  }, [ast])
  const style = `
  svg {
    font-family: "trebuchet ms", verdana, arial, sans-serif;
    font-size: 13px;
  }
  svg text {
    fill: black;
  }
  svg text.annotation {
    font-weight: bold;
  }
  svg rect {
    fill: white;
    stroke: black;
    stroke-width: 2;
  }
  `
  return (
    <div id="cloudSvgContainer" style={{ width: "100%", height: "500" }}>
      <svg
        id="cloudSvg"
        width="100%"
        height="100%"
        version="1.1"
        preserveAspectRatio="xMinYMin"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>{style}</style>
        <g id="cloudSvgInner">
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
            <marker
              id="startarrow"
              markerWidth="10"
              markerHeight="7"
              refX="5"
              refY="1.75"
              orient="auto"
            >
              <polygon
                points="10 0, 10 7, 0 3.5"
                fill=""
                transform="scale(0.5 0.5)"
              />
            </marker>
            <marker
              id="endarrow"
              markerWidth="10"
              markerHeight="7"
              refX="0"
              refY="1.75"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill=""
                transform="scale(0.5 0.5)"
              />
            </marker>
          </defs>
          <CloudNode
            annotation={"A"}
            text={nodeLabels.A}
            x={nodeA.x}
            y={nodeA.y}
            width={nodeWidth}
            height={nodeHeight}
          />
          <CloudNode
            annotation={"B"}
            text={nodeLabels.B}
            x={nodeB.x}
            y={nodeB.y}
            width={nodeWidth}
            height={nodeHeight}
          />
          <CloudNode
            annotation={"C"}
            text={nodeLabels.C}
            x={nodeC.x}
            y={nodeC.y}
            width={nodeWidth}
            height={nodeHeight}
          />
          <CloudNode
            annotation={"D"}
            text={nodeLabels.D}
            x={nodeD.x}
            y={nodeD.y}
            width={nodeWidth}
            height={nodeHeight}
          />
          <CloudNode
            annotation={"D'"}
            text={nodeLabels["D'"]}
            x={nodeDp.x}
            y={nodeDp.y}
            width={nodeWidth}
            height={nodeHeight}
          />
          <CloudEdge edge={edgeAB} />
          <CloudEdge edge={edgeAC} />
          <CloudEdge edge={edgeBD} />
          <CloudEdge edge={edgeCDp} />
          <Injection
            text={injections["A-B"]}
            edge={edgeAB}
            dx={-100}
            dy={-125}
          />
          <Injection
            text={injections["A-C"]}
            edge={edgeAC}
            dx={-100}
            dy={125}
          />
          <Injection text={injections["B-D"]} edge={edgeBD} dx={0} dy={-75} />
          <Injection text={injections["C-D'"]} edge={edgeCDp} dx={0} dy={75} />
          <Injection
            text={injections["D-D'"]}
            edge={edgeDDp}
            dx={120}
            dy={20}
          />
          <polyline
            points={conflictEdgePointsString}
            markerStart="url(#startarrow)"
            markerEnd="url(#endarrow)"
            style={{ fill: "none", stroke: "black", strokeWidth: 3 }}
          />
        </g>
      </svg>
    </div>
  )
}
function createEdge (
  startNode: { x: number, y: number, h: number, w: number },
  endNode: { x: number, y: number, h: number, w: number }
) {
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
  }
  edge.adjStart = intermediatePoint(edge.start, edge.end, 16)
  return edge
}

function nodeBottomCenterPont (node: {
  x: number
  y: number
  w: number
  h: number
}) {
  return {
    x: node.x + node.w / 2,
    y: node.y + node.h
  }
}

function nodeTopCenterPont (node: {
  x: number
  y: number
  w: number
  h: number
}) {
  return {
    x: node.x + node.w / 2,
    y: node.y
  }
}
function midPoint (
  start: { x: number, y: number },
  end: { x: number, y: number }
) {
  return {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2
  }
}

function displacePoint (
  point: { x: number, y: number },
  xDelta: number,
  yDelta: number
) {
  return {
    x: point.x + xDelta,
    y: point.y + yDelta
  }
}

// https://github.com/dagrejs/dagre/wiki
import React from "react"

import * as d3 from "d3"
import * as dagreD3 from "dagre-d3-es"
import { computeResizeTransform, wrapLines } from "./util"

// functional component Tree with prop ast
export default function Tree ({ ast }) {
  console.log("rendering tree with ast: ", ast)
  // Create a new directed graph
  const g = new dagreD3.graphlib.Graph({ directed: true })

  // Set an object for the graph label
  g.setGraph({})

  g.graph().rankdir = "TD"
  g.graph().ranksep = 30
  g.graph().nodesep = 20

  // Default to assigning a new object as a label for each new edge.
  g.setDefaultEdgeLabel(function () {
    return {}
  })

  // The shapes are rect, circle, ellipse, diamond.
  const createNode = ({
    key,
    label,
    shape = "ellipse",
    statusPercentage = null
  }) => {
    // Transform gives more space for the label
    const styleCommon =
      "transform: scale(1.1); stroke: black; stroke-width: 1px;"
    const fontFamily = '"trebuchet ms",verdana,arial,sans-serif'
    const fontStyle = `font: 300 16px, ${fontFamily};`
    const config = {
      label: wrapLines(label, 20).join("\n"),
      // width: 70,
      // height: 60,
      shape,
      style: `${styleCommon} fill:#dff8ff;`, // Blue
      labelStyle: fontStyle + "fill: black; margin: 5px;"
    }

    if (statusPercentage && statusPercentage >= 70) {
      // Green
      config.style = `${styleCommon} fill:#95f795;`
      config.labelStyle = fontStyle + "fill: black;"
    }
    if (statusPercentage && statusPercentage < 70 && statusPercentage > 30) {
      // Yellow
      config.style = `${styleCommon} fill:#fdfdbe;`
    }
    if (statusPercentage && statusPercentage <= 30) {
      // Red
      config.style = `${styleCommon} fill:#ffb2b2;`
      config.labelStyle = fontStyle + "fill: black;"
    }
    console.log("creating node ", key)
    g.setNode(key, config)
  }
  const createEdge = ({ from, to }) => {
    g.setEdge(from, to, {
      curve: d3.curveBasis,
      style: "stroke: gray; fill:none; stroke-width: 1px;"
      // minlen: 1,
      // arrowheadStyle: "fill: gray"
    })
  }
  React.useEffect(() => {
    // Run after React render
    const svg = d3.select("svg")
    const inner = svg.select("g")

    // Create the renderer
    const render = dagreD3.render()
    const container = d3.select("#tree-svg-container")
    if (!container || !container.node()) {
      return
    }
    // Run the renderer. This is what draws the final graph.
    render(inner, g)
    inner.attr(
      "transform",
      computeResizeTransform(inner.node(), container.node(), 10, 10) +
        ", translate(10, 10)"
    )

    inner
      .selectAll("g.node")
      .attr("title", (v) => {
        return (
          "<p class='name'>" +
          v +
          "</p><p class='description'> some random description </p>"
        )
      })
      .each(function (v) {
        console.log("node details :", v)
      })
  })

  if (!ast) {
    // Check for goal because it's possible for us to get the wrong diagram type
    return <div> No AST </div>
  }
  const nodeStatusPercentage = {}

  ast.statements
    .filter((s) => s.type === "status")
    .forEach((statement) => {
      const nodeKey = statement.id
      nodeStatusPercentage[nodeKey] = statement.percentage
    })

  createNode({ key: "goal", label: ast.goal.text })
  ast.statements
    .filter((s) => s.type === "CSF")
    .forEach((statement) => {
      createNode({ key: statement.id, label: statement.text })
      createEdge({ from: "goal", to: statement.id })
    })
  ast.statements
    .filter((s) => s.type === "NC")
    .forEach((statement) => {
      createNode({
        key: statement.id,
        label: statement.text,
        statusPercentage: nodeStatusPercentage[statement.id]
      })
    })
  ast.statements
    .filter((s) => s.type === "requirement")
    .forEach((statement) => {
      const nodeKey = statement.id
      for (const reqKey of statement.requirements) {
        createEdge({ from: nodeKey, to: reqKey })
      }
    })

  // inner
  //   .selectAll("g.edge")
  //   .each((v) => {
  //     console.log("edge details :", v);
  //   });
  // g.edges().forEach(function(e) {

  // });

  const drawRelation = (inner, parent, child1, child2) => {
    const parentNode = g.node(parent)
    console.log("Node " + parent + ": " + JSON.stringify(parentNode))
    const midPoint = (p1, p2) => {
      return {
        x: p1.x + (p2.x - p1.x) / 2,
        y: p1.y + (p2.y - p1.y) / 2
      }
    }
    const distanceBetween = (p1, p2) => {
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
    }
    const edgeMidPoint = (from, to) => {
      const edge = g.edge(from, to, null)
      const firstPoint = edge.points[0]
      const lastPoint = edge.points[edge.points.length - 1]
      return midPoint(firstPoint, lastPoint)
    }
    const p1 = edgeMidPoint(parent, child1)
    const p2 = edgeMidPoint(parent, child2)
    const center = midPoint(p1, p2)
    inner
      .append("ellipse")
      .attr("cx", center.x)
      .attr("cy", center.y)
      .attr("rx", distanceBetween(p1, p2))
      .attr("ry", 5)
      .attr("stroke", "#000")
      .attr("fill", "none")
    // console.log("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(edge));
  }
  // drawRelation(inner, 'root', 'put', 'ttc');
  return (
    <div id="tree-svg-container" style={{ width: "100%", height: "500" }}>
      <svg
        width="100%"
        height="100%"
        // style={{ width: "inherit", height: "100%" }}
        version="1.1"
        preserveAspectRatio="xMinYMin"
        // viewBox="0 0 31.921 36.45"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g />
      </svg>
    </div>
  )
}

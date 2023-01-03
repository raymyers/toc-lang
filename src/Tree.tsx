// https://github.com/dagrejs/dagre/wiki
import React from "react"

import * as d3 from "d3"
import * as dagreD3 from "dagre-d3-es"
import { computeResizeTransform, wrapLines } from "./util"
import { TreeSemantics, Node } from "./interpreter"

interface DagreNodeProps {
  // See docs https://github.com/dagrejs/dagre/wiki
  width?: number
  height?: number
  label: string
  style: string
  labelStyle: string
}

// functional component Tree with prop ast
export default function Tree ({
  semantics
}: {
  semantics: TreeSemantics | null
}) {
  console.log("rendering tree: ", semantics)
  if (!semantics) {
    // Check for goal because it's possible for us to get the wrong diagram type
    return <div> No AST </div>
  }
  // Create a new directed graph
  const g = new dagreD3.graphlib.Graph({ directed: true })

  // Set an object for the graph label
  g.setGraph({})

  g.graph().rankdir = semantics.rankdir
  g.graph().ranksep = 15 // Effectively 30 because we double on non-intermediate edges
  g.graph().nodesep = 20

  // Default to assigning a new object as a label for each new edge.
  g.setDefaultEdgeLabel(function () {
    return {}
  })

  // The shapes are rect, circle, ellipse, diamond.
  const createNode = ({
    node,
    statusPercentage
  }: {
    node: Node
    statusPercentage: number | undefined
  }) => {
    // Transform gives more space for the label

    const fontFamily = '"trebuchet ms",verdana,arial,sans-serif'
    const fontSize = node.intermediate ? 7 : 13
    const fontStyle = node.intermediate
      ? `font: bold ${fontSize}px ${fontFamily};`
      : `font: 300 ${fontSize}px ${fontFamily};`
    const shape = node.intermediate ? "ellipse" : "rect"
    const styleCommon =
      shape === "rect"
        ? "stroke: black; stroke-width: 1px; rx: 5px; ry: 5px;"
        : "stroke: black; stroke-width: 1px;"
    const config = {
      label: wrapLines(node.label, 20).join("\n"),
      shape,
      style: `${styleCommon} fill:#dff8ff;`, // Blue
      labelStyle: fontStyle + "fill: black;"
    } as DagreNodeProps
    if (node.intermediate) {
      config.width = 5
      config.height = 5
      config.style = `${styleCommon} fill:white;` // Blue
    }
    if (statusPercentage !== undefined) {
      if (statusPercentage >= 70) {
        // Green
        config.style = `${styleCommon} fill:#95f795;`
      }
      if (statusPercentage < 70 && statusPercentage > 30) {
        // Yellow
        config.style = `${styleCommon} fill:#fdfdbe;`
      }
      if (statusPercentage <= 30) {
        // Red
        config.style = `${styleCommon} fill:#ffb2b2;`
      }
    }

    console.log("creating node ", node.key)
    g.setNode(node.key, config)
  }
  const createEdge = ({ from, to }) => {
    const connectsIntermediate =
      semantics.nodes.get(from)?.intermediate ||
      semantics.nodes.get(to)?.intermediate
    g.setEdge(from, to, {
      curve: d3.curveBasis,
      style: "stroke: gray; fill:none; stroke-width: 1px;",
      minlen: connectsIntermediate ? 1 : 2
      // arrowheadStyle: "fill: gray"
    })
  }
  const { nodes, edges } = semantics
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
      computeResizeTransform(inner.node(), container.node(), 13, 13) +
        ", translate(13, 13)"
    )
    const radius = 10
    // cleanup previous annotations
    inner.selectAll("g.node .annotation-circle").remove()
    inner.selectAll("g.node .annotation-label").remove()
    const nodeSelector = inner.selectAll("g.node").filter(function (v) {
      return nodes.get(v)?.annotation
    })
    nodeSelector
      .append("circle")
      .attr("class", "annotation-circle")
      .attr("cx", function () {
        const elem = this.parentNode
        console.log("elem", elem)
        const rectElem = elem.getElementsByTagName("rect")[0]
        if (!rectElem) {
          return 0
        }
        const width = rectElem.width.baseVal.value
        return -width / 2
      })
      .attr("cy", function () {
        const elem = this.parentNode
        console.log("elem", elem)
        const rectElem = elem.getElementsByTagName("rect")[0]
        if (!rectElem) {
          return 0
        }
        const height = rectElem.height.baseVal.value
        return -height / 2
      })
      .attr("r", radius)
      .style("fill", "white")
      .style("stroke", "black")
      .style("stroke-width", "1px")
    const labelFontSize = (text): number => {
      return text && text.length < 2 ? 11 : 8
    }
    nodeSelector
      .append("text")
      .attr("class", "annotation-label")
      .style("font-size", function () {
        return (
          labelFontSize(nodes.get(this.parentNode.__data__)?.annotation) + "px"
        )
      })
      .attr("x", function () {
        const elem = this.parentNode
        console.log("elem", elem)
        const rectElem = elem.getElementsByTagName("rect")[0]
        if (!rectElem) {
          return 0
        }
        const width = rectElem.width.baseVal.value
        return -width / 2
      })
      .attr("y", function () {
        const elem = this.parentNode
        console.log("elem", elem)
        const rectElem = elem.getElementsByTagName("rect")[0]
        if (!rectElem) {
          return 0
        }
        const height = rectElem.height.baseVal.value
        return -height / 2 + 1.5
      })
      .attr("r", radius)
      .text(function () {
        return nodes.get(this.parentNode.__data__)?.annotation
      })
    // function (v) {
    //   const elem = this;
    //   const rectElem = elem.getElementsByTagName('rect')[0]
    //   if (!rectElem) {
    //     return
    //   }
    //   console.log("node details :", v)
    //   console.log("rect", rectElem)
    //   const width = rectElem.width.baseVal.value
    //   console.log("width", width)
    //   console.log("nodes.get(v)", nodes.get(v))
    //   console.log("annotation", nodes.get(v)?.annotation)

    //     svg.select(elem).append()

    // })
  })

  console.log("{nodes, edges}", { nodes, edges })
  for (const [key, node] of nodes) {
    createNode({
      node,
      statusPercentage: node.statusPercentage
    })
  }

  for (const edge of edges) {
    createEdge({ from: edge.from, to: edge.to })
  }

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
  const svgStyle = `
  .annotation-label {
    fill: black;
    text-anchor: middle;
    font-weight: bold;
    alignment-baseline: middle;
  }
  `
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
        <style>{svgStyle}</style>
        <g />
      </svg>
    </div>
  )
}

// https://github.com/dagrejs/dagre/wiki
import React from "react";

import * as d3 from "d3";
import * as dagreD3 from "dagre-d3-es";
// import ast from "./goal-tree-example-ast.json";

// functional component Tree with prop ast
export default function Tree({ ast }) {
  console.log("rendering tree with ast: ", ast);
  // Create a new directed graph
  var g = new dagreD3.graphlib.Graph({ directed: true });

  // Set an object for the graph label
  g.setGraph({});

  g.graph().rankdir = "TD";
  g.graph().ranksep = 30;
  g.graph().nodesep = 20;

  // Default to assigning a new object as a label for each new edge.
  g.setDefaultEdgeLabel(function () {
    return {};
  });
  const createNode = ({ key, label, shape="ellipse", primary=false, statusPercentage=null }) => {
    // function to break string into lines on word boundaries
    const breakString = (str, width) => {
      const words = str.split(" ");
      const lines:string[] = [];
      let line = "";
      words.forEach((word, i) => {
        if (line.length + word.length > width) {
          lines.push(line);
          line = "";
        }
        line += word + " ";
        if (i === words.length - 1) {
          lines.push(line);
        }
      });
      return lines;
    };

    const fontFamily = '"trebuchet ms",verdana,arial,sans-serif';
    const fontStyle = `font: 300 16px, ${fontFamily};`;
    const config = {
      label: breakString(label, 20).join("\n"),
      // width: 70,
      // height: 60,
      shape: shape,
      style: "stroke: black; fill:white; stroke-width: 1px; ",
      labelStyle: fontStyle + "fill: black;",
    };
    if (primary) {
      config.style = "stroke: black; fill:blue; stroke-width: 1px; ";
      config.labelStyle = fontStyle + "fill: white;";
    }
    if (statusPercentage && statusPercentage >= 70) {
      config.style = "stroke: black; fill:green; stroke-width: 1px; ";
      config.labelStyle = fontStyle + "fill: white;";
    }
    if (statusPercentage && statusPercentage < 70 && statusPercentage > 30) {
      config.style = "stroke: black; fill:yellow; stroke-width: 1px; ";
    }
    if (statusPercentage && statusPercentage <= 30) {
      config.style = "stroke: black; fill:red; stroke-width: 1px; ";
      config.labelStyle = fontStyle + "fill: white;";
    }
    console.log("creating node ", key);
    g.setNode(key, config);
  };
  const createEdge = ({ from, to }) => {
    g.setEdge(from, to, {
      curve: d3.curveBasis,
      style: "stroke: gray; fill:none; stroke-width: 1px;",
      // minlen: 1,
      // arrowheadStyle: "fill: gray"
    });
  };
  React.useEffect(() => {
    // Run after React render
    let svg = d3.select("svg");
    let inner = svg.select("g");

    // Create the renderer
    var render = dagreD3.render();
    var container = d3.select("#tree-svg-container");
    if (!container || !container.node()) {
      return;
    }
    var size = container.node().getBoundingClientRect();
    const boundingWidth = size.width;
    const boundingHeight = size.height;
    // Run the renderer. This is what draws the final graph.
    render(inner, g);
    ////// RESIZE MAGIC
    var zoomScale = 1;
    // Get Dagre Graph dimensions
    var graphWidth = g.graph().width + 0.0;
    var graphHeight = g.graph().height + 0.0;
    console.log("graph h w: ", graphHeight, graphWidth);
    console.log("bounding h w: ", boundingHeight, boundingWidth);
    var width = boundingWidth;
    var height = boundingHeight;

    const heightMagicRatio = 0.20;
    const widthMagicRatio = 0.24;
    // Calculate applicable scale for zoom
    zoomScale = Math.min(widthMagicRatio * (width / graphWidth), heightMagicRatio * (height / graphHeight));
    console.log("zoomScale: ", zoomScale);

    inner.attr("transform", `scale(${zoomScale},${zoomScale})`);
    ////// END RESIZE MAGIC

    inner
      .selectAll("g.node")
      .attr("title", (v) => {
        return (
          "<p class='name'>" +
          v +
          "</p><p class='description'> some random description </p>"
        );
      })
      .each(function (v) {
        console.log("node details :", v);
      });
  });

  if (!ast) {
    return <div> No AST </div>;
  }
  const nodeStatusPercentage = {};

  ast.statements
    .filter((s) => s.type === "status")
    .forEach((statement) => {
      const nodeKey = statement.id;
      nodeStatusPercentage[nodeKey] = statement.percentage;
    });

  createNode({ key: "goal", label: ast.goal.text, primary: true });
  ast.statements
    .filter((s) => s.type === "CSF")
    .forEach((statement) => {
      createNode({ key: statement.id, label: statement.text, primary: true });
      createEdge({ from: "goal", to: statement.id });
    });
  ast.statements
    .filter((s) => s.type === "NC")
    .forEach((statement) => {
      createNode({
        key: statement.id,
        label: statement.text,
        statusPercentage: nodeStatusPercentage[statement.id],
      });
    });
  ast.statements
    .filter((s) => s.type === "requirement")
    .forEach((statement) => {
      const nodeKey = statement.id;
      for (let reqKey of statement.requirements) {
        createEdge({ from: nodeKey, to: reqKey });
      }
    });

  // inner
  //   .selectAll("g.edge")
  //   .each((v) => {
  //     console.log("edge details :", v);
  //   });
  // g.edges().forEach(function(e) {

  // });

  const drawRelation = (inner, parent, child1, child2) => {
    const parentNode = g.node(parent);
    console.log("Node " + parent + ": " + JSON.stringify(parentNode));
    const midPoint = (p1, p2) => {
      return {
        x: p1.x + (p2.x - p1.x) / 2,
        y: p1.y + (p2.y - p1.y) / 2,
      };
    };
    const distanceBetween = (p1, p2) => {
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    };
    const edgeMidPoint = (from, to) => {
      const edge = g.edge(from, to, null);
      const firstPoint = edge.points[0];
      const lastPoint = edge.points[edge.points.length - 1];
      return midPoint(firstPoint, lastPoint);
    };
    const p1 = edgeMidPoint(parent, child1);
    const p2 = edgeMidPoint(parent, child2);
    const center = midPoint(p1, p2);
    inner
      .append("ellipse")
      .attr("cx", center.x)
      .attr("cy", center.y)
      .attr("rx", distanceBetween(p1, p2))
      .attr("ry", 5)
      .attr("stroke", "#000")
      .attr("fill", "none");
    // console.log("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(edge));
  };
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
  );
}

import React from "react"
import { computeResizeTransform, wrapLines } from "./util"
import {
  CloudEdge,
  CloudNode,
  Injection,
  midPoint,
  intermediatePoint,
  drawCloud
} from "./svgGen"
/* eslint react/prop-types: 0 */

export default function Cloud({
  ast,
  setSvgElem,
  isEditing
}: {
  ast: any
  setSvgElem: (svgElem: SVGElement | null) => void
  isEditing?: boolean
}) {
  if (ast) {
    React.useEffect(() => {
      const g = document.getElementById("cloudSvgInner")
      const svgContainer = document.getElementById("cloudSvgContainer")
      g?.setAttribute(
        "transform",
        computeResizeTransform(g, svgContainer, 10, 0) + ", translate(-10, 0)"
      )
      setSvgElem(document.getElementById("cloudSvg") as any as SVGElement)
    }, [ast, isEditing])
  }
  return (
    <div id="cloudSvgContainer" style={{ width: "100%", height: "500" }}>
      {ast && drawCloud(ast, isEditing)};
    </div>
  )
}

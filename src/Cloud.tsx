import React from "react"
import { computeResizeTransform } from "./util"
import { drawCloud } from "./svgGen"

export default function Cloud({
  ast,
  setSvgElem,
  isEditing,
  onLabelUpdate
}: {
  ast: any
  setSvgElem: (svgElem: SVGElement | null) => void
  isEditing?: boolean
  onLabelUpdate?: (nodeId: string, newLabel: string) => void
}) {
  React.useEffect(() => {
    if (ast) {
      const g = document.getElementById("cloudSvgInner")
      const svgContainer = document.getElementById("cloudSvgContainer")
      g?.setAttribute(
        "transform",
        computeResizeTransform(g, svgContainer, 10, 0) + ", translate(-10, 0)"
      )
      setSvgElem(document.getElementById("cloudSvg") as SVGElement | null)
    }
  }, [ast, isEditing, setSvgElem])

  return (
    <div id="cloudSvgContainer" style={{ width: "100%", height: "500" }}>
      {ast && drawCloud(ast, isEditing, onLabelUpdate)};
    </div>
  )
}

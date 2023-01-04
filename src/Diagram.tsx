import React from "react"
import Cloud from "./Cloud"
import Tree from "./Tree"
import { saveSvgUrl } from "./util"

export function Diagram ({ ast, semantics, diagramType }) {
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null)
  const setSvgElem = (svgElem: SVGElement | null) => {
    if (svgElem) {
      setDownloadUrl(saveSvgUrl(svgElem))
    } else {
      setDownloadUrl(null)
    }
  }
  return (
    <div>
      {downloadUrl && (
        <a href={downloadUrl} download={`${diagramType}.svg`}>
          Download SVG
        </a>
      )}
      {diagramType === "evaporatingCloud" && (
        <Cloud ast={ast} setSvgElem={setSvgElem} />
      )}
      {diagramType === "goalTree" && (
        <Tree semantics={semantics} setSvgElem={setSvgElem} />
      )}
      {diagramType === "problemTree" && (
        <Tree semantics={semantics} setSvgElem={setSvgElem} />
      )}
    </div>
  )
}

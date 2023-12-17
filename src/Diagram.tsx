import React from "react"
import Cloud from "./Cloud"
import Tree from "./Tree"
import { saveSvgUrl } from "./util"
import { toPng } from "./imageExport"

/* eslint react/prop-types: 0 */

export function Diagram({ ast, semantics, diagramType }) {
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null)
  const [pngDownloadUrl, setPngDownloadUrl] = React.useState<string | null>(
    null
  )
  const [svgElem, setSvgElem] = React.useState<SVGElement | null>(null)
  const genUrls = async () => {
    if (svgElem) {
      setDownloadUrl(saveSvgUrl(svgElem))
      setPngDownloadUrl(
        await toPng({
          svg: svgElem,
          width: svgElem.clientWidth * 2,
          height: svgElem.clientHeight * 2
        })
      )
    } else {
      setDownloadUrl(null)
      setPngDownloadUrl(null)
    }
  }
  const updateSvgElem = async (svgElem: SVGElement | null) => {
    setSvgElem(svgElem)
    setDownloadUrl(null)
    setPngDownloadUrl(null)
  }
  return (
    <div>
      {downloadUrl && pngDownloadUrl ? (
        <></>
      ) : (
        <button onClick={genUrls}>Export</button>
      )}
      {downloadUrl && pngDownloadUrl && (
        <div>
          <a href={downloadUrl} download={`${diagramType}.svg`}>
            Download SVG
          </a>
          <span> | </span>
          <a href={pngDownloadUrl} download={`${diagramType}.png`}>
            PNG
          </a>
        </div>
      )}
      {diagramType === "evaporating-cloud" && (
        <Cloud ast={ast} setSvgElem={updateSvgElem} />
      )}
      {diagramType === "goal-tree" && (
        <Tree semantics={semantics} setSvgElem={updateSvgElem} />
      )}
      {diagramType === "problem-tree" && (
        <Tree semantics={semantics} setSvgElem={updateSvgElem} />
      )}
    </div>
  )
}

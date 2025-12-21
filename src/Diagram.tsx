import React from "react"
import Cloud from "./Cloud"
import Tree from "./Tree"
import { saveSvgUrl } from "./util"
import { toPng } from "./imageExport"

/* eslint react/prop-types: 0 */

export function Diagram({ ast, semantics, diagramType, onLabelUpdate }) {
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null)
  const [pngDownloadUrl, setPngDownloadUrl] = React.useState<string | null>(
    null
  )
  const [svgElem, setSvgElem] = React.useState<SVGElement | null>(null)
  const [isEditing, setIsEditing] = React.useState<boolean>(false)
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

  const toggleEditing = () => {
    setIsEditing(!isEditing)
  }
  return (
    <div
      className={isEditing ? "diagram-container editing" : "diagram-container"}
    >
      <div
        className="diagram-controls"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <button
          onClick={toggleEditing}
          style={{
            backgroundColor: isEditing ? "#007bff" : "#f8f9fa",
            color: isEditing ? "white" : "black",
            border: "1px solid #ccc",
            padding: "5px 10px",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          {isEditing ? "Editing: ON" : "Editing: OFF"}
        </button>
        <div>
          {downloadUrl && pngDownloadUrl ? (
            <div>
              <a href={downloadUrl} download={`${diagramType}.svg`}>
                Download SVG
              </a>
              <span> | </span>
              <a href={pngDownloadUrl} download={`${diagramType}.png`}>
                PNG
              </a>
            </div>
          ) : (
            <button onClick={genUrls}>Export</button>
          )}
        </div>
      </div>

      {diagramType === "conflict" && (
        <Cloud
          ast={ast}
          setSvgElem={updateSvgElem}
          isEditing={isEditing}
          onLabelUpdate={onLabelUpdate}
        />
      )}
      {diagramType === "goal" && (
        <Tree
          semantics={semantics}
          setSvgElem={updateSvgElem}
          isEditing={isEditing}
          onLabelUpdate={onLabelUpdate}
        />
      )}
      {diagramType === "problem" && (
        <Tree
          semantics={semantics}
          setSvgElem={updateSvgElem}
          isEditing={isEditing}
          onLabelUpdate={onLabelUpdate}
        />
      )}
    </div>
  )
}

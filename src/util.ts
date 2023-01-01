// break string into lines on word boundaries
export const wrapLines = (str, width) => {
  const words = str.split(" ")
  const lines: string[] = []
  let line = ""
  words.forEach((word, i) => {
    if (line.length + word.length > width) {
      lines.push(line)
      line = ""
    }
    line += word + " "
    if (i === words.length - 1) {
      lines.push(line)
    }
  })
  return lines
}

export function computeResizeTransform(gNode: any, container: any, padX, padY) {

  const bbox = gNode.getBBox({stroke: true, fill: true, markers: true})
  const boundingWidth = bbox.width + padX
  const boundingHeight = bbox.height + padY

  console.log("bounding h w: ", boundingHeight, boundingWidth)


  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight
  console.log("container h w: ", containerHeight, containerWidth)
  // Calculate applicable scale for zoom
  const zoomScale = Math.min(
    (100 / boundingWidth),
    (100 / boundingHeight)
  )
  console.log("zoomScale: ", zoomScale)
  return `scale(${zoomScale},${zoomScale})`
}
import { Canvg, presets } from "canvg"

const preset = presets.offscreen()

export async function toPng(data) {
  const { width, height, svg } = data
  console.log("svg", svg)
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext("2d")
  const v = await Canvg.from(ctx!, svg.outerHTML, preset)

  // Render only first frame, ignoring animations and mouse.
  await v.render()

  const blob = await canvas.convertToBlob()
  const pngUrl = URL.createObjectURL(blob)

  return pngUrl
}

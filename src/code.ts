import hex2rgb from "hex2rgb"

let __paintStyles: PaintStyle[] = []

async function getPaintStyles(): Promise<PaintStyle[]> {
  if (__paintStyles.length) {
    return __paintStyles
  }

  __paintStyles = figma.getLocalPaintStyles()
  return __paintStyles
}

async function getOrCreatePaintStyle(name: string): Promise<PaintStyle> {
  const paintStyles = await getPaintStyles()

  for (const style of paintStyles) {
    if (style.name == name) {
      return style
    }
  }

  const newStyle = figma.createPaintStyle()
  newStyle.name = name

  return newStyle
}

async function fromHex(hex: string): Promise<RGB> {
  const { rgb } = hex2rgb(hex)

  return {
    r: rgb[0] / 255,
    g: rgb[1] / 255,
    b: rgb[2] / 255,
  }
}

figma.ui.onmessage = async (evt) => {
  switch (evt?.type) {
    case "CreatePaintStyle":
      const paintStyle = await getOrCreatePaintStyle(evt.name)

      const paintData: SolidPaint = {
        color: await fromHex(evt.colour),
        type: "SOLID",
        opacity: 1,
      }

      paintStyle.paints = [paintData]

      break
    case "Completed":
      figma.closePlugin(evt?.message)
      return
  }
}

figma.showUI(__html__, { visible: false })

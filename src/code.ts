import hex2rgb from "hex2rgb"

async function getPaintStyles(): Promise<PaintStyle[]> {
  return figma.getLocalPaintStyles()
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

async function fromHex(hex: string): Promise<[RGB, number]> {
  let useHex = hex
  let opacity = 1

  if (useHex.startsWith("#")) {
    useHex = useHex.slice(1)
  }

  if (useHex.length > 6) {
    opacity = Math.min(parseInt(useHex.slice(0, 2), 16) / 255, 1)
    useHex = useHex.slice(2)
  }

  const { rgb } = hex2rgb(useHex)

  return [
    {
      r: Math.min(rgb[0] / 255, 1),
      g: Math.min(rgb[1] / 255, 1),
      b: Math.min(rgb[2] / 255, 1),
    },
    opacity,
  ]
}

figma.ui.onmessage = async (evt) => {
  switch (evt?.type) {
    case "CreatePaintStyle":
      const paintStyle = await getOrCreatePaintStyle(evt.name)
      const [rgb, opacity] = await fromHex(evt.colour)

      const paintData: SolidPaint = {
        color: rgb,
        type: "SOLID",
        opacity,
      }

      paintStyle.paints = [paintData]

      break
    case "Completed":
      figma.closePlugin(evt?.message)
      return
  }
}

figma.showUI(__html__, { visible: false })

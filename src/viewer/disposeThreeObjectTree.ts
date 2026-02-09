/**
 * Responsibility:
 * - Dispose Three.js objects (geometry/material/texture) to prevent GPU memory leaks.
 */

type AnyThreeObject = {
  children?: AnyThreeObject[]
  geometry?: { dispose?: () => void }
  material?: unknown
  dispose?: () => void
}

function disposeMaterial(material: unknown): void {
  if (!material) return

  // Guard: Three.js material is an object with optional dispose() and texture properties.
  const materialAsRecord = material as Record<string, unknown> & { dispose?: unknown }

  for (const propertyValue of Object.values(materialAsRecord)) {
    const possibleTexture = propertyValue as { dispose?: unknown } | undefined
    const possibleDispose = possibleTexture?.dispose
    if (typeof possibleDispose !== 'function') continue
    possibleDispose()
  }

  if (typeof materialAsRecord.dispose === 'function') {
    materialAsRecord.dispose()
  }
}

export function disposeThreeObjectTree(rootObject: AnyThreeObject): void {
  if (!rootObject) return

  const objectStack: AnyThreeObject[] = [rootObject]

  while (objectStack.length > 0) {
    const currentObject = objectStack.pop()
    if (!currentObject) continue

    const children = currentObject.children ?? []
    for (const child of children) {
      objectStack.push(child)
    }

    currentObject.geometry?.dispose?.()

    const material = currentObject.material
    if (Array.isArray(material)) {
      for (const singleMaterial of material) {
        disposeMaterial(singleMaterial)
      }
      continue
    }

    disposeMaterial(material)

    currentObject.dispose?.()
  }
}


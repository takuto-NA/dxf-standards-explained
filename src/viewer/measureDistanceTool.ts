/**
 * Responsibility:
 * - Provide a simple 2-point distance measurement tool on an orthographic DXF scene.
 */

import {
  MEASURE_LINE_COLOR_HEX,
  MEASURE_LINE_OPACITY,
  MEASURE_POINT_PIXEL_SIZE
} from './constants'

export type MeasureDistanceState = {
  enabled: boolean
  distance: number | null
}

export type CreateMeasureDistanceToolParams = {
  THREE: typeof import('three')
  camera: import('three').OrthographicCamera
  scene: import('three').Scene
  canvasElement: HTMLCanvasElement
  getPlaneZ: () => number
  requestRender: () => void
  onDistanceChanged?: (nextDistance: number | null) => void
}

export type MeasureDistanceTool = {
  setEnabled: (enabled: boolean) => void
  getState: () => MeasureDistanceState
  dispose: () => void
}

export function createMeasureDistanceTool(params: CreateMeasureDistanceToolParams): MeasureDistanceTool {
  const {
    THREE,
    camera,
    scene,
    canvasElement,
    getPlaneZ,
    requestRender,
    onDistanceChanged
  } = params

  let isEnabled = false
  let firstPoint: import('three').Vector3 | null = null
  let secondPoint: import('three').Vector3 | null = null
  let currentDistance: number | null = null

  const raycaster = new THREE.Raycaster()
  const pointerNdc = new THREE.Vector2()
  const intersectionPoint = new THREE.Vector3()
  const measurementPlane = new THREE.Plane()

  const pointsGeometry = new THREE.BufferGeometry()
  const pointsMaterial = new THREE.PointsMaterial({
    color: MEASURE_LINE_COLOR_HEX,
    size: MEASURE_POINT_PIXEL_SIZE,
    sizeAttenuation: false
  })
  const pointsObject = new THREE.Points(pointsGeometry, pointsMaterial)
  pointsObject.visible = false
  scene.add(pointsObject)

  const lineGeometry = new THREE.BufferGeometry()
  const lineMaterial = new THREE.LineBasicMaterial({
    color: MEASURE_LINE_COLOR_HEX,
    transparent: true,
    opacity: MEASURE_LINE_OPACITY
  })
  const lineObject = new THREE.Line(lineGeometry, lineMaterial)
  lineObject.visible = false
  scene.add(lineObject)

  function updateObjectsVisibility(): void {
    const shouldShow = Boolean(firstPoint && secondPoint)
    pointsObject.visible = shouldShow
    lineObject.visible = shouldShow
  }

  function updateGeometries(): void {
    if (!firstPoint) return
    if (!secondPoint) return

    const points = new Float32Array([
      firstPoint.x,
      firstPoint.y,
      firstPoint.z,
      secondPoint.x,
      secondPoint.y,
      secondPoint.z
    ])

    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(points, 3))
    pointsGeometry.computeBoundingSphere()

    lineGeometry.setAttribute('position', new THREE.BufferAttribute(points, 3))
    lineGeometry.computeBoundingSphere()
  }

  function clearMeasurement(): void {
    firstPoint = null
    secondPoint = null
    currentDistance = null
    onDistanceChanged?.(null)
    updateObjectsVisibility()
    requestRender()
  }

  function updateDistance(): void {
    if (!firstPoint) return
    if (!secondPoint) return

    currentDistance = firstPoint.distanceTo(secondPoint)
    onDistanceChanged?.(currentDistance)
  }

  function tryGetWorldPoint(event: PointerEvent): import('three').Vector3 | null {
    const canvasRect = canvasElement.getBoundingClientRect()
    if (canvasRect.width <= 0) return null
    if (canvasRect.height <= 0) return null

    const pointerX = event.clientX - canvasRect.left
    const pointerY = event.clientY - canvasRect.top

    pointerNdc.x = (pointerX / canvasRect.width) * 2 - 1
    pointerNdc.y = -((pointerY / canvasRect.height) * 2 - 1)

    raycaster.setFromCamera(pointerNdc, camera)

    const planeZ = getPlaneZ()
    measurementPlane.setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, planeZ)
    )

    const hitPoint = raycaster.ray.intersectPlane(measurementPlane, intersectionPoint)
    if (!hitPoint) return null

    return intersectionPoint.clone()
  }

  function onPointerDown(event: PointerEvent): void {
    // Guard: ignore pointer input when the tool is disabled.
    if (!isEnabled) return

    const worldPoint = tryGetWorldPoint(event)
    if (!worldPoint) return

    if (!firstPoint) {
      firstPoint = worldPoint
      secondPoint = null
      currentDistance = null
      onDistanceChanged?.(null)
      updateObjectsVisibility()
      requestRender()
      return
    }

    secondPoint = worldPoint
    updateDistance()
    updateGeometries()
    updateObjectsVisibility()
    requestRender()
  }

  function onKeyDown(event: KeyboardEvent): void {
    // Guard: ESC cancels only when measurement is enabled.
    if (!isEnabled) return
    if (event.key !== 'Escape') return
    clearMeasurement()
  }

  function setEnabled(nextEnabled: boolean): void {
    isEnabled = nextEnabled

    if (!isEnabled) {
      clearMeasurement()
      return
    }
  }

  canvasElement.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('keydown', onKeyDown)

  return {
    setEnabled,
    getState: () => ({ enabled: isEnabled, distance: currentDistance }),
    dispose: () => {
      canvasElement.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)

      scene.remove(pointsObject)
      scene.remove(lineObject)

      pointsGeometry.dispose()
      pointsMaterial.dispose()
      lineGeometry.dispose()
      lineMaterial.dispose()
    }
  }
}


/**
 * Responsibility:
 * - Fit an OrthographicCamera to a target Box3 so the whole model is visible.
 */

type Vector3Like = { x: number; y: number; z: number }

type Box3Like = {
  isEmpty: () => boolean
  min: Vector3Like
  getCenter: (target: Vector3Like) => Vector3Like
  getSize: (target: Vector3Like) => Vector3Like
}

type OrthographicCameraLike = {
  left: number
  right: number
  top: number
  bottom: number
  zoom: number
  position: { set: (x: number, y: number, z: number) => void }
  lookAt: (center: Vector3Like) => void
  updateProjectionMatrix: () => void
}

export type FitOrthographicCameraParams = {
  box: Box3Like
  camera: OrthographicCameraLike
  viewportWidthPx: number
  viewportHeightPx: number
  cameraZOffset: number
  cameraZoom: number
  onTargetCenter?: (center: Vector3Like) => void
  createVector3: () => Vector3Like
}

export function fitOrthographicCameraToBox(params: FitOrthographicCameraParams): Vector3Like | null {
  const {
    box,
    camera,
    viewportWidthPx,
    viewportHeightPx,
    cameraZOffset,
    cameraZoom,
    onTargetCenter,
    createVector3
  } = params

  if (viewportWidthPx <= 0) return null
  if (viewportHeightPx <= 0) return null

  if (box.isEmpty()) return null

  // Guard: NaN bounding boxes break camera fitting.
  if (!Number.isFinite(box.min.x)) return null

  const center = box.getCenter(createVector3())
  const size = box.getSize(createVector3())
  const maxDimension = Math.max(size.x, size.y)
  const viewportAspectRatio = viewportWidthPx / viewportHeightPx

  const viewWidth = viewportAspectRatio > 1 ? maxDimension * viewportAspectRatio : maxDimension
  const viewHeight = viewportAspectRatio > 1 ? maxDimension : maxDimension / viewportAspectRatio

  camera.left = -viewWidth / 2
  camera.right = viewWidth / 2
  camera.top = viewHeight / 2
  camera.bottom = -viewHeight / 2
  camera.zoom = cameraZoom
  camera.updateProjectionMatrix()

  camera.position.set(center.x, center.y, cameraZOffset)
  camera.lookAt(center)
  onTargetCenter?.(center)

  return center
}


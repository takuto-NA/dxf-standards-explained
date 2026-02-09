/**
 * Responsibility:
 * - Create and manage a DXF viewer instance (Three.js + three-dxf-viewer) for both VitePress and standalone apps.
 */

import {
  DEFAULT_CAMERA_INITIAL_ZOOM,
  DEFAULT_CAMERA_Z_OFFSET,
  DEFAULT_DEVICE_PIXEL_RATIO_CAP,
  DEFAULT_ORTHOGRAPHIC_CAMERA_FAR,
  DEFAULT_ORTHOGRAPHIC_CAMERA_NEAR
} from './constants'
import { disposeThreeObjectTree } from './disposeThreeObjectTree'
import { fitOrthographicCameraToBox } from './fitOrthographicCameraToBox'
import { createMeasureDistanceTool, type MeasureDistanceState } from './measureDistanceTool'

export type DxfViewerSource =
  | { type: 'url'; url: string }
  | { type: 'file'; file: File }

export type DxfViewerStatus = {
  isLoading: boolean
  errorMessage: string | null
}

export type CreateDxfViewerOptions = {
  containerElement: HTMLElement
  fontUrl: string
  initialSource?: DxfViewerSource
  devicePixelRatioCap?: number
  onStatusChange?: (status: DxfViewerStatus) => void
  onMeasureDistanceChange?: (distance: number | null) => void
}

export type DxfViewerHandle = {
  setSource: (source: DxfViewerSource) => Promise<void>
  fitToView: () => void
  setMeasureModeEnabled: (enabled: boolean) => void
  getMeasureState: () => MeasureDistanceState
  dispose: () => void
}

function setStatus(
  onStatusChange: CreateDxfViewerOptions['onStatusChange'] | undefined,
  status: DxfViewerStatus
): void {
  onStatusChange?.(status)
}

function getElementSizePx(element: HTMLElement): { widthPx: number; heightPx: number } {
  const widthPx = element.clientWidth
  const heightPx = element.clientHeight
  return { widthPx, heightPx }
}

export async function createDxfViewer(options: CreateDxfViewerOptions): Promise<DxfViewerHandle> {
  const {
    containerElement,
    fontUrl,
    initialSource,
    devicePixelRatioCap = DEFAULT_DEVICE_PIXEL_RATIO_CAP,
    onStatusChange,
    onMeasureDistanceChange
  } = options

  // Guard: containerElement must exist and be mounted.
  if (!containerElement) {
    throw new Error('DXF viewer containerElement is required.')
  }

  setStatus(onStatusChange, { isLoading: true, errorMessage: null })

  const [THREE, threeDxfViewerModule, orbitControlsModule] = await Promise.all([
    import('three'),
    import('three-dxf-viewer'),
    import('three/examples/jsm/controls/OrbitControls.js')
  ])

  const { DXFViewer, Merger } = threeDxfViewerModule
  const { OrbitControls } = orbitControlsModule

  const scene = new THREE.Scene()
  const { widthPx: initialWidthPx, heightPx: initialHeightPx } = getElementSizePx(containerElement)

  const camera = new THREE.OrthographicCamera(
    -initialWidthPx / 2,
    initialWidthPx / 2,
    initialHeightPx / 2,
    -initialHeightPx / 2,
    DEFAULT_ORTHOGRAPHIC_CAMERA_NEAR,
    DEFAULT_ORTHOGRAPHIC_CAMERA_FAR
  )

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

  const cappedDevicePixelRatio = Math.min(window.devicePixelRatio || 1, devicePixelRatioCap)
  renderer.setPixelRatio(cappedDevicePixelRatio)
  renderer.setSize(initialWidthPx, initialHeightPx, false)

  // Guard: ensure the canvas doesn't affect layout (prevents scrollbar-growth feedback loops).
  const canvasElement = renderer.domElement
  if (getComputedStyle(containerElement).position === 'static') {
    containerElement.style.position = 'relative'
  }
  canvasElement.style.position = 'absolute'
  canvasElement.style.inset = '0'
  canvasElement.style.width = '100%'
  canvasElement.style.height = '100%'
  canvasElement.style.display = 'block'
  canvasElement.style.zIndex = '0'
  containerElement.appendChild(canvasElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableRotate = false
  controls.enableDamping = false
  controls.screenSpacePanning = true

  controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE
  }

  let isDisposed = false
  let isRenderScheduled = false

  function renderNow(): void {
    if (isDisposed) return
    controls.update()
    renderer.render(scene, camera)
  }

  function requestRender(): void {
    if (isDisposed) return
    if (isRenderScheduled) return

    isRenderScheduled = true
    window.requestAnimationFrame(() => {
      isRenderScheduled = false
      renderNow()
    })
  }

  controls.addEventListener('change', requestRender)

  const dxfViewer = new DXFViewer()
  const merger = new Merger()

  let currentModelRoot: import('three').Object3D | null = null
  let lastFitCenter: import('three').Vector3 | null = null

  function removeCurrentModel(): void {
    if (!currentModelRoot) return
    scene.remove(currentModelRoot)
    disposeThreeObjectTree(currentModelRoot as unknown as any)
    currentModelRoot = null
  }

  function cleanupNaNGeometryData(modelRoot: import('three').Object3D): void {
    modelRoot.traverse((child) => {
      const childWithGeometry = child as unknown as {
        geometry?: {
          attributes?: { position?: { array: number[]; needsUpdate?: boolean } }
          computeBoundingBox?: () => void
          computeBoundingSphere?: () => void
        }
      }

      const geometry = childWithGeometry.geometry
      const positionAttribute = geometry?.attributes?.position
      if (!positionAttribute) return

      let hasNaN = false
      for (let index = 0; index < positionAttribute.array.length; index += 1) {
        const value = positionAttribute.array[index]
        if (Number.isNaN(value)) {
          positionAttribute.array[index] = 0
          hasNaN = true
        }
      }

      if (hasNaN) positionAttribute.needsUpdate = true
      geometry?.computeBoundingBox?.()
      geometry?.computeBoundingSphere?.()
    })
  }

  function fitToView(): void {
    // Guard: cannot fit before a model exists.
    if (!currentModelRoot) return

    const { widthPx, heightPx } = getElementSizePx(containerElement)
    const box = new THREE.Box3().setFromObject(currentModelRoot)

    const center = fitOrthographicCameraToBox({
      box,
      camera,
      viewportWidthPx: widthPx,
      viewportHeightPx: heightPx,
      cameraZOffset: DEFAULT_CAMERA_Z_OFFSET,
      cameraZoom: DEFAULT_CAMERA_INITIAL_ZOOM,
      onTargetCenter: (nextCenter) => {
        controls.target.set(nextCenter.x, nextCenter.y, nextCenter.z)
      },
      createVector3: () => new THREE.Vector3()
    })

    if (!center) return
    lastFitCenter = new THREE.Vector3(center.x, center.y, center.z)

    controls.update()
    requestRender()
  }

  function resizeToContainer(): void {
    const { widthPx, heightPx } = getElementSizePx(containerElement)
    if (widthPx <= 0) return
    if (heightPx <= 0) return

    const viewportAspectRatio = widthPx / heightPx
    const currentViewHeight = camera.top - camera.bottom
    const nextViewWidth = currentViewHeight * viewportAspectRatio

    camera.left = -nextViewWidth / 2
    camera.right = nextViewWidth / 2
    camera.updateProjectionMatrix()

    renderer.setSize(widthPx, heightPx, false)
    requestRender()
  }

  const resizeObserver = new ResizeObserver(() => {
    // Guard: ignore resize callbacks after dispose.
    if (isDisposed) return
    resizeToContainer()
  })
  resizeObserver.observe(containerElement)

  const measureDistanceTool = createMeasureDistanceTool({
    THREE,
    camera,
    scene,
    canvasElement: renderer.domElement,
    getPlaneZ: () => controls.target.z,
    requestRender,
    onDistanceChanged: onMeasureDistanceChange
  })

  async function loadFromUrl(url: string): Promise<void> {
    setStatus(onStatusChange, { isLoading: true, errorMessage: null })

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`)
    }

    const dxfBlob = await response.blob()
    const dxfFile = new File([dxfBlob], 'model.dxf')
    await loadFromFile(dxfFile)
  }

  async function loadFromFile(file: File): Promise<void> {
    setStatus(onStatusChange, { isLoading: true, errorMessage: null })

    removeCurrentModel()

    const dxfSceneRoot = await dxfViewer.getFromFile(file, fontUrl)
    if (!dxfSceneRoot) {
      throw new Error('Failed to parse DXF.')
    }

    const mergedSceneRoot = merger.merge(dxfSceneRoot)
    cleanupNaNGeometryData(mergedSceneRoot)

    currentModelRoot = mergedSceneRoot
    scene.add(mergedSceneRoot)

    fitToView()
    setStatus(onStatusChange, { isLoading: false, errorMessage: null })
  }

  async function setSource(source: DxfViewerSource): Promise<void> {
    try {
      if (source.type === 'url') {
        await loadFromUrl(source.url)
        return
      }

      await loadFromFile(source.file)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unexpected error while loading DXF.'
      setStatus(onStatusChange, { isLoading: false, errorMessage })
    } finally {
      requestRender()
    }
  }

  if (initialSource) {
    await setSource(initialSource)
  } else {
    setStatus(onStatusChange, { isLoading: false, errorMessage: null })
    requestRender()
  }

  return {
    setSource,
    fitToView,
    setMeasureModeEnabled: (enabled) => {
      measureDistanceTool.setEnabled(enabled)
      requestRender()
    },
    getMeasureState: () => measureDistanceTool.getState(),
    dispose: () => {
      if (isDisposed) return
      isDisposed = true

      resizeObserver.disconnect()
      controls.removeEventListener('change', requestRender)
      controls.dispose()

      measureDistanceTool.dispose()

      removeCurrentModel()

      renderer.dispose()

      const canvasElement = renderer.domElement
      canvasElement.parentElement?.removeChild(canvasElement)
    }
  }
}


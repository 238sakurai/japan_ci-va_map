/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare namespace GeoJSON {
  interface FeatureCollection {
    type: 'FeatureCollection'
    features: Feature[]
  }

  interface Feature {
    type: 'Feature'
    properties: Record<string, unknown> | null
    geometry: Geometry
  }

  type Geometry = Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon | GeometryCollection
}

declare namespace TopoJSON {
  interface GeometryCollection {
    type: 'GeometryCollection'
    geometries: Array<{
      type: string
      arcs?: number[][]
      properties?: Record<string, unknown>
      id?: string
    }>
  }
}

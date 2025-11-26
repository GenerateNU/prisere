import { FeatureCollection } from "geojson";

export interface LayerStyle {
    radius?: number;
    fillOpacity?: number;
    weight?: number;
    opacity?: number;
    defaultColor?: string;
}

export interface GeoJSONLayerConfig extends LayerStyle {
    geojson: FeatureCollection;
}

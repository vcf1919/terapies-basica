/**
 * Mapa 3D con MapLibre + OpenFreeMap (sin API key). Código de PLANTILLA.
 * Se importa dinámicamente cuando la sección entra en pantalla.
 */
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';

maplibregl.setWorkerUrl(workerUrl);

const STYLE = 'https://tiles.openfreemap.org/styles/positron';

export function initMap(el: HTMLElement) {
  const d = el.dataset;
  const center: [number, number] = [Number(d.lng), Number(d.lat)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const map = new maplibregl.Map({
    container: el,
    style: STYLE,
    center,
    zoom: Number(d.zoom) - (reduce ? 0 : 0.6),
    pitch: reduce ? Number(d.pitch) : 0,
    bearing: reduce ? Number(d.bearing) : 0,
    cooperativeGestures: true,
    attributionControl: { compact: true },
    maxPitch: 75,
  });
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true, showCompass: true }), 'top-right');

  map.on('load', () => {
    const style = map.getStyle();
    // Quita extrusiones que traiga el estilo y añade las nuestras con el color de marca
    for (const l of style.layers ?? []) if (l.type === 'fill-extrusion') map.removeLayer(l.id);
    const firstSymbol = style.layers?.find((l) => l.type === 'symbol')?.id;
    map.addLayer(
      {
        id: 'rg-edificios',
        type: 'fill-extrusion',
        source: 'openmaptiles',
        'source-layer': 'building',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': [
            'interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 6],
            0, d.colorLight!, 40, d.color!,
          ],
          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14, 0, 15.5, ['coalesce', ['get', 'render_height'], 6]],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
          'fill-extrusion-opacity': 0.82,
          'fill-extrusion-vertical-gradient': true,
        },
      },
      firstSymbol,
    );

    if (!reduce) {
      map.easeTo({ zoom: Number(d.zoom), pitch: Number(d.pitch), bearing: Number(d.bearing), duration: 2600, easing: (t) => 1 - Math.pow(1 - t, 4) });
    }
  });

  // Marcador con el logo
  const pin = document.createElement('div');
  pin.className = 'map-pin';
  pin.setAttribute('role', 'img');
  pin.setAttribute('aria-label', d.name ?? '');
  pin.innerHTML = `<span class="map-pin__badge"><img src="${d.logo}" alt="" /></span><span class="map-pin__tip"></span>`;
  new maplibregl.Marker({ element: pin, anchor: 'bottom' }).setLngLat(center).addTo(map);

  el.closest('[data-map-wrap]')?.setAttribute('data-loaded', '');
  return map;
}

import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { DangerousLocation, SOSAlert } from '../../services/defense-store';

interface OSMWebViewProps {
  userLocation: { latitude: number; longitude: number };
  dangerousLocations?: DangerousLocation[];
  sosAlerts?: SOSAlert[];
  onMapClick?: (coords: { latitude: number; longitude: number }) => void;
  onMarkerClick?: (id: string, type: 'danger' | 'sos') => void;
  zoom?: number;
  interactive?: boolean;
  themeMode?: 'light' | 'dark' | 'highcontrast';
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}

export default function OSMWebView({
  userLocation,
  dangerousLocations = [],
  sosAlerts = [],
  onMapClick,
  onMarkerClick,
  zoom = 14,
  interactive = true,
  themeMode = 'dark',
  onInteractionStart,
  onInteractionEnd,
}: OSMWebViewProps) {
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (webViewRef.current) {
      const payload = JSON.stringify({
        type: 'UPDATE_ALL',
        userLocation,
        dangerousLocations,
        sosAlerts,
        zoom,
        themeMode,
      });
      webViewRef.current.postMessage(payload);
    }
  }, [userLocation, dangerousLocations, sosAlerts, zoom, themeMode]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_CLICK' && onMapClick) {
        onMapClick({ latitude: data.latitude, longitude: data.longitude });
      } else if (data.type === 'MARKER_CLICK' && onMarkerClick) {
        onMarkerClick(data.id, data.itemType);
      }
    } catch (e) {
      console.warn('Błąd odbierania wiadomości z WebView mapy:', e);
    }
  };

  const tileClass =
    themeMode === 'light'
      ? 'tiles-light'
      : themeMode === 'highcontrast'
      ? 'tiles-hc'
      : 'tiles-dark';

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { box-sizing: border-box; }
        body, html, #map { width: 100%; height: 100%; margin: 0; padding: 0; background-color: #0F172A; }
        .leaflet-container { background: #0F172A; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        
        .tiles-dark {
          filter: brightness(0.7) invert(1) contrast(1.2) hue-rotate(200deg) saturate(0.3);
        }
        .tiles-light {
          filter: brightness(1) contrast(1);
        }
        .tiles-hc {
          filter: brightness(0.5) invert(1) contrast(2) saturate(0);
        }

        .user-marker { display: flex; align-items: center; justify-content: center; }
        .user-dot {
          width: 18px; height: 18px; background: #007AFF; border: 3px solid #FFFFFF;
          border-radius: 50%; box-shadow: 0 0 12px rgba(0, 122, 255, 0.8);
        }
        .user-pulse {
          position: absolute; width: 40px; height: 40px; border-radius: 50%;
          background: rgba(0, 122, 255, 0.3); animation: pulse 2s infinite ease-out;
        }

        .sos-marker { display: flex; align-items: center; justify-content: center; }
        .sos-icon-box {
          width: 36px; height: 36px; background: #FF2D55; border: 2px solid #FFFFFF;
          border-radius: 50%; color: white; font-weight: bold; font-size: 11px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px #FF2D55; animation: sos-glow 1s infinite alternate;
        }
        .sos-pulse-ring {
          position: absolute; width: 60px; height: 60px; border: 3px solid #FF2D55;
          border-radius: 50%; animation: sos-ring 1.5s infinite linear;
        }

        .danger-marker { display: flex; align-items: center; justify-content: center; }
        .danger-icon-box {
          width: 32px; height: 32px; border-radius: 8px; color: white; font-weight: bold;
          display: flex; align-items: center; justify-content: center; font-size: 16px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5); border: 2px solid #FFF;
        }
        .severity-critical { background: #E63946; }
        .severity-high { background: #F77F00; }
        .severity-medium { background: #FCBF49; color: #111; }
        .severity-low { background: #457B9D; }

        @keyframes pulse { 0% { transform: scale(0.4); opacity: 1; } 100% { transform: scale(1.4); opacity: 0; } }
        @keyframes sos-glow { from { transform: scale(1); } to { transform: scale(1.15); } }
        @keyframes sos-ring { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(1.6); opacity: 0; } }

        .leaflet-popup-content-wrapper {
          background: #1E293B; color: #FFF; border-radius: 12px; padding: 8px 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.7); border: 1px solid #334155;
        }
        .leaflet-popup-tip { background: #1E293B; }
        .popup-title { font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #EF4444; }
        .popup-desc { font-size: 12px; color: #CCC; margin-bottom: 6px; }
        .popup-meta { font-size: 10px; color: #888; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${userLocation.latitude}, ${userLocation.longitude}], ${zoom});

        var tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          className: '${tileClass}'
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        var userMarker = L.marker([${userLocation.latitude}, ${userLocation.longitude}], {
          icon: L.divIcon({
            className: 'user-marker',
            html: '<div class="user-pulse"></div><div class="user-dot"></div>',
            iconSize: [40, 40], iconAnchor: [20, 20]
          })
        }).addTo(map);

        var dangerMarkersLayer = L.layerGroup().addTo(map);
        var sosMarkersLayer = L.layerGroup().addTo(map);

        map.on('click', function(e) {
          if (${interactive ? 'true' : 'false'}) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'MAP_CLICK', latitude: e.latlng.lat, longitude: e.latlng.lng
            }));
          }
        });

        function renderMapData(data) {
          if (!data) return;

          if (data.userLocation && data.userLocation.latitude) {
            userMarker.setLatLng([data.userLocation.latitude, data.userLocation.longitude]);
          }

          dangerMarkersLayer.clearLayers();
          if (data.dangerousLocations && data.dangerousLocations.length) {
            data.dangerousLocations.forEach(function(item) {
              var iconSymbol = '⚠️';
              if (item.category === 'lighting') iconSymbol = '💡';
              else if (item.category === 'suspicious') iconSymbol = '👁️';
              else if (item.category === 'accident') iconSymbol = '🚗';
              else if (item.category === 'infrastructure') iconSymbol = '🚧';
              else if (item.category === 'threat') iconSymbol = '🚨';

              var m = L.marker([item.latitude, item.longitude], {
                icon: L.divIcon({
                  className: 'danger-marker',
                  html: '<div class="danger-icon-box severity-' + (item.severity || 'high') + '">' + iconSymbol + '</div>',
                  iconSize: [32, 32], iconAnchor: [16, 16]
                })
              });
              m.bindPopup('<div class="popup-title">' + (item.title || 'Zagrożenie') + '</div><div class="popup-desc">' + (item.description || '') + '</div>');
              dangerMarkersLayer.addLayer(m);
            });
          }

          sosMarkersLayer.clearLayers();
          if (data.sosAlerts && data.sosAlerts.length) {
            data.sosAlerts.forEach(function(sos) {
              if (sos.active) {
                var sMarker = L.marker([sos.latitude, sos.longitude], {
                  icon: L.divIcon({
                    className: 'sos-marker',
                    html: '<div class="sos-pulse-ring"></div><div class="sos-icon-box">SOS</div>',
                    iconSize: [60, 60], iconAnchor: [30, 30]
                  })
                });
                sMarker.bindPopup('<div class="popup-title">🚨 ALARM SOS!</div><div class="popup-desc">' + (sos.message || '') + '</div>');
                sosMarkersLayer.addLayer(sMarker);
              }
            });
          }
        }

        renderMapData({
          userLocation: ${JSON.stringify(userLocation)},
          dangerousLocations: ${JSON.stringify(dangerousLocations)},
          sosAlerts: ${JSON.stringify(sosAlerts)}
        });

        document.addEventListener('message', function(event) { handleIncomingMessage(event.data); });
        window.addEventListener('message', function(event) { handleIncomingMessage(event.data); });

        function handleIncomingMessage(msgString) {
          try {
            var msg = JSON.parse(msgString);
            if (msg.type === 'UPDATE_ALL') renderMapData(msg);
          } catch(e) {}
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        nestedScrollEnabled={true}
        onMessage={handleMessage}
        onTouchStart={onInteractionStart}
        onTouchEnd={onInteractionEnd}
        onTouchCancel={onInteractionEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});

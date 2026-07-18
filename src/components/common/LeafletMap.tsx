import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

export interface LatLng {
    latitude: number;
    longitude: number;
}

export interface LeafletMarker {
    id: string | number;
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    color?: string;
}

export interface LeafletPolyline {
    coordinates: LatLng[];
    strokeColor?: string;
    strokeWidth?: number;
}

export interface LeafletMapProps {
    initialRegion?: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    };
    markers?: LeafletMarker[];
    polylines?: LeafletPolyline[];
    showsUserLocation?: boolean;
    showsMyLocationButton?: boolean;
    onPress?: (coord: LatLng) => void;
    onMarkerPress?: (markerId: string | number) => void;
    onRegionChangeComplete?: (region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }) => void;
    style?: ViewStyle;
}

export interface LeafletMapRef {
    fitToCoordinates: (coordinates: LatLng[], options?: { edgePadding?: { top: number; right: number; bottom: number; left: number }; animated?: boolean }) => void;
    animateToRegion: (region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }, duration?: number) => void;
}

const LEAFLET_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { padding: 0; margin: 0; background-color: #f4f3f4; }
    html, body, #map { height: 100%; width: 100%; }
    .leaflet-control-attribution { font-size: 8px !important; }
    .custom-marker-icon {
      width: 24px;
      height: 24px;
      border-radius: 12px;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map;
    var markersMap = {};
    var polylineObjects = [];
    var userLocationMarker = null;

    function initMap(lat, lng, zoom) {
      map = L.map('map', { zoomControl: false }).setView([lat, lng], zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      map.on('click', function(e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'onPress',
          coordinate: { latitude: e.latlng.lat, longitude: e.latlng.lng }
        }));
      });

      map.on('moveend', function() {
        var center = map.getCenter();
        var zoom = map.getZoom();
        var bounds = map.getBounds();
        var latDelta = Math.abs(bounds.getNorth() - bounds.getSouth());
        var lngDelta = Math.abs(bounds.getEast() - bounds.getWest());

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'onRegionChangeComplete',
          region: {
            latitude: center.lat,
            longitude: center.lng,
            latitudeDelta: latDelta,
            longitudeDelta: lngDelta
          }
        }));
      });
      
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
    }

    window.addEventListener('message', function(event) {
      try {
        var message = JSON.parse(event.data);
        if (message.type === 'init') {
          initMap(message.lat, message.lng, message.zoom);
        } else if (message.type === 'animateToRegion') {
          map.setView([message.lat, message.lng], message.zoom || map.getZoom());
        } else if (message.type === 'fitToCoordinates') {
          var bounds = L.latLngBounds(message.coords.map(function(c) { return [c.latitude, c.longitude]; }));
          map.fitBounds(bounds, { padding: [30, 30] });
        } else if (message.type === 'updateMarkers') {
          // Clear old markers
          Object.keys(markersMap).forEach(function(key) { map.removeLayer(markersMap[key]); });
          markersMap = {};

          message.markers.forEach(function(m) {
            var iconColor = m.color || '#E91E63';
            var customIcon = L.divIcon({
              className: '',
              html: '<div class="custom-marker-icon" style="background-color: ' + iconColor + ';"></div>',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });

            var marker = L.marker([m.latitude, m.longitude], { icon: customIcon });
            if (m.title || m.description) {
              marker.bindPopup("<b>" + (m.title || "") + "</b><br/>" + (m.description || ""));
            }
            marker.on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'onMarkerPress',
                markerId: m.id
              }));
            });
            marker.addTo(map);
            markersMap[m.id] = marker;
          });
        } else if (message.type === 'updatePolylines') {
          polylineObjects.forEach(function(p) { map.removeLayer(p); });
          polylineObjects = [];

          message.polylines.forEach(function(p) {
            var latlngs = p.coordinates.map(function(c) { return [c.latitude, c.longitude]; });
            var polyline = L.polyline(latlngs, {
              color: p.strokeColor || '#E91E63',
              weight: p.strokeWidth || 3
            }).addTo(map);
            polylineObjects.push(polyline);
          });
        }
      } catch (e) {
        console.error("Leaflet postMessage error:", e);
      }
    });
  </script>
</body>
</html>
`;

export const LeafletMap = forwardRef<LeafletMapRef, LeafletMapProps>(({
    initialRegion,
    markers = [],
    polylines = [],
    showsUserLocation,
    onPress,
    onMarkerPress,
    onRegionChangeComplete,
    style
}, ref) => {
    const webViewRef = useRef<WebView>(null);
    const isReady = useRef(false);

    useImperativeHandle(ref, () => ({
        fitToCoordinates: (coordinates: LatLng[]) => {
            if (webViewRef.current && isReady.current) {
                webViewRef.current.postMessage(JSON.stringify({
                    type: 'fitToCoordinates',
                    coords: coordinates
                }));
            }
        },
        animateToRegion: (region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }) => {
            if (webViewRef.current && isReady.current) {
                webViewRef.current.postMessage(JSON.stringify({
                    type: 'animateToRegion',
                    lat: region.latitude,
                    lng: region.longitude
                }));
            }
        }
    }));

    useEffect(() => {
        if (webViewRef.current && isReady.current) {
            webViewRef.current.postMessage(JSON.stringify({
                type: 'updateMarkers',
                markers
            }));
        }
    }, [markers]);

    useEffect(() => {
        if (webViewRef.current && isReady.current) {
            webViewRef.current.postMessage(JSON.stringify({
                type: 'updatePolylines',
                polylines
            }));
        }
    }, [polylines]);

    const handleMessage = (event: any) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'ready') {
                isReady.current = true;
                // Sync initial markers and polylines
                webViewRef.current?.postMessage(JSON.stringify({
                    type: 'updateMarkers',
                    markers
                }));
                webViewRef.current?.postMessage(JSON.stringify({
                    type: 'updatePolylines',
                    polylines
                }));
            } else if (message.type === 'onPress' && onPress) {
                onPress(message.coordinate);
            } else if (message.type === 'onMarkerPress' && onMarkerPress) {
                onMarkerPress(message.markerId);
            } else if (message.type === 'onRegionChangeComplete' && onRegionChangeComplete) {
                onRegionChangeComplete(message.region);
            }
        } catch (e) {
            console.error('Leaflet message parsing error:', e);
        }
    };

    const initialLat = initialRegion?.latitude ?? 52.3676;
    const initialLng = initialRegion?.longitude ?? 4.9041;
    const initialZoom = 13;

    return (
        <View style={[styles.container, style]}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: LEAFLET_HTML, baseUrl: 'https://unpkg.com' }}
                style={styles.webView}
                onMessage={handleMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onLoadEnd={() => {
                    webViewRef.current?.postMessage(JSON.stringify({
                        type: 'init',
                        lat: initialLat,
                        lng: initialLng,
                        zoom: initialZoom
                    }));
                }}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    webView: {
        flex: 1,
    }
});

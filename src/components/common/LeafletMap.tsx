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
    type?: 'tour' | 'stop';
    imageUrl?: string;
    genre?: string;
    stopType?: string;
    stopNumber?: number;
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
      if (typeof L === 'undefined') {
        setTimeout(function() { initMap(lat, lng, zoom); }, 100);
        return;
      }
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

    function getGenreSvg(genre, size) {
      size = size || 16;
      var compassPath = '<circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>';
      var path = compassPath;

      if (genre === 'Adventure' || genre === 'Compass') {
        path = '<circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>';
      } else if (genre === 'Pub Crawl' || genre === 'Nightlife' || genre === 'Beer') {
        path = '<path d="M17 11h1a3 3 0 0 1 0 6h-1"></path><path d="M9 12v6H5v-6h4m0-4h8v12H9V8Z"></path>';
      } else if (genre === 'Culture' || genre === 'Sightseeing' || genre === 'Museum') {
        path = '<path d="M4 22V10h16v12M2 10l10-8 10 8M6 14v4M10 14v4M14 14v4M18 14v4"></path>';
      } else if (genre === 'Food' || genre === 'Gastronomy') {
        path = '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v4M12 15V2M15 2v13a3 3 0 0 0 3 3h1v4M18 2v13"></path>';
      } else if (genre === 'Nature' || genre === 'Outdoors') {
        path = '<path d="m12 19 7-7H5l7 7Zm0 0v3M12 2l8 8H4l8-8Z"></path>';
      } else if (genre === 'History') {
        path = '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5v-15Z"></path>';
      }

      return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:block;">' + path + '</svg>';
    }

    function getStopSvg(stopType, size, color) {
      size = size || 16;
      color = color || '#333333';
      var path = '<circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>';

      if (stopType === 'Viewpoint') {
        path = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"></path><circle cx="12" cy="12" r="3"></circle>';
      } else if (stopType === 'Pub' || stopType === 'Bar') {
        path = '<path d="M17 11h1a3 3 0 0 1 0 6h-1"></path><path d="M9 12v6H5v-6h4m0-4h8v12H9V8Z"></path>';
      } else if (stopType === 'Restaurant' || stopType === 'Food') {
        path = '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v4M12 15V2M15 2v13a3 3 0 0 0 3 3h1v4M18 2v13"></path>';
      } else if (stopType === 'Historical' || stopType === 'Landmark') {
        path = '<path d="M4 22V10h16v12M2 10l10-8 10 8M6 14v4M10 14v4M14 14v4M18 14v4"></path>';
      } else if (stopType === 'Activity' || stopType === 'Challenge') {
        path = '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4 4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Z"></path>';
      } else if (stopType === 'Shop' || stopType === 'Store') {
        path = '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"></path>';
      } else if (stopType === 'Restroom') {
        path = '<path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-3.87 0-7 3.13-7 7v1h14v-1c0-3.87-3.13-7-7-7z"></path>';
      }

      return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" stroke="' + color + '" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:block;">' + path + '</svg>';
    }

    function handleMessage(event) {
      try {
        var message = JSON.parse(event.data);
        if (message.type === 'init') {
          initMap(message.lat, message.lng, message.zoom);
        } else if (message.type === 'animateToRegion') {
          if (map) {
            map.setView([message.lat, message.lng], message.zoom || map.getZoom());
          }
        } else if (message.type === 'fitToCoordinates') {
          if (map && message.coords && message.coords.length > 0) {
            var bounds = L.latLngBounds(message.coords.map(function(c) { return [c.latitude, c.longitude]; }));
            map.fitBounds(bounds, { padding: [30, 30] });
          }
        } else if (message.type === 'updateMarkers') {
          if (!map) return;
          // Clear old markers
          Object.keys(markersMap).forEach(function(key) { map.removeLayer(markersMap[key]); });
          markersMap = {};

          message.markers.forEach(function(m) {
            var iconColor = m.color || '#E91E63';
            var html = '';
            var iconSize = [24, 24];
            var iconAnchor = [12, 12];

            if (m.type === 'tour') {
              iconSize = [48, 56];
              iconAnchor = [24, 48];
              var imageHtml = '';
              if (m.imageUrl) {
                imageHtml = '<img src="' + m.imageUrl + '" style="width:100%; height:100%; object-fit:cover;" />';
              } else {
                imageHtml = '<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background-color:' + iconColor + '; color:#fff;">' + getGenreSvg(m.genre, 20) + '</div>';
              }

              html = 
                '<div style="position:relative; width:48px; height:48px;">' +
                  '<div style="width:40px; height:40px; border-radius:20px; border:3px solid #ffffff; box-shadow:0 3px 6px rgba(0,0,0,0.3); overflow:hidden; background-color:#333; margin: auto;">' +
                    imageHtml +
                  '</div>' +
                  '<div style="position:absolute; bottom:2px; right:0px; width:20px; height:20px; border-radius:10px; border:2px solid #ffffff; background-color:' + iconColor + '; display:flex; align-items:center; justify-content:center; box-shadow:0 1px 3px rgba(0,0,0,0.2); z-index: 10;">' +
                    getGenreSvg(m.genre, 10) +
                  '</div>' +
                  '<div style="position:absolute; bottom:-6px; left:20px; width:0; height:0; border-left:4px solid transparent; border-right:4px solid transparent; border-top:6px solid #ffffff;"></div>' +
                '</div>';
            } else if (m.type === 'stop') {
              iconSize = [40, 44];
              iconAnchor = [20, 36];

              var isStart = m.stopNumber === 1;
              var bubbleBg = isStart ? iconColor : '#ffffff';
              var iconColorHex = isStart ? '#ffffff' : '#333333';
              var borderHex = isStart ? '#ffffff' : iconColor;

              html = 
                '<div style="position:relative; width:40px; height:40px;">' +
                  '<div style="width:36px; height:36px; border-radius:18px; border:2px solid ' + borderHex + '; background-color:' + bubbleBg + '; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 6px rgba(0,0,0,0.25);">' +
                    getStopSvg(m.stopType, 18, iconColorHex) +
                  '</div>' +
                  '<div style="position:absolute; top:-4px; right:-4px; min-width:16px; height:16px; border-radius:8px; border:1.5px solid #ffffff; background-color:' + iconColor + '; display:flex; align-items:center; justify-content:center; padding:0 3px; box-shadow:0 1px 3px rgba(0,0,0,0.2); z-index: 10;">' +
                    '<span style="color:#ffffff; font-size:9px; font-weight:bold; font-family:sans-serif; line-height:1;">' + m.stopNumber + '</span>' +
                  '</div>' +
                  '<div style="position:absolute; bottom:-5px; left:16px; width:0; height:0; border-left:4px solid transparent; border-right:4px solid transparent; border-top:5px solid ' + borderHex + ';"></div>' +
                '</div>';
            } else {
              html = '<div class="custom-marker-icon" style="background-color: ' + iconColor + ';"></div>';
            }

            var customIcon = L.divIcon({
              className: '',
              html: html,
              iconSize: iconSize,
              iconAnchor: iconAnchor
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
          if (!map) return;
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
    }

    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage);
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

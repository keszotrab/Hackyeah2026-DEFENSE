import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { UrlTile, Marker } from 'react-native-maps';

export default function OSMMap({ 
  latitude = 52.2297, // Domyślnie Warszawa
  longitude = 21.0122, 
  zoom = 0.0922,
  showMarker = true,
  markerTitle = "Twoja lokalizacja"
}) {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: zoom,
          longitudeDelta: zoom * 0.5, // Proporcja dla ekranu pionowego
        }}
      >
        {/* Warstwa z darmowymi kafelkami OpenStreetMap */}
        <UrlTile
          urlTemplate="https://openstreetmap.org{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        {/* Opcjonalny znacznik na mapie */}
        {showMarker && (
          <Marker
            coordinate={{ latitude, longitude }}
            title={markerTitle}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300, // Możesz zmienić wysokość komponentu według uznania
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
});

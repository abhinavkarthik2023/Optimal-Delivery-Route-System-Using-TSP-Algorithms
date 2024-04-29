import React, { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { Marker } from "react-leaflet/Marker";
import { Popup } from "react-leaflet/Popup";
import { Polyline } from "react-leaflet/Polyline";
import { nodes, edges } from "../utils/constants";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function Map({ path }) {
  const [markers, setMarkers] = useState([]);
  const [polylines, setPolylines] = useState([]);

  useEffect(() => {
    let optimalPathEdges = [];

    // Ensure path elements have necessary data to avoid errors
    path.forEach((point, index) => {
      if (!point || !point.lat || !point.lon) {
        console.error("Invalid marker point:", point);
        return; // Skip this iteration
      }

      // Pairwise iteration of path to form polyline edges
      if (index < path.length - 1) {
        let next = path[index + 1];
        optimalPathEdges.push([[point.lat, point.lon], [next.lat, next.lon]]);
      }

      // Loop back to the start to close the path
      if (index === path.length - 1) {
        let first = path[0];
        optimalPathEdges.push([[point.lat, point.lon], [first.lat, first.lon]]);
      }
    });

    setMarkers(path); // Store valid path markers
    setPolylines(optimalPathEdges); // Store created edges
  }, [path]);

  return (
    <MapContainer
      center={[37.0902, -95.7129]} // Center of contiguous US
      zoom={5} // Adequate zoom to show all 49 states
      style={{ width: "100vw", height: "100vh" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((position, index) => {
        // Ensure safety check again before rendering
        if (!position || !position.lat || !position.lon) return null;

        return (
          <Marker
            key={`marker-${index}`}
            position={[position.lat, position.lon]}
          >
            <Popup keepInView={true}>
              <p>Position: {position.id}</p>
              <p>Index: {index + 1}</p>
            </Popup>
          </Marker>
        );
      })}
      {polylines.map((positions, index) => (
        <Polyline key={`polyline-${index}`} positions={positions} />
      ))}
    </MapContainer>
  );
}
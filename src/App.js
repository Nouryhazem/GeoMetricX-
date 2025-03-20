import React, { useState } from "react";
import Globe from "react-globe.gl";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "./index.css";

// Haversine Formula for Geodesic Distance
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Euclidean Distance Calculation (Converting to Cartesian First)
const euclideanDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  // Convert lat/lon to Cartesian (X, Y, Z)
  const x1 = R * Math.cos(toRad(lat1)) * Math.cos(toRad(lon1));
  const y1 = R * Math.cos(toRad(lat1)) * Math.sin(toRad(lon1));
  const z1 = R * Math.sin(toRad(lat1));

  const x2 = R * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2));
  const y2 = R * Math.cos(toRad(lat2)) * Math.sin(toRad(lon2));
  const z2 = R * Math.sin(toRad(lat2));

  // Compute Euclidean distance in 3D space
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);
};

const App = () => {
  const [coords, setCoords] = useState({
    lat1: 28.1094, // Minya, Egypt latitude
    lon1: 30.7500, // Minya, Egypt longitude
    lat2: 40.7128, // New York latitude
    lon2: -74.0060, // New York longitude
  });
  const [distance, setDistance] = useState(null);
  const [euclidean, setEuclidean] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const validateCoordinates = (lat, lon) => {
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return false;
    }
    return true;
  };

  const calculateDistance = () => {
    if (
      !validateCoordinates(coords.lat1, coords.lon1) ||
      !validateCoordinates(coords.lat2, coords.lon2)
    ) {
      setError("Invalid coordinates. Latitude must be between -90 and 90, and longitude between -180 and 180.");
      return;
    }
    setError("");

    const geoDist = haversineDistance(
      coords.lat1,
      coords.lon1,
      coords.lat2,
      coords.lon2
    ).toFixed(2);
    const eucDist = euclideanDistance(
      coords.lat1,
      coords.lon1,
      coords.lat2,
      coords.lon2
    ).toFixed(2);
    setDistance(geoDist);
    setEuclidean(eucDist);

    // Add to history
    setHistory([
      ...history,
      {
        lat1: coords.lat1,
        lon1: coords.lon1,
        lat2: coords.lat2,
        lon2: coords.lon2,
        geodesic: geoDist,
        euclidean: eucDist,
      },
    ]);
  };

  const resetInputs = () => {
    setCoords({ lat1: 0, lon1: 0, lat2: 0, lon2: 0 });
    setDistance(null);
    setEuclidean(null);
    setError("");
  };

  // Updated predefined test cases with Minya, Egypt as the starting point
  const predefinedTestCases = [
    {
      name: "Minya to New York",
      coords: { lat1: 28.1094, lon1: 30.7500, lat2: 40.7128, lon2: -74.0060 },
    },
    {
      name: "Minya to London",
      coords: { lat1: 28.1094, lon1: 30.7500, lat2: 51.5074, lon2: -0.1278 },
    },
    {
      name: "Minya to Tokyo",
      coords: { lat1: 28.1094, lon1: 30.7500, lat2: 35.6762, lon2: 139.6503 },
    },
    {
      name: "Minya to Sydney",
      coords: { lat1: 28.1094, lon1: 30.7500, lat2: -33.8688, lon2: 151.2093 },
    },
    {
      name: "Minya to Cape Town",
      coords: { lat1: 28.1094, lon1: 30.7500, lat2: -33.9249, lon2: 18.4241 },
    },
  ];

  // Data for the 3D globe
  const arcsData = [
    {
      startLat: coords.lat1,
      startLng: coords.lon1,
      endLat: coords.lat2,
      endLng: coords.lon2,
      color: "blue",
    },
  ];

  // Points for the 3D globe
  const pointsData = [
    {
      lat: coords.lat1,
      lng: coords.lon1,
      label: "Minya, Egypt",
    },
    {
      lat: coords.lat2,
      lng: coords.lon2,
      label: "Destination",
    },
  ];

  return (
    <div className="container">
      <div className="header">
        <h1>Geo Distance Calculator</h1>
      </div>

      {/* Input Fields */}
      <div className="input-group">
        <input
          type="number"
          placeholder="Latitude 1"
          value={coords.lat1}
          onChange={(e) => setCoords({ ...coords, lat1: parseFloat(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Longitude 1"
          value={coords.lon1}
          onChange={(e) => setCoords({ ...coords, lon1: parseFloat(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Latitude 2"
          value={coords.lat2}
          onChange={(e) => setCoords({ ...coords, lat2: parseFloat(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Longitude 2"
          value={coords.lon2}
          onChange={(e) => setCoords({ ...coords, lon2: parseFloat(e.target.value) })}
        />
      </div>

      {/* Buttons */}
      <div className="button-group">
        <button className="solid-button" onClick={calculateDistance}>
          Calculate Distance
        </button>
        <button className="solid-button" onClick={resetInputs}>
          Reset
        </button>
      </div>

      {/* Predefined Test Cases */}
      <div className="button-group">
        {predefinedTestCases.map((testCase, index) => (
          <button
            key={index}
            className="solid-button"
            onClick={() => setCoords(testCase.coords)}
          >
            {testCase.name}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {/* Results */}
      {distance && (
        <div className="results">
          <h3>Results</h3>
          <p>Geodesic Distance: {distance} km</p>
          <p>Euclidean Distance: {euclidean} km</p>
          <p>Difference: {(distance - euclidean).toFixed(2)} km</p>
        </div>
      )}

      {/* 3D Globe Visualization */}
      <div className="globe-container">
        <Globe
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          arcsData={arcsData}
          arcColor={"color"}
          arcDashLength={0.5}
          arcDashGap={0.5}
          arcDashAnimateTime={2000}
          pointsData={pointsData}
          pointLabel="label"
          pointColor={() => "red"}
          pointRadius={0.5}
          width={800}
          height={500}
        />
      </div>

      {/* 2D Map Display */}
      <div className="map-container">
        <MapContainer
          center={[coords.lat1, coords.lon1]}
          zoom={3}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Polyline
            positions={[
              [coords.lat1, coords.lon1],
              [coords.lat2, coords.lon2],
            ]}
            pathOptions={{ color: "blue", weight: 5 }}
          />
        </MapContainer>
      </div>

      {/* Why This Matters Section */}
      <div className="why-this-matters">
        <h3>Why This Matters</h3>
        <p>
          The <strong>Geodesic Distance</strong> is used in real-world applications like aviation and navigation, where the Earth's curvature must be accounted for. The <strong>Euclidean Distance</strong> is a straight-line approximation and is shorter, but it ignores the Earth's curvature. For large distances, the difference can be significant!
        </p>
      </div>

      {/* Distance History */}
      <div className="history">
        <h3>Distance History</h3>
        <table>
          <thead>
            <tr>
              <th>Point 1</th>
              <th>Point 2</th>
              <th>Geodesic (km)</th>
              <th>Euclidean (km)</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, index) => (
              <tr key={index}>
                <td>({entry.lat1}, {entry.lon1})</td>
                <td>({entry.lat2}, {entry.lon2})</td>
                <td>{entry.geodesic}</td>
                <td>{entry.euclidean}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
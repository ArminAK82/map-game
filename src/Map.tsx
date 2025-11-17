import React, { useEffect, useRef, useState } from 'react';

// Declare the Leaflet global object for TypeScript
declare const L: any;

// Simple interface for coordinates
interface Coords {
  lat: number;
  lng: number;
}

// Function to generate random treasures around a central point
const generateTreasures = (center: Coords, count: number, radius: number): Coords[] => {
  const treasures: Coords[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    // Simple random distance
    const distance = Math.sqrt(Math.random()) * radius;
    // Convert meters to degrees approximation
    const lat = center.lat + (distance * Math.cos(angle)) / 111111;
    const lng = center.lng + (distance * Math.sin(angle)) / (111111 * Math.cos(center.lat * Math.PI / 180));
    treasures.push({ lat, lng });
  }
  return treasures;
};

const Map: React.FC = () => {
  // Use a ref for the map container div
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // Use a ref for the map instance to avoid re-initialization
  const mapInstanceRef = useRef<any>(null);
  const [message, setMessage] = useState('در حال دریافت موقعیت مکانی شما...');

  useEffect(() => {
    // Initialize map only once
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // Default view if geolocation is slow or fails
      const map = L.map(mapContainerRef.current).setView([32.4279, 53.6880], 5); // Centered on Iran
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
    }

    if (!navigator.geolocation) {
      setMessage('مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation: Coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setMessage(''); // Clear loading message

        const map = mapInstanceRef.current;
        if (map) {
          map.setView([userLocation.lat, userLocation.lng], 15);

          // Add user marker
          L.marker([userLocation.lat, userLocation.lng]).addTo(map)
            .bindPopup('<b>موقعیت شما</b>')
            .openPopup();

          // Generate and add treasure markers
          const treasures = generateTreasures(userLocation, 5, 1000); // 5 treasures within 1km
          
          const treasureIcon = L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/1048/1048908.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
          });

          treasures.forEach(treasure => {
            L.marker([treasure.lat, treasure.lng], { icon: treasureIcon }).addTo(map)
              .bindPopup('یک گنج!');
          });
        }
      },
      () => {
        setMessage('اجازه دسترسی به موقعیت مکانی داده نشد. برای اجرای بازی، لطفاً دسترسی بدهید.');
      }
    );

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div id="map" ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      {message && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, padding: '20px', background: 'white', borderRadius: '8px' }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default Map;

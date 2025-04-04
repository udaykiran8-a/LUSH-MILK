
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapComponentProps {
  className?: string;
  locations?: Array<{
    lat: number;
    lng: number;
    title: string;
    description?: string;
  }>;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  className = "w-full h-[400px] rounded-lg overflow-hidden", 
  locations = [
    { lat: 12.9716, lng: 77.5946, title: "LushMilk Main Farm", description: "Our primary dairy farm in Bangalore" },
    { lat: 13.0827, lng: 80.2707, title: "LushMilk Chennai Hub", description: "Distribution center" },
    { lat: 17.3850, lng: 78.4867, title: "LushMilk Hyderabad Center", description: "Processing facility" }
  ]
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  // Securely use the Mapbox token provided by the user
  const MAPBOX_TOKEN = "pk.eyJ1IjoidWRheWtpcmFudiIsImEiOiJjbTkyYmU0OTAwOXB1MmlxenRraGdrcXZwIn0.58MDM36VCH0gczoj0bwatA";

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize Mapbox
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    // Create the map instance
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [79.0193, 14.5854], // Center on South India
      zoom: 5.5,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Wait for map to load
    map.current.on('load', () => {
      // Clear any existing markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      // Add markers for each farm/facility location
      locations.forEach(location => {
        // Create a popup
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <h3 class="text-sm font-semibold text-lushmilk-brown">${location.title}</h3>
            ${location.description ? `<p class="text-xs text-gray-600">${location.description}</p>` : ''}
          `);

        // Create a custom marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#eab308';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';

        // Add the marker to the map
        const marker = new mapboxgl.Marker(el)
          .setLngLat([location.lng, location.lat])
          .setPopup(popup)
          .addTo(map.current!);

        markers.current.push(marker);
      });
    });

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [locations, MAPBOX_TOKEN]);

  return (
    <div className={className}>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapComponent;

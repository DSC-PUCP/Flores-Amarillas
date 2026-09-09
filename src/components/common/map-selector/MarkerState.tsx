import type { LatLng } from 'leaflet';
import { useState } from 'react';
import { Circle, useMapEvents } from 'react-leaflet';

type MarkerStateProps = {
  position?: LatLng | null;
  onChange?: (position: LatLng) => void;
  radius?: number;
};
export default function MarkerState({
  radius = 500,
  onChange,
  position: controlledPosition,
}: MarkerStateProps) {
  const [internalPosition, setInternalPosition] = useState<LatLng | null>(null);
  const position = controlledPosition ?? internalPosition;
  const map = useMapEvents({
    click(e) {
      if (onChange) {
        onChange(e.latlng);
      } else {
        setInternalPosition(e.latlng);
      }
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  return <>{position && <Circle center={position} radius={radius} />}</>;
}

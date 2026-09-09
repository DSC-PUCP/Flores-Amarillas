import type { LatLng, LatLngBoundsLiteral, LatLngTuple } from 'leaflet';
import type { PropsWithChildren } from 'react';
import { MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet';

type Props = PropsWithChildren & {
  center?: LatLng;
  limitBoundaries: LatLngBoundsLiteral;
  referencePoints: { label: string; cords: LatLngTuple }[];
};
export default function MapSelector({
  children,
  center,
  limitBoundaries,
  referencePoints,
}: Props) {
  return (
    <MapContainer
      maxBounds={limitBoundaries}
      center={center}
      maxBoundsViscosity={1}
      className="my-4 h-[70svh] w-full rounded-2xl"
      zoom={13}
      minZoom={10}
      maxZoom={16}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
      {referencePoints.map((point) => (
        <Marker key={point.label} position={point.cords}>
          <Tooltip permanent direction="bottom">
            {point.label}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}

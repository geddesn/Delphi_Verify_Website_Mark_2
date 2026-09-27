type Address = {
  formattedAddress: string;
  city: string | null;
  county: string | null;
  region: string | null;
  country: string | null;
};

export function displayAddress(address: Address | null, accuracy: number) {
  if (!address) return null;
  if (accuracy >= 1000) return [address.region, address.country].filter(Boolean).join(", ") || null;
  const regional = [address.city ?? address.county, address.region, address.country].filter(Boolean).join(", ");
  return accuracy >= 250 ? regional || null : address.formattedAddress || regional || null;
}

export function googleMapsLocationUrl(gps: { lat: number; lng: number; accuracy: number }) {
  if (gps.accuracy >= 250) {
    const metres = gps.accuracy >= 1000 ? 1000 : 250;
    const latStep = metres / 111_320;
    const lngStep = metres / (111_320 * Math.max(0.01, Math.cos(gps.lat * Math.PI / 180)));
    // The QR independently rounds public coordinates so it cannot reveal a finer point.
    const center = `${(Math.round(gps.lat / latStep) * latStep).toFixed(5)},${(Math.round(gps.lng / lngStep) * lngStep).toFixed(5)}`;
    return `https://www.google.com/maps/@?api=1&map_action=map&center=${encodeURIComponent(center)}&zoom=${metres === 1000 ? 13 : 15}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${gps.lat},${gps.lng}`)}`;
}

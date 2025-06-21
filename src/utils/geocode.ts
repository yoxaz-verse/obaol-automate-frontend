// utils/geocode.ts
export const geocodeLocation = async (
  state: string,
  district?: string
): Promise<{ lat: number; lon: number } | null> => {
  const query = encodeURIComponent(`${district || ""}, ${state}, India`);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "LiveMapApp/1.0 (your@email.com)",
      },
    });
    const data = await res.json();

    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }

  return null;
};

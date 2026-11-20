import { NextRequest, NextResponse } from "next/server";

const NOMINATIM = "https://nominatim.openstreetmap.org";
const headers = { "User-Agent": "OBAOL-Supreme/1.0 (support@obaol.com)", Accept: "application/json" };

const normalize = (row: any) => {
  const address = row?.address || {};
  const city = address.city || address.town || address.village || address.municipality || address.county || "";
  const district = address.city_district || address.state_district || address.county || "";
  return {
    latitude: Number(row?.lat),
    longitude: Number(row?.lon),
    label: String(row?.display_name || [city, address.state, address.country].filter(Boolean).join(", ") || "Selected location"),
    address: String(row?.display_name || ""),
    city: String(city),
    district: String(district),
    state: String(address.state || address.region || ""),
    country: String(address.country || ""),
    countryCode: String(address.country_code || "").toUpperCase(),
    postalCode: String(address.postcode || ""),
  };
};

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("mode") === "reverse" ? "reverse" : "search";
  const requestedCountryCode = String(params.get("countryCode") || "").trim().toUpperCase();
  let url: string;
  if (mode === "reverse") {
    const latitude = Number(params.get("lat"));
    const longitude = Number(params.get("lng"));
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180 || (latitude === 0 && longitude === 0)) {
      return NextResponse.json({ message: "Valid coordinates are required." }, { status: 400 });
    }
    url = `${NOMINATIM}/reverse?format=jsonv2&addressdetails=1&lat=${latitude}&lon=${longitude}`;
  } else {
    const query = String(params.get("q") || "").trim().slice(0, 200);
    if (query.length < 3) return NextResponse.json({ results: [] });
    const countryCode = requestedCountryCode.toLowerCase();
    const countryFilter = /^[a-z]{2}$/.test(countryCode) ? `&countrycodes=${countryCode}` : "";
    url = `${NOMINATIM}/search?format=jsonv2&addressdetails=1&limit=6&q=${encodeURIComponent(query)}${countryFilter}`;
  }

  try {
    const response = await fetch(url, { headers, next: { revalidate: 300 } });
    if (!response.ok) throw new Error(`Geocoder returned ${response.status}`);
    const body = await response.json();
    if (mode === "reverse") {
      const result = normalize(body);
      if (/^[A-Z]{2}$/.test(requestedCountryCode) && result.countryCode !== requestedCountryCode) {
        return NextResponse.json({ message: `Choose a location within ${requestedCountryCode === "IN" ? "India" : requestedCountryCode}.` }, { status: 422 });
      }
      return NextResponse.json({ result });
    }
    return NextResponse.json({ results: (Array.isArray(body) ? body : []).map(normalize) });
  } catch {
    return NextResponse.json({ message: "Location lookup is temporarily unavailable." }, { status: 502 });
  }
}

const toAndroidCallback = (params: URLSearchParams) => {
  const query = params.toString();
  return `intent://callback?${query}#Intent;package=com.obaol.app;scheme=signinwithapple;end`;
};

export async function POST(request: Request) {
  const form = await request.formData();
  const params = new URLSearchParams();
  for (const key of ["code", "id_token", "state", "user", "error"]) {
    const value = form.get(key);
    if (typeof value === "string" && value) params.set(key, value);
  }
  return Response.redirect(toAndroidCallback(params), 303);
}

export function GET(request: Request) {
  return Response.redirect(toAndroidCallback(new URL(request.url).searchParams), 302);
}

export async function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const publisher = client?.replace("ca-", "");
  const body = publisher ? `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n` : "# Configure NEXT_PUBLIC_ADSENSE_CLIENT após a aprovação do site.\n";
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}

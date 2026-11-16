// Used by the Docker HEALTHCHECK and the load balancer.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok", time: new Date().toISOString() });
}

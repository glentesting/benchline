export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.JOBBER_CLIENT_ID,
    redirect_uri: "https://benchline-eta.vercel.app/api/auth/callback",
    response_type: "code",
    prompt: "login",
  });

  return Response.redirect(
    `https://api.getjobber.com/api/oauth/authorize?${params.toString()}`
  );
}

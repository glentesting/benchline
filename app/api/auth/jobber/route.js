export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.JOBBER_CLIENT_ID,
    redirect_uri: "https://benchline.vercel.app/api/auth/callback",
    response_type: "code",
  });

  return Response.redirect(
    `https://api.getjobber.com/api/oauth/authorize?${params.toString()}`
  );
}

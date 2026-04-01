import { supabase } from "../../../../lib/supabase";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response("Missing authorization code", { status: 400 });
  }

  const tokenRes = await fetch("https://api.getjobber.com/api/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.JOBBER_CLIENT_ID,
      client_secret: process.env.JOBBER_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: "https://benchline-eta.vercel.app/api/auth/callback",
    }),
  });

  if (!tokenRes.ok) {
    return new Response("Failed to exchange authorization code", {
      status: 502,
    });
  }

  const token = await tokenRes.json();

  // Decode account_id from JWT payload
  const payload = JSON.parse(
    Buffer.from(token.access_token.split(".")[1], "base64").toString()
  );
  const accountId = String(payload.account_id);

  const { error } = await supabase.from("jobber_accounts").insert({
    jobber_account_id: accountId,
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    account_name: null,
  });

  if (error) {
    return new Response(`Failed to store account: ${error.message}`, {
      status: 500,
    });
  }

  return Response.redirect("https://benchline-eta.vercel.app/dashboard");
}

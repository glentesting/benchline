import { supabase } from "../../lib/supabase";

export default async function DashboardPage() {
  const { data: account } = await supabase
    .from("jobber_accounts")
    .select("access_token")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let accountName = "Unknown";

  if (account?.access_token) {
    const res = await fetch("https://api.getjobber.com/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${account.access_token}`,
        "X-JOBBER-GRAPHQL-VERSION": "2024-11-15",
      },
      body: JSON.stringify({ query: "{ account { name } }" }),
    });

    if (res.ok) {
      const json = await res.json();
      accountName = json.data?.account?.name || "Unknown";
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 py-16">
      <p className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-12">
        Benchline
      </p>
      <h1 className="text-3xl font-semibold text-gray-900 mb-4">
        Welcome to Benchline
      </h1>
      <p className="text-lg text-gray-600 mb-2">
        Connected Jobber account: <span className="font-medium text-gray-900">{accountName}</span>
      </p>
      <p className="text-gray-400 mt-8">Your dashboard is being built</p>
    </div>
  );
}

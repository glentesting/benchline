import { supabase } from "../../lib/supabase";

async function getJobberData() {
  const { data: accountData, error: dbError } = await supabase
    .from("jobber_accounts")
    .select("access_token")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (dbError || !accountData) {
    console.log("Supabase error:", dbError?.message);
    return null;
  }

  console.log("Got access token, length:", accountData.access_token?.length);

  const res = await fetch("https://api.getjobber.com/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accountData.access_token}`,
      "X-JOBBER-GRAPHQL-VERSION": "2024-11-15",
    },
    body: JSON.stringify({
      query: `query { account { name } }`,
    }),
    cache: "no-store",
  });

  console.log("Jobber response status:", res.status);
  const text = await res.text();
  console.log("Jobber raw response:", text);

  try {
    const json = JSON.parse(text);
    return json.data;
  } catch (e) {
    console.log("Parse error:", e.message);
    return null;
  }
}

export default async function Dashboard() {
  const data = await getJobberData();

  const accountName = data?.account?.name || "Your Account";
  const quotes = data?.quotes?.nodes || [];
  const jobs = data?.jobs?.nodes || [];
  const invoices = data?.invoices?.nodes || [];

  const totalQuotes = quotes.length;
  const approvedQuotes = quotes.filter((q) => q.status === "approved").length;
  const closeRate = totalQuotes > 0 ? ((approvedQuotes / totalQuotes) * 100).toFixed(1) : "0.0";

  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.amounts?.total || 0), 0);
  const avgTicket = invoices.length > 0 ? (totalInvoiced / invoices.length).toFixed(0) : 0;

  const marginsArr = jobs
    .filter((j) => j.jobCosting?.totalRevenue > 0)
    .map((j) => ((j.jobCosting.totalRevenue - j.jobCosting.totalCost) / j.jobCosting.totalRevenue) * 100);
  const avgMargin = marginsArr.length > 0 ? (marginsArr.reduce((a, b) => a + b, 0) / marginsArr.length).toFixed(1) : "0.0";

  const now = new Date();
  const monthYear = now.toLocaleString("default", { month: "long", year: "numeric" });

  const metrics = [
    { id: "close", label: "Quote Close Rate", value: `${closeRate}%`, icon: "\ud83d\udccb", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", sub: "Industry avg: 55%" },
    { id: "ticket", label: "Avg Ticket Size", value: `$${Number(avgTicket).toLocaleString()}`, icon: "\ud83e\uddf6", color: "#d97706", bg: "#fffbeb", border: "#fde68a", sub: "Your 90-day avg" },
    { id: "tech", label: "Revenue / Tech", value: "$0", icon: "\ud83d\udc77", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", sub: "Coming soon" },
    { id: "callback", label: "Callback Rate", value: "0%", icon: "\ud83d\udd01", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", sub: "Coming soon" },
    { id: "margin", label: "Avg Job Margin", value: `${avgMargin}%`, icon: "\ud83d\udcc8", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc", sub: "Healthy: 30-50%" },
  ];

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #3b82f6, #6366f1)", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>{"\u26a1"}</div>
          <span style={{ fontWeight: "800", fontSize: "17px", color: "#0f172a" }}>Bench<span style={{ color: "#2563eb" }}>line</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>Synced live &middot; {accountName}</span>
        </div>
      </nav>

      {/* MAIN */}
      <div style={{ maxWidth: "1060px", margin: "0 auto", padding: "28px 24px" }}>

        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>{monthYear}</h1>
            <p style={{ fontSize: "13px", color: "#64748b" }}>{accountName}</p>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px 20px", textAlign: "right", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a" }}>${totalInvoiced.toLocaleString()}</div>
            <div style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600", marginTop: "2px" }}>Total Invoiced</div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>Monthly Revenue</div>
          </div>
        </div>

        {/* Metric Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "24px" }}>
          {metrics.map((m) => (
            <div key={m.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", borderTop: `3px solid ${m.color}`, cursor: "pointer" }}>
              <div style={{ fontSize: "20px", marginBottom: "10px" }}>{m.icon}</div>
              <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>{m.label}</div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>{m.value}</div>
              <div style={{ fontSize: "10px", color: "#94a3b8" }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", marginTop: "32px" }}>
          Benchline &middot; Built for Jobber users &middot; getbenchline.com
        </p>
      </div>
    </div>
  );
}

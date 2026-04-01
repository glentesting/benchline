import { supabase } from "../../lib/supabase";

async function getFreshToken() {
  const { data: accountData, error } = await supabase
    .from("jobber_accounts")
    .select("access_token, refresh_token, id")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !accountData) return null;

  // Try current token first with a test query
  const testRes = await fetch("https://api.getjobber.com/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accountData.access_token}`,
      "X-JOBBER-GRAPHQL-VERSION": "2025-04-16",
    },
    body: JSON.stringify({ query: `query { account { name } }` }),
    cache: "no-store",
  });

  const testJson = await testRes.json();

  // If token is valid return it
  if (testJson.data) {
    return accountData.access_token;
  }

  // Token expired — use refresh token to get new one
  console.log("Token expired, refreshing...");
  const refreshRes = await fetch("https://api.getjobber.com/api/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.JOBBER_CLIENT_ID,
      client_secret: process.env.JOBBER_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: accountData.refresh_token,
    }),
  });

  const refreshData = await refreshRes.json();

  if (!refreshData.access_token) {
    console.log("Refresh failed:", JSON.stringify(refreshData));
    return null;
  }

  // Store new tokens in Supabase
  await supabase
    .from("jobber_accounts")
    .update({
      access_token: refreshData.access_token,
      refresh_token: refreshData.refresh_token,
    })
    .eq("id", accountData.id);

  console.log("Token refreshed successfully");
  return refreshData.access_token;
}

async function getJobberData() {
  const token = await getFreshToken();
  if (!token) return null;

  const res = await fetch("https://api.getjobber.com/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "X-JOBBER-GRAPHQL-VERSION": "2025-04-16",
    },
    body: JSON.stringify({
      query: `query {
        account { name }
        quotes(first: 100) { nodes { quoteStatus amounts { total } } }
        jobs(first: 100) { nodes { jobCosting { totalRevenue totalCost } } }
        invoices(first: 100) { nodes { amounts { total } createdAt } }
      }`,
    }),
    cache: "no-store",
  });

  const json = await res.json();
  return json.data;
}

export default async function Dashboard() {
  let data = null;
  try {
    data = await getJobberData();
  } catch (e) {
    console.log("Dashboard error:", e.message);
  }

  const accountName = data?.account?.name || "Your Account";
  console.log("Account name:", accountName);
  const quotes = data?.quotes?.nodes || [];
  const jobs = data?.jobs?.nodes || [];
  const invoices = data?.invoices?.nodes || [];

  const totalQuotes = quotes.length;
  const approvedQuotes = quotes.filter((q) => q.quoteStatus === "APPROVED").length;
  const closeRate = totalQuotes > 0 ? ((approvedQuotes / totalQuotes) * 100).toFixed(1) : "0.0";

  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.amounts?.total || 0), 0);
  const avgTicket = invoices.length > 0 ? (totalInvoiced / invoices.length).toFixed(0) : 0;

  const marginsArr = jobs
    .filter((j) => j.jobCosting?.totalRevenue > 0)
    .map((j) => ((j.jobCosting.totalRevenue - j.jobCosting.totalCost) / j.jobCosting.totalRevenue) * 100);
  const avgMargin = marginsArr.length > 0 ? (marginsArr.reduce((a, b) => a + b, 0) / marginsArr.length).toFixed(1) : "0.0";

  const now = new Date();
  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("default", { month: "short" });
    const monthInvoices = invoices.filter((inv) => {
      const invDate = new Date(inv.createdAt);
      return invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear();
    });
    const total = monthInvoices.reduce((sum, inv) => sum + (inv.amounts?.total || 0), 0);
    monthlyRevenue.push({ label, total });
  }
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.total), 1);

  const monthYear = now.toLocaleString("default", { month: "long", year: "numeric" });

  const metrics = [
    { id: "close", label: "Quote Close Rate", value: `${closeRate}%`, icon: "\ud83d\udccb", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", sub: "Industry avg: 55%" },
    { id: "ticket", label: "Avg Ticket Size", value: `$${Number(avgTicket).toLocaleString()}`, icon: "\ud83e\uddf6", color: "#d97706", bg: "#fffbeb", border: "#fde68a", sub: "Your 90-day avg" },
    { id: "tech", label: "Revenue / Tech", value: "$0", icon: "\ud83d\udc77", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", sub: "Coming soon" },
    { id: "callback", label: "Callback Rate", value: "0%", icon: "\ud83d\udd01", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", sub: "Coming soon" },
    { id: "margin", label: "Avg Job Margin", value: `${avgMargin}%`, icon: "\ud83d\udcc8", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc", sub: "Healthy: 30-50%" },
  ];

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #2563eb, #6366f1)", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 32 22" fill="none">
              <rect x="2" y="9" width="28" height="4" rx="2" fill="white" opacity="0.9"/>
              <rect x="5" y="13" width="3" height="8" rx="1.5" fill="white" opacity="0.9"/>
              <rect x="24" y="13" width="3" height="8" rx="1.5" fill="white" opacity="0.9"/>
              <polyline points="6,8 12,4 18,6 26,1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="26" cy="1" r="2" fill="white"/>
            </svg>
          </div>
          <span style={{ fontWeight: "800", fontSize: "17px", color: "#0f172a", letterSpacing: "-0.03em" }}>
            Bench<span style={{ color: "#2563eb" }}>line</span>
          </span>
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

        {/* Revenue Chart */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <div style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a" }}>Revenue — Last 6 Months</div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>From Jobber invoices &middot; real time</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "130px" }}>
            {monthlyRevenue.map((m, i) => {
              const pct = (m.total / maxRevenue) * 100;
              const isLast = i === monthlyRevenue.length - 1;
              return (
                <div key={m.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%" }}>
                  <div style={{ fontSize: "11px", color: isLast ? "#0f172a" : "#94a3b8", fontWeight: isLast ? "700" : "400" }}>
                    {m.total > 0 ? `$${(m.total / 1000).toFixed(0)}k` : ""}
                  </div>
                  <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                    <div style={{ width: "100%", height: `${Math.max(pct, 2)}%`, background: isLast ? "linear-gradient(180deg, #2563eb, #6366f1)" : "#f1f5f9", borderRadius: "6px 6px 0 0", border: isLast ? "1px solid #bfdbfe" : "1px solid #e8ecf0", minHeight: "4px" }} />
                  </div>
                  <div style={{ fontSize: "11px", color: isLast ? "#2563eb" : "#94a3b8", fontWeight: isLast ? "600" : "400" }}>{m.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", marginTop: "32px" }}>
          Benchline &middot; Built for Jobber users &middot; getbenchline.com
        </p>
      </div>
    </div>
  );
}

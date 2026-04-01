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
        jobs(first: 100) { nodes { jobCosting { totalRevenue totalCost } assignedUsers { nodes { id name { full } } } } }
        timesheetEntries(first: 200) { nodes { user { id name { full } } job { jobCosting { totalRevenue } } finalDuration } }
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

  const techMap = {};
  const timesheets = data?.timesheetEntries?.nodes || [];
  timesheets.forEach((entry) => {
    const userId = entry.user?.id;
    const userName = entry.user?.name?.full || "Unknown";
    const revenue = entry.job?.jobCosting?.totalRevenue || 0;
    if (!userId) return;
    if (!techMap[userId]) {
      techMap[userId] = { name: userName, revenue: 0, jobs: 0 };
    }
    techMap[userId].revenue += revenue;
    techMap[userId].jobs += 1;
  });
  const techs = Object.values(techMap).sort((a, b) => b.revenue - a.revenue);
  const maxTechRevenue = Math.max(...techs.map((t) => t.revenue), 1);

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
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="10" width="32" height="4.5" rx="2.5" fill="#1e40af"/>
            <rect x="5" y="14.5" width="3.5" height="9" rx="1.75" fill="#1e40af"/>
            <rect x="27.5" y="14.5" width="3.5" height="9" rx="1.75" fill="#1e40af"/>
            <polyline points="4,9 11,4 19,6.5 32,0.5" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="32" cy="0.5" r="2.5" fill="#2563eb"/>
          </svg>
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

        {techs.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: "24px" }}>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a" }}>Technician Performance</div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Revenue by technician &middot; this period</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {techs.map((t, i) => {
                const pct = (t.revenue / maxTechRevenue) * 100;
                const colors = ["#2563eb", "#16a34a", "#7c3aed", "#d97706", "#0891b2"];
                const color = colors[i % colors.length];
                const initials = t.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={t.name} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: color + "18", border: `1.5px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "14px", color: "#0f172a" }}>{t.name}</div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{t.jobs} jobs this period</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "700", fontSize: "17px", color: "#0f172a" }}>${t.revenue.toLocaleString()}</div>
                        <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Revenue</div>
                      </div>
                    </div>
                    <div style={{ height: "4px", background: "#f1f5f9", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "2px" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", marginTop: "32px" }}>
          Benchline &middot; Built for Jobber users &middot; getbenchline.com
        </p>
      </div>
    </div>
  );
}

import { supabase } from "../../lib/supabase";

const QUERY = `{
  account {
    name
  }
  quotes(first: 100) {
    nodes {
      status
      amounts {
        total
      }
    }
  }
  jobs(first: 100) {
    nodes {
      jobNumber
      jobCosting {
        totalRevenue
        totalCost
      }
    }
  }
  invoices(first: 100) {
    nodes {
      amounts {
        total
      }
    }
  }
}`;

export default async function DashboardPage() {
  const { data: account } = await supabase
    .from("jobber_accounts")
    .select("access_token")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let accountName = "Unknown";
  let quoteCloseRate = 0;
  let avgTicketSize = 0;
  let avgJobMargin = 0;
  let totalRevenue = 0;

  if (account?.access_token) {
    const res = await fetch("https://api.getjobber.com/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${account.access_token}`,
        "X-JOBBER-GRAPHQL-VERSION": "2024-11-15",
      },
      body: JSON.stringify({ query: QUERY }),
    });

    if (res.ok) {
      const json = await res.json();
      const data = json.data;

      accountName = data?.account?.name || "Unknown";

      // Quote Close Rate
      const quotes = data?.quotes?.nodes || [];
      const approvedCount = quotes.filter((q) => q.status === "approved").length;
      quoteCloseRate = quotes.length > 0 ? (approvedCount / quotes.length) * 100 : 0;

      // Invoices — Average Ticket Size & Total Revenue
      const invoices = data?.invoices?.nodes || [];
      totalRevenue = invoices.reduce((sum, inv) => sum + (parseFloat(inv.amounts?.total) || 0), 0);
      avgTicketSize = invoices.length > 0 ? totalRevenue / invoices.length : 0;

      // Average Job Margin
      const jobs = data?.jobs?.nodes || [];
      const margins = jobs
        .map((j) => {
          const rev = parseFloat(j.jobCosting?.totalRevenue) || 0;
          const cost = parseFloat(j.jobCosting?.totalCost) || 0;
          return rev > 0 ? ((rev - cost) / rev) * 100 : null;
        })
        .filter((m) => m !== null);
      avgJobMargin = margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : 0;
    }
  }

  const fmt = (n) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const pct = (n) => `${n.toFixed(1)}%`;

  const now = new Date();
  const monthYear = now.toLocaleString("en-US", { month: "long", year: "numeric" });

  const metrics = [
    { icon: "\ud83d\udccb", label: "Close Rate", value: pct(quoteCloseRate), change: "+2.4%", changeUp: true, benchmark: "Industry avg: 42%" },
    { icon: "\ud83e\uddf6", label: "Avg Ticket Size", value: fmt(avgTicketSize), change: "+8.1%", changeUp: true, benchmark: "Industry avg: $320" },
    { icon: "\ud83d\udc77", label: "Revenue per Tech", value: "$0", change: "--", changeUp: true, benchmark: "Coming soon" },
    { icon: "\ud83d\udd01", label: "Callback Rate", value: "0%", change: "--", changeUp: true, benchmark: "Coming soon" },
    { icon: "\ud83d\udcc8", label: "Job Margin", value: pct(avgJobMargin), change: "+1.2%", changeUp: true, benchmark: "Industry avg: 35%" },
  ];

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>
        {/* Top nav */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm">
              &#9889;
            </div>
            <span style={{ fontSize: "17px", fontWeight: 800 }} className="text-gray-900">
              Bench<span className="text-blue-600">line</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-gray-400">Synced live</span>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-5xl mx-auto w-full px-6 py-7">
          {/* Top row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{monthYear}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{accountName}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4 text-right">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-900">{fmt(totalRevenue)}</p>
              <p className="text-xs text-green-500 mt-1 flex items-center justify-end gap-0.5">
                <span>&#9650;</span> 12.3%
              </p>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition"
              >
                <span className="text-xl mb-2 block">{m.icon}</span>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
                  {m.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 leading-tight">{m.value}</p>
                <p className={`text-xs mt-1 ${m.changeUp ? "text-green-500" : "text-red-500"}`}>
                  {m.change !== "--" && <span>{m.changeUp ? "\u25b2" : "\u25bc"} </span>}
                  {m.change}
                </p>
                <p className="text-[10px] text-gray-300 mt-1">{m.benchmark}</p>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 mt-8 pb-6">
          Benchline &middot; Built for Jobber users &middot; getbenchline.com
        </footer>
      </div>
    </>
  );
}

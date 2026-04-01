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

  const metrics = [
    { label: "Quote Close Rate", value: pct(quoteCloseRate), accent: "border-green-500", text: "text-gray-900" },
    { label: "Avg Ticket Size", value: fmt(avgTicketSize), accent: "border-blue-500", text: "text-gray-900" },
    { label: "Avg Job Margin", value: pct(avgJobMargin), accent: "border-purple-500", text: "text-gray-900" },
    { label: "Total Revenue", value: fmt(totalRevenue), accent: "border-gray-400", text: "text-gray-900" },
  ];

  const now = new Date();
  const monthYear = now.toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top navigation */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
        <p className="text-sm font-bold text-gray-900 tracking-wide">
          &#9889; BENCHLINE
        </p>
        <p className="text-sm text-gray-400">{accountName}</p>
      </header>

      {/* Main content */}
      <main className="flex-1 px-8 py-8 max-w-6xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {monthYear}
        </h1>
        <p className="text-sm text-gray-400 mb-10 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Connected to Jobber &middot; Live data
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {metrics.map((m) => (
            <div
              key={m.label}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 border-t-2 ${m.accent} p-6`}
            >
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-3">
                {m.label}
              </p>
              <p className={`text-[32px] font-bold leading-tight ${m.text}`}>{m.value}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-5">
        <p className="text-xs text-gray-300 text-center">
          Benchline &middot; Built for Jobber users
        </p>
      </footer>
    </div>
  );
}

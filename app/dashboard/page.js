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
    { label: "Quote Close Rate", value: pct(quoteCloseRate), bg: "bg-green-50", text: "text-green-700", border: "border-green-100" },
    { label: "Avg Ticket Size", value: fmt(avgTicketSize), bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
    { label: "Avg Job Margin", value: pct(avgJobMargin), bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100" },
    { label: "Total Revenue", value: fmt(totalRevenue), bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <p className="text-xs font-bold tracking-[0.25em] text-gray-400 uppercase">
          Benchline
        </p>
        <p className="text-sm text-gray-500">{accountName}</p>
      </header>

      {/* Main content */}
      <main className="flex-1 px-8 py-12 max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-semibold text-gray-900 mb-10">
          January 2026
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {metrics.map((m) => (
            <div
              key={m.label}
              className={`rounded-xl border ${m.border} ${m.bg} p-6`}
            >
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                {m.label}
              </p>
              <p className={`text-3xl font-bold ${m.text}`}>{m.value}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-5 border-t border-gray-100">
        <p className="text-xs text-gray-300 text-center">
          Connected to Jobber &middot; Live data
        </p>
      </footer>
    </div>
  );
}

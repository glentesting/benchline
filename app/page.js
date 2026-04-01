import Link from "next/link";

export default function Home() {
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#fff", color: "#0f172a" }}>

      {/* NAV */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #3b82f6, #6366f1)", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>{"\u26a1"}</div>
          <span style={{ fontWeight: "800", fontSize: "17px", color: "#0f172a" }}>Bench<span style={{ color: "#2563eb" }}>line</span></span>
        </div>
        <a href="/api/auth/jobber" style={{ background: "#2563eb", color: "#fff", padding: "9px 20px", borderRadius: "9px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
          Connect Jobber {"\u2192"}
        </a>
      </nav>

      {/* HERO */}
      <div style={{ padding: "80px 24px 72px", textAlign: "center", borderBottom: "1px solid #e2e8f0", background: "radial-gradient(ellipse at top, #eff6ff 0%, #fff 70%)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "20px", padding: "5px 14px", fontSize: "12px", fontWeight: "600", color: "#2563eb", marginBottom: "28px" }}>
          {"\u26a1"} Built for Jobber users
        </div>
        <h1 style={{ fontSize: "52px", fontWeight: "800", color: "#0f172a", lineHeight: "1.12", marginBottom: "22px", maxWidth: "660px", margin: "0 auto 22px" }}>
          Your Jobber data.<br />
          <span style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Finally making sense.</span>
        </h1>
        <p style={{ fontSize: "18px", color: "#64748b", maxWidth: "500px", margin: "0 auto 38px", lineHeight: "1.7" }}>
          Benchline connects to Jobber and shows you the 5 numbers every home service business owner needs — close rate, average ticket, revenue per tech, callback rate, and job margin. In plain English.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <a href="/api/auth/jobber" style={{ background: "#2563eb", color: "#fff", padding: "14px 30px", borderRadius: "10px", fontSize: "15px", fontWeight: "600", textDecoration: "none", boxShadow: "0 4px 16px rgba(37,99,235,0.3)" }}>
            Connect Jobber — Free
          </a>
          <a href="/dashboard" style={{ background: "#f8fafc", color: "#334155", padding: "14px 24px", borderRadius: "10px", fontSize: "15px", fontWeight: "500", textDecoration: "none", border: "1px solid #e2e8f0" }}>
            See Demo {"\u2192"}
          </a>
        </div>
        <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "16px" }}>No credit card {"\u00b7"} 60-second setup {"\u00b7"} Works with any Jobber plan</p>
      </div>

      {/* PREVIEW STRIP */}
      <div style={{ background: "#f1f5f9", padding: "52px 24px", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: "880px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>What you get</div>
            <h2 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a" }}>Your numbers. One screen.</h2>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 8px 32px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", paddingBottom: "14px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "22px", height: "22px", background: "linear-gradient(135deg, #3b82f6, #6366f1)", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>{"\u26a1"}</div>
                <span style={{ fontWeight: "800", fontSize: "14px" }}>Bench<span style={{ color: "#2563eb" }}>line</span></span>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>{"\u00b7"} Swindell HVAC & Plumbing {"\u00b7"} January 2026</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Live from Jobber</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
              {[
                { label: "Quote Close Rate", value: "64%", change: "\u2191 +8%", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: "\ud83d\udccb" },
                { label: "Avg Ticket Size", value: "$387", change: "\u2193 -$22", color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "\ud83e\uddf6" },
                { label: "Revenue / Tech", value: "$4,820", change: "\u2191 +$340", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", icon: "\ud83d\udc77" },
                { label: "Callback Rate", value: "4.2%", change: "\u2193 -1.1%", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", icon: "\ud83d\udd01" },
                { label: "Avg Job Margin", value: "38%", change: "\u2191 +3%", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc", icon: "\ud83d\udcc8" },
              ].map((m) => (
                <div key={m.label} style={{ background: m.bg, border: `1px solid ${m.border}`, borderRadius: "10px", padding: "14px 12px" }}>
                  <div style={{ fontSize: "16px", marginBottom: "6px" }}>{m.icon}</div>
                  <div style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>{m.label}</div>
                  <div style={{ fontSize: "22px", fontWeight: "800", color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px" }}>{m.change}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ padding: "68px 24px", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>5 numbers. That's it.</h2>
            <p style={{ fontSize: "16px", color: "#64748b", maxWidth: "420px", margin: "0 auto" }}>We don't overwhelm you with 50 charts. Just the 5 things that actually move your business.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px" }}>
            {[
              { icon: "\ud83d\udccb", title: "Quote Close Rate", desc: "See exactly which quotes are winning and which are dying \u2014 and why." },
              { icon: "\ud83d\udcb5", title: "Average Ticket Size", desc: "Know if your pricing is drifting. Catch low-ticket jobs before they become a pattern." },
              { icon: "\ud83d\udc77", title: "Revenue Per Tech", desc: "See your top performer and who needs a coaching conversation \u2014 instantly." },
              { icon: "\ud83d\udd01", title: "Callback Rate", desc: "Track return visits so quality problems surface before customers complain." },
              { icon: "\ud83d\udcc8", title: "Job Profit Margin", desc: "Know which service types make you money and which ones are eating it." },
            ].map((f) => (
              <div key={f.title} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "22px" }}>
                <div style={{ fontSize: "26px", marginBottom: "12px" }}>{f.icon}</div>
                <div style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a", marginBottom: "7px" }}>{f.title}</div>
                <div style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.65" }}>{f.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "linear-gradient(135deg, #eff6ff, #f5f3ff)", border: "1px solid #bfdbfe", borderRadius: "12px", padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "32px" }}>{"\ud83d\udce7"}</span>
              <div>
                <div style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a", marginBottom: "4px" }}>Weekly Email Digest</div>
                <div style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.65" }}>Every Monday morning, your 5 numbers in your inbox. No login required.</div>
              </div>
            </div>
            <span style={{ background: "#2563eb", color: "#fff", fontSize: "11px", fontWeight: "700", padding: "5px 12px", borderRadius: "20px", whiteSpace: "nowrap" }}>Included in Pro</span>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ padding: "68px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "30px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>Works with Jobber. Takes 60 seconds.</h2>
          <p style={{ fontSize: "15px", color: "#64748b", marginBottom: "44px" }}>Your numbers are already in Jobber. Benchline just surfaces them.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", textAlign: "left" }}>
            {[
              { step: "1", title: "Connect Jobber", desc: "Click Connect and authorize Benchline to read your Jobber account. 30 seconds." },
              { step: "2", title: "We do the math", desc: "Benchline reads your quotes, jobs, invoices, and timesheets and calculates your 5 metrics." },
              { step: "3", title: "Know your numbers", desc: "Your dashboard is ready instantly. No setup, no spreadsheets, no manual entry. Ever." },
            ].map((s) => (
              <div key={s.step} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
                <div style={{ width: "30px", height: "30px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "13px", color: "#2563eb", marginBottom: "12px" }}>{s.step}</div>
                <div style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a", marginBottom: "6px" }}>{s.title}</div>
                <div style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.65" }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div style={{ padding: "68px 24px" }}>
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "42px" }}>
            <h2 style={{ fontSize: "30px", fontWeight: "800", color: "#0f172a", marginBottom: "10px" }}>Simple pricing</h2>
            <p style={{ fontSize: "15px", color: "#64748b" }}>Less than a service call. Way more valuable.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", alignItems: "start" }}>
            {[
              { name: "FREE", price: "$0", sub: "forever", cta: "Get Started", highlight: false, features: ["Current month only", "3 core metrics", "Dashboard access", "Jobber sync"] },
              { name: "PRO", price: "$49", sub: "/ month", cta: "Start Free Trial", highlight: true, features: ["All 5 metrics", "12-month history", "Tech leaderboard", "Weekly email digest", "Trend alerts"] },
              { name: "TEAM", price: "$79", sub: "/ month", cta: "Start Free Trial", highlight: false, features: ["Everything in Pro", "Industry benchmarks", "Slack & SMS alerts", "Up to 10 techs", "Priority support"] },
            ].map((p) => (
              <div key={p.name} style={{ background: p.highlight ? "#1e40af" : "#f8fafc", border: p.highlight ? "none" : "1px solid #e2e8f0", borderRadius: "16px", padding: "28px 24px", position: "relative", boxShadow: p.highlight ? "0 12px 32px rgba(30,64,175,0.2)" : "none", transform: p.highlight ? "scale(1.02)" : "none" }}>
                {p.highlight && <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "#2563eb", color: "#fff", fontSize: "10px", fontWeight: "700", padding: "4px 12px", borderRadius: "10px", letterSpacing: "0.06em", whiteSpace: "nowrap", border: "2px solid #fff" }}>MOST POPULAR</div>}
                <div style={{ fontSize: "11px", fontWeight: "700", color: p.highlight ? "#bfdbfe" : "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "22px" }}>
                  <span style={{ fontSize: "40px", fontWeight: "800", color: p.highlight ? "#fff" : "#0f172a", lineHeight: 1 }}>{p.price}</span>
                  <span style={{ fontSize: "13px", color: p.highlight ? "#93c5fd" : "#94a3b8" }}>{p.sub}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "26px" }}>
                  {p.features.map((f) => (
                    <div key={f} style={{ display: "flex", gap: "9px", alignItems: "flex-start", fontSize: "13px", color: p.highlight ? "#dbeafe" : "#475569" }}>
                      <span style={{ color: p.highlight ? "#60a5fa" : "#2563eb", fontWeight: "700", flexShrink: 0 }}>{"\u2713"}</span> {f}
                    </div>
                  ))}
                </div>
                <a href="/api/auth/jobber" style={{ display: "block", width: "100%", padding: "11px", borderRadius: "9px", fontSize: "13px", fontWeight: "700", background: p.highlight ? "#fff" : "#2563eb", color: p.highlight ? "#1e40af" : "#fff", textDecoration: "none", textAlign: "center" }}>
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", marginTop: "24px" }}>14-day free trial on all paid plans {"\u00b7"} No credit card required {"\u00b7"} Cancel anytime</p>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background: "#0f172a", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
          <div style={{ width: "22px", height: "22px", background: "linear-gradient(135deg, #3b82f6, #6366f1)", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>{"\u26a1"}</div>
          <span style={{ fontWeight: "800", fontSize: "15px", color: "#fff" }}>Bench<span style={{ color: "#60a5fa" }}>line</span></span>
        </div>
        <p style={{ fontSize: "12px", color: "#475569" }}>getbenchline.com {"\u00b7"} Built for Jobber users {"\u00b7"} Not affiliated with Jobber Inc.</p>
      </div>

    </div>
  );
}

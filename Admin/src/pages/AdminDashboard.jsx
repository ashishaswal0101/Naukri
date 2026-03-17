import { useEffect, useMemo, useState } from "react";
import {
  LuActivity,
  LuBriefcase,
  LuBuilding2,
  LuChevronRight,
  LuCircleAlert,
  LuDot,
  LuFileCheck2,
  LuSettings2,
  LuShieldCheck,
  LuUsers,
} from "react-icons/lu";
import { Link } from "react-router-dom";
import { getDashboardData } from "../services/adminApi";

const iconMap = {
  activity: LuActivity,
  applications: LuFileCheck2,
  briefcase: LuBriefcase,
  building: LuBuilding2,
  settings: LuSettings2,
  shield: LuShieldCheck,
  users: LuUsers,
};

const kpiConfig = [
  {
    title: "Total Clients",
    key: "totalClients",
    changeKey: "activeUsers",
    changeLabel: "active users",
    detail: "Visible companies across the Admin portfolio",
    tone: "from-[#0f6ae6] to-[#1481ff]",
    icon: LuBuilding2,
  },
  {
    title: "Total Job Postings",
    key: "totalJobs",
    changeKey: "policyModules",
    changeLabel: "policy modules",
    detail: "Live job volume visible to Admin operations",
    tone: "from-[#17b26a] to-[#84cc16]",
    icon: LuBriefcase,
  },
  {
    title: "Total Candidates",
    key: "totalCandidates",
    changeKey: "pendingInvites",
    changeLabel: "pending invites",
    detail: "Candidate profiles available for platform oversight",
    tone: "from-[#6d28d9] to-[#8b5cf6]",
    icon: LuUsers,
  },
  {
    title: "Total Applications",
    key: "totalApplications",
    changeKey: "restrictedUsers",
    changeLabel: "restricted accounts",
    detail: "Applications tracked across current Admin visibility",
    tone: "from-[#f59e0b] to-[#f97316]",
    icon: LuFileCheck2,
  },
  {
    title: "Over-limit Clients",
    key: "overLimitClients",
    changeKey: "totalClients",
    changeLabel: "total clients",
    detail: "Clients with active job postings above package limits",
    tone: "from-[#dc2626] to-[#f97316]",
    icon: LuCircleAlert,
  },
];

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getDashboardData();

        if (isMounted) {
          setDashboard(response.data);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || "Unable to load dashboard.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const kpis = useMemo(() => {
    if (!dashboard?.summary) {
      return [];
    }

    return kpiConfig.map((item) => ({
      ...item,
      value: dashboard.summary[item.key] ?? 0,
      change: `${dashboard.summary[item.changeKey] ?? 0} ${item.changeLabel}`,
    }));
  }, [dashboard]);

  if (isLoading) {
    return <PageState title="Loading Admin dashboard..." />;
  }

  if (error) {
    return <PageState title={error} error />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {kpis.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className="group flex min-h-[220px] flex-col justify-between rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-1 hover:border-lime-300 hover:shadow-[0_22px_55px_rgba(132,204,22,0.16)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-500">
                    {item.title}
                  </p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {item.value}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.tone} text-white shadow-sm transition-transform duration-200 group-hover:scale-105`}
                >
                  <Icon size={20} />
                </div>
              </div>
              <div className="mt-5 space-y-2">
                <p className="text-sm font-semibold text-emerald-600">
                  {item.change}
                </p>
                <p className="text-sm leading-6 text-slate-500">{item.detail}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Role-based views
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Separated operational access across every stakeholder panel
            </h2>
          </div>

          <div
            className="mt-6 grid gap-4"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            {dashboard.roleViews.map((item) => (
              <div
                key={item.role}
                className="group flex min-h-[188px] flex-col justify-between rounded-[22px] border border-slate-200 bg-slate-50 p-5 transition-all duration-200 hover:border-lime-300 hover:bg-lime-50/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    {item.label}
                  </h3>
                  <span className="rounded-full bg-[#163060]/8 px-3 py-1 text-xs font-semibold text-[#163060] transition-colors duration-200 group-hover:bg-lime-100 group-hover:text-lime-800">
                    {item.status}
                  </span>
                </div>
                <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">
                  {item.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Chip label={`${item.activeUsers} active users`} />
                  <Chip label={item.coverage} tone="lime" />
                </div>
              </div>
            ))}
          </div>
        </article>

        <div>
          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Governance controls
            </p>
            <div className="mt-5 space-y-4">
              {dashboard.governanceCards.map((item) => {
                const Icon = iconMap[item.iconKey] || LuActivity;

                return (
                  <div
                    key={item.title}
                    className="group rounded-[20px] border border-slate-200 p-4 transition-all duration-200 hover:border-lime-300 hover:bg-lime-50/30"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-500">
                          {item.title}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                          {item.value}
                        </p>
                      </div>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-[#163060] transition-colors duration-200 group-hover:bg-lime-100 group-hover:text-lime-800">
                        <Icon size={18} />
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {item.note}
                    </p>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                System-wide visibility
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Full oversight of clients, job postings, candidates, and applications
              </h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Live portfolio view
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-[22px] border border-slate-200">
            <div className="grid grid-cols-[1.4fr_0.7fr_0.8fr_0.9fr] gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              <span>Client company</span>
              <span>Jobs</span>
              <span>Candidates</span>
              <span>Status</span>
            </div>
            <div className="divide-y divide-slate-200">
              {dashboard.oversightFeeds.map((item) => (
                <div
                  key={item.company}
                  className="grid min-h-[74px] grid-cols-[1.4fr_0.7fr_0.8fr_0.9fr] items-center gap-3 px-4 py-4 text-sm text-slate-700 transition-colors duration-200 hover:bg-lime-50/40"
                >
                  <span className="font-semibold text-slate-900">
                    {item.company}
                  </span>
                  <span className="font-medium text-slate-700">{item.jobs}</span>
                  <span className="font-medium text-slate-700">
                    {item.candidates}
                  </span>
                  <span>
                    <StatusBadge label={item.status} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Platform signals
          </p>
          <div className="mt-5 space-y-4">
            {dashboard.platformSignals.map((signal) => (
              <div
                key={signal.label}
                className="rounded-2xl px-1 py-1 transition-colors duration-200 hover:bg-lime-50/40"
              >
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-slate-700">
                    {signal.label}
                  </span>
                  <span className="text-slate-500">{signal.value}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${signal.tone}`}
                    style={{ width: `${signal.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3">
            {dashboard.dashboardHighlights.map((item) => {
              const Icon = iconMap[item.iconKey] || LuActivity;

              return (
                <div
                  key={item.title}
                  className="group rounded-[20px] border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:border-lime-300 hover:bg-lime-50/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#163060] shadow-sm transition-colors duration-200 group-hover:bg-lime-100 group-hover:text-lime-800">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-500">
                        {item.title}
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {item.note}
                  </p>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-2">
            <LuCircleAlert size={16} className="text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">
              Recent monitoring and governance activity
            </h2>
          </div>
          <div className="mt-5 space-y-4">
            {dashboard.activityTimeline.length ? (
              dashboard.activityTimeline.map((item, index) => {
                const Icon = iconMap[item.iconKey] || LuActivity;

                return (
                  <div
                    key={`${item.title}-${index}`}
                    className="flex gap-4 rounded-2xl px-1 py-1 transition-colors duration-200 hover:bg-lime-50/40"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-[#163060]">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                      <p className="text-sm font-semibold leading-6 text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{item.time}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                No monitoring or governance activity logged yet.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Reporting overview
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Reporting and performance snapshot
              </h2>
            </div>
            <Link
              to="/admin/reports"
              className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold text-[#163060] transition-colors duration-200 hover:bg-lime-50 hover:text-lime-700"
            >
              Open reports
              <LuChevronRight size={16} />
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {dashboard.reportingHighlights.map((item) => (
              <div
                key={item.title}
                className="group flex min-h-[205px] flex-col justify-between rounded-[22px] border border-slate-200 bg-slate-50 p-5 transition-all duration-200 hover:border-lime-300 hover:bg-lime-50/40"
              >
                <p className="text-sm font-semibold text-slate-500">
                  {item.title}
                </p>
                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {item.value}
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  {item.delta}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] bg-slate-50 p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:justify-between">
              <div className="flex-1 rounded-[22px] border border-transparent p-3 transition-colors duration-200 hover:border-lime-300/60 hover:bg-white/60">
                <p className="text-sm font-semibold text-slate-500">
                  Executive summary
                </p>
                <p className="mt-3 max-w-3xl text-[clamp(1.45rem,2vw,2rem)] font-bold leading-[1.35] text-slate-900">
                  {dashboard.executiveSummary.text}
                </p>
              </div>
              <div className="flex min-h-[132px] min-w-[220px] flex-col justify-center rounded-[24px] border border-slate-200 bg-white px-6 py-5 text-center shadow-sm transition-all duration-200 hover:border-lime-300 hover:shadow-[0_18px_45px_rgba(132,204,22,0.14)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">
                  Confidence
                </p>
                <p className="mt-3 text-4xl font-bold leading-none text-[#163060]">
                  {dashboard.executiveSummary.confidence}
                </p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

function PageState({ title, error = false }) {
  return (
    <div className="mx-auto flex min-h-[420px] w-full max-w-7xl items-center justify-center">
      <div
        className={`rounded-[28px] border px-8 py-7 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] ${
          error ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-white"
        }`}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
          Admin Dashboard
        </p>
        <p className="mt-3 text-lg font-semibold text-slate-900">{title}</p>
      </div>
    </div>
  );
}

function Chip({ label, tone = "slate" }) {
  const toneClass =
    tone === "lime"
      ? "bg-lime-100/80 text-lime-800"
      : "bg-slate-100 text-slate-600";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {label}
    </span>
  );
}

function StatusBadge({ label }) {
  const toneClass =
    label === "Operational"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-rose-50 text-rose-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}
    >
      <LuDot size={18} className="-ml-1" />
      {label}
    </span>
  );
}

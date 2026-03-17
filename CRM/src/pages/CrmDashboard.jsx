import { useEffect, useMemo, useState } from "react";
import {
  LuBellRing,
  LuBriefcaseBusiness,
  LuBuilding2,
  LuQrCode,
  LuShieldCheck,
} from "react-icons/lu";
import {
  Badge,
  EmptyState,
  MetricCard,
  PageState,
  PanelCard,
  SectionHeading,
} from "../components/Ui";
import { getDashboardData } from "../services/crmApi";
import { formatDateTime, formatNumber, titleCase } from "../utils/formatters";

const metricConfig = [
  {
    label: "Client accounts",
    key: "totalClients",
    detail: "Managed client and company records across the CRM workspace.",
    icon: LuBuilding2,
    tone: "blue",
  },
  {
    label: "Job postings",
    key: "totalJobs",
    detail: "Published and client-submitted roles visible to CRM operations.",
    icon: LuBriefcaseBusiness,
    tone: "lime",
  },
  {
    label: "Pending approvals",
    key: "pendingApprovals",
    detail: "Client-created openings waiting for CRM review and release.",
    icon: LuShieldCheck,
    tone: "amber",
  },
  {
    label: "QR-enabled clients",
    key: "qrCodes",
    detail: "Distinct client companies with at least one active QR kit configured.",
    icon: LuQrCode,
    tone: "emerald",
  },
];

export default function CrmDashboard() {
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
          setError(requestError.message || "Unable to load CRM dashboard.");
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

  const metrics = useMemo(() => {
    if (!dashboard?.summary) {
      return [];
    }

    return metricConfig.map((item) => ({
      ...item,
      value: formatNumber(dashboard.summary[item.key]),
    }));
  }, [dashboard]);

  if (isLoading) {
    return <PageState title="Loading CRM dashboard..." />;
  }

  if (error) {
    return <PageState title={error} error />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const { key: metricKey, ...metricProps } = metric;
          return <MetricCard key={metricKey || metric.label} {...metricProps} />;
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <PanelCard>
          <SectionHeading
            eyebrow="Operational readiness"
            title="Package and client delivery posture"
            description="Track package commitments, live capacity, and company-level activity from one operational board."
          />

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {dashboard.packageCards.map((pkg) => (
              <div
                key={pkg.name}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:border-lime-300 hover:bg-lime-50/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    {titleCase(pkg.name)}
                  </h3>
                  <Badge tone="lime">{pkg.jobLimit} posts</Badge>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  {pkg.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
            <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.6fr] gap-3 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              <span>Client company</span>
              <span>Package</span>
              <span>Jobs</span>
              <span>Status</span>
            </div>
            {dashboard.clientOverview.length ? (
              dashboard.clientOverview.map((client) => (
                <div
                  key={client.name}
                  className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.6fr] gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600 transition hover:bg-lime-50/30"
                >
                  <div className="font-semibold text-slate-900">{client.name}</div>
                  <div>{titleCase(client.packageType)}</div>
                  <div>
                    {client.activeJobCount}/{client.jobLimit} live
                  </div>
                  <div>
                    <Badge tone={client.status === "ACTIVE" ? "emerald" : "rose"}>
                      {titleCase(client.status)}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6">
                <EmptyState
                  title="No client accounts yet"
                  description="Once CRM adds company records, package coverage and job usage will show here."
                />
              </div>
            )}
          </div>
        </PanelCard>

        <PanelCard>
          <SectionHeading
            eyebrow="CRM outputs"
            title="Campaign and QR activity"
            description="Recent QR deliveries and outbound promotions issued by CRM."
          />

          <div className="mt-6 space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Campaigns sent
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {formatNumber(dashboard.summary.campaigns)}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#163060] to-[#2856a6] text-white">
                  <LuBellRing size={20} />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    QR codes generated
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {formatNumber(dashboard.summary.qrCodeRecords)}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-lime-500 text-white">
                  <LuQrCode size={20} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {dashboard.qrOverview.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="rounded-[20px] border border-slate-200 p-4 transition hover:border-lime-300 hover:bg-lime-50/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.companyName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.jobTitle}
                      </p>
                    </div>
                    <Badge tone="blue">{formatNumber(item.scans)} scans</Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {dashboard.campaignFeed.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="rounded-[20px] border border-slate-200 p-4 transition hover:border-lime-300 hover:bg-lime-50/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <Badge tone="lime">{titleCase(item.channel)}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {titleCase(item.audience)} reached:{" "}
                    {formatNumber(item.sentCount)}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {formatDateTime(item.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </PanelCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <PanelCard>
          <SectionHeading
            eyebrow="Approval queue"
            title="Client-created jobs awaiting CRM review"
            description="Review approvals, intervene quickly, and maintain package compliance before roles go live."
          />

          <div className="mt-6 space-y-3">
            {dashboard.jobApprovals.length ? (
              dashboard.jobApprovals.map((job) => (
                <div
                  key={job.id}
                  className="rounded-[20px] border border-slate-200 p-4 transition hover:border-lime-300 hover:bg-lime-50/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{job.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {job.companyName} {"\u2022"} {job.department || "General"}
                      </p>
                    </div>
                    <Badge
                      tone={job.approvalStatus === "PENDING" ? "amber" : "rose"}
                    >
                      {titleCase(job.approvalStatus)}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    {job.jobType || "Role"} {"\u2022"} {job.workplaceType || "Flexible"} {"\u2022"}{" "}
                    {job.location || "Location pending"}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                title="Approval queue is clear"
                description="Client-submitted openings pending review will appear here."
              />
            )}
          </div>
        </PanelCard>

        <PanelCard>
          <SectionHeading
            eyebrow="Application flow"
            title="Recent candidate activity"
            description="CRM can view end-to-end application movement across all client job pipelines."
          />

          <div className="mt-6 space-y-3">
            {dashboard.applicationFeed.length ? (
              dashboard.applicationFeed.map((application) => (
                <div
                  key={application.id}
                  className="rounded-[20px] border border-slate-200 p-4 transition hover:border-lime-300 hover:bg-lime-50/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {application.candidateName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {application.companyName} {"\u2022"} {application.jobTitle}
                      </p>
                    </div>
                    <Badge tone="blue">{titleCase(application.status)}</Badge>
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
                    Updated {formatDateTime(application.updatedAt)}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                title="No applications available"
                description="Candidate applications will appear here once the platform starts receiving submissions."
              />
            )}
          </div>
        </PanelCard>
      </section>
    </div>
  );
}

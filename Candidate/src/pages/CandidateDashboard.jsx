import { useEffect, useState } from "react";
import {
  LuBadgeCheck,
  LuBellRing,
  LuBriefcase,
  LuCircleUserRound,
  LuScrollText,
  LuSparkles,
} from "react-icons/lu";
import { Link } from "react-router-dom";
import {
  Badge,
  EmptyState,
  MetricCard,
  PageState,
  PanelCard,
  SectionHeading,
} from "../components/Ui";
import { formatDate, formatNumber, titleCase } from "../utils/formatters";
import { getDashboardData } from "../services/candidateApi";

export default function CandidateDashboard() {
  const [state, setState] = useState({
    loading: true,
    error: "",
    data: null,
  });

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const response = await getDashboardData();

        if (isMounted) {
          setState({
            loading: false,
            error: "",
            data: response.data,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            loading: false,
            error: error.message || "Unable to load dashboard.",
            data: null,
          });
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  if (state.loading) {
    return (
      <PageState
        title="Loading dashboard"
        description="Fetching candidate summary, recommended jobs, and recent updates."
      />
    );
  }

  if (state.error || !state.data) {
    return (
      <PageState
        title="Dashboard unavailable"
        description={state.error || "Unable to load candidate dashboard."}
        error
      />
    );
  }

  const {
    summary,
    profile,
    mappedCompany,
    recommendedJobs = [],
    recentApplications = [],
    notifications = [],
  } = state.data;

  const hasMappedContext = Boolean(mappedCompany);
  const mappedLocation = mappedCompany
    ? [mappedCompany.industry, mappedCompany.city || mappedCompany.region || "India"]
        .filter(Boolean)
        .join(" | ")
    : "";

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Applications"
          value={formatNumber(summary.totalApplications)}
          detail="All submitted roles visible in your candidate pipeline."
          icon={LuScrollText}
          tone="blue"
        />
        <MetricCard
          label="Shortlisted"
          value={formatNumber(summary.shortlisted)}
          detail="Applications moved beyond the initial review stage."
          icon={LuBadgeCheck}
          tone="emerald"
        />
        <MetricCard
          label="Interviews"
          value={formatNumber(summary.interviews)}
          detail="Roles currently in interview or advanced decision stages."
          icon={LuSparkles}
          tone="amber"
        />
        <MetricCard
          label="Companies Applied"
          value={formatNumber(summary.companiesApplied || 0)}
          detail="Unique companies where you have active applications."
          icon={LuBriefcase}
          tone="emerald"
        />
        <MetricCard
          label="Unread Alerts"
          value={formatNumber(summary.unreadAlerts)}
          detail="Campaigns, application changes, and profile reminders."
          icon={LuBellRing}
          tone="lime"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <PanelCard>
          <SectionHeading
            eyebrow="Profile Readiness"
            title="Keep your candidate profile application-ready"
            description="A complete profile reduces friction when you apply through future company QR journeys."
            action={<Badge tone="lime">{profile.profileCompletion}% complete</Badge>}
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">Current focus</p>
              <h3 className="mt-3 break-words text-xl font-bold text-slate-900">
                {profile.headline || "Add a strong headline to improve visibility"}
              </h3>
              <p className="mt-3 break-words text-sm leading-6 text-slate-600">
                {profile.summary || "Add a concise professional summary and preferred roles to strengthen application context."}
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">Resume status</p>
              <h3 className="mt-3 break-words text-xl font-bold text-slate-900">
                {profile.resume.fileName || "Resume not uploaded yet"}
              </h3>
              <p className="mt-3 break-words text-sm leading-6 text-slate-600">
                {profile.resume.url
                  ? `Stored via ${titleCase(profile.resume.storageProvider || "cloud storage")} and ready for applications.`
                  : "Upload your resume from the profile page before applying to any job."}
              </p>
              <Link
                to="/candidate/profile"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#163060] transition hover:text-lime-600"
              >
                Open profile
              </Link>
            </div>
          </div>
        </PanelCard>

        <PanelCard>
          <SectionHeading
            eyebrow="Mapped Company"
            title={mappedCompany?.name || "Latest hiring context"}
            description={
              mappedCompany
                ? mappedLocation
                : "No recent QR mapping found yet. Scan a company QR to see tailored jobs here."
            }
          />
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#163060] text-white">
                <LuCircleUserRound size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="break-words text-lg font-bold text-slate-900">{profile.user.name}</h3>
                <p className="mt-1 break-words text-sm text-slate-500">{profile.user.email}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 text-sm text-slate-600">
              {profile.preferredRoles.length ? (
                <p className="break-words">
                  <span className="font-semibold text-slate-900">Preferred roles:</span>{" "}
                  {profile.preferredRoles.join(", ")}
                </p>
              ) : null}
              {profile.preferredLocations.length ? (
                <p className="break-words">
                  <span className="font-semibold text-slate-900">Preferred locations:</span>{" "}
                  {profile.preferredLocations.join(", ")}
                </p>
              ) : null}
            </div>
          </div>
        </PanelCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <PanelCard>
          <SectionHeading
            eyebrow="Recommended Jobs"
            title={
              hasMappedContext
                ? "Apply to current openings from your latest hiring context"
                : "Recommended openings based on your profile"
            }
            description={
              hasMappedContext
                ? "Jobs are ranked from the most relevant mapped or profile-aligned opportunities."
                : "Scan a company QR to unlock hiring-context matches. Until then, recommendations follow your profile preferences."
            }
            action={
              <Badge tone={hasMappedContext ? "lime" : "slate"}>
                {hasMappedContext ? "QR matched" : "Profile matched"}
              </Badge>
            }
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {recommendedJobs.length ? (
              recommendedJobs.map((job) => (
                <article
                  key={job.id}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-lime-300 hover:bg-white hover:shadow-[0_20px_50px_rgba(132,204,22,0.12)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-bold text-slate-900">{job.title}</h3>
                      <p className="mt-2 break-words text-sm text-slate-500">
                        {job.companyName} | {job.location || "Location shared later"}
                      </p>
                    </div>
                    <Badge tone={job.hasApplied ? "emerald" : "blue"}>
                      {job.hasApplied ? job.applicationStatus : "Open"}
                    </Badge>
                  </div>
                  <p className="mt-4 break-words text-sm leading-6 text-slate-600">
                    {job.description || "Open role available from your current candidate context."}
                  </p>
                  <Link
                    to="/candidate/jobs"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#163060] transition hover:text-lime-600"
                  >
                    View job
                  </Link>
                </article>
              ))
            ) : (
              <EmptyState
                title="No recommended openings yet"
                description="Update your profile preferences or scan a company QR to receive tailored jobs."
              />
            )}
          </div>
        </PanelCard>

        <div className="space-y-6">
          <PanelCard>
            <SectionHeading
              eyebrow="Recent Applications"
              title="Pipeline updates"
              description="Your latest submitted roles and status movement."
            />

            <div className="mt-5 space-y-3">
              {recentApplications.length ? (
                recentApplications.map((application) => (
                  <div
                    key={application.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words font-semibold text-slate-900">{application.jobTitle}</p>
                        <p className="mt-1 break-words text-sm text-slate-500">
                          {application.companyName}
                        </p>
                      </div>
                      <Badge tone="emerald">{titleCase(application.status)}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Updated {application.lastUpdated}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No applications yet"
                  description="Your latest submitted roles will appear here once you apply."
                />
              )}
            </div>
          </PanelCard>

          <PanelCard>
            <SectionHeading
              eyebrow="Alerts"
              title="Latest candidate notifications"
              description="Application changes and campaign messages from the CRM team."
            />

            <div className="mt-5 space-y-3">
              {notifications.length ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="break-words font-semibold text-slate-900">{notification.title}</p>
                      <Badge tone={notification.status === "READ" ? "slate" : "lime"}>
                        {notification.status}
                      </Badge>
                    </div>
                    <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No alerts right now"
                  description="We will notify you here when your application status changes."
                />
              )}
            </div>
          </PanelCard>
        </div>
      </section>
    </div>
  );
}

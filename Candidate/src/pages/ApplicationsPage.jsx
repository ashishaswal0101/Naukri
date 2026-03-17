import { useEffect, useState } from "react";
import { LuBadgeCheck, LuCalendarClock, LuScrollText, LuSparkles } from "react-icons/lu";
import {
  MetricCard,
  PageState,
  PanelCard,
  SectionHeading,
  Badge,
} from "../components/Ui";
import { formatDate, formatNumber, titleCase } from "../utils/formatters";
import { getApplications } from "../services/candidateApi";

export default function ApplicationsPage() {
  const [state, setState] = useState({
    loading: true,
    error: "",
    data: [],
    recentlyUpdatedCount: 0,
  });

  useEffect(() => {
    let isMounted = true;

    const loadApplications = async () => {
      try {
        const response = await getApplications();
        const now = Date.now();
        const recentlyUpdatedCount = (response.data || []).filter((item) => {
          const updatedAt = new Date(item.updatedAt).getTime();
          return now - updatedAt < 7 * 24 * 60 * 60 * 1000;
        }).length;

        if (isMounted) {
          setState({
            loading: false,
            error: "",
            data: response.data,
            recentlyUpdatedCount,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            loading: false,
            error: error.message || "Unable to load applications.",
            data: [],
            recentlyUpdatedCount: 0,
          });
        }
      }
    };

    loadApplications();

    return () => {
      isMounted = false;
    };
  }, []);

  if (state.loading) {
    return (
      <PageState
        title="Loading applications"
        description="Fetching your full candidate application timeline."
      />
    );
  }

  if (state.error) {
    return (
      <PageState
        title="Applications unavailable"
        description={state.error}
        error
      />
    );
  }

  const applications = state.data;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        <MetricCard
          label="Submitted"
          value={formatNumber(applications.length)}
          detail="All applications visible to your candidate account."
          icon={LuScrollText}
          tone="blue"
        />
        <MetricCard
          label="Shortlisted"
          value={formatNumber(
            applications.filter((item) =>
              ["SHORTLISTED", "INTERVIEW", "OFFERED", "HIRED"].includes(item.status),
            ).length,
          )}
          detail="Applications that moved beyond initial review."
          icon={LuBadgeCheck}
          tone="emerald"
        />
        <MetricCard
          label="Interviews"
          value={formatNumber(
            applications.filter((item) =>
              ["INTERVIEW", "OFFERED", "HIRED"].includes(item.status),
            ).length,
          )}
          detail="Roles actively in interview or later stages."
          icon={LuSparkles}
          tone="amber"
        />
        <MetricCard
          label="Updated Recently"
          value={formatNumber(state.recentlyUpdatedCount)}
          detail="Applications updated in the last seven days."
          icon={LuCalendarClock}
          tone="lime"
        />
      </section>

      <PanelCard>
        <SectionHeading
          eyebrow="Application Timeline"
          title="Track every role you have applied to"
          description="Current status is maintained centrally and refreshed from operational updates."
        />

        <div className="mt-6 space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition-all duration-200 hover:border-lime-300 hover:bg-white"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {application.jobTitle}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {application.companyName}
                  </p>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                    <p>
                      <span className="font-semibold text-slate-900">Applied:</span>{" "}
                      {formatDate(application.appliedAt)}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Updated:</span>{" "}
                      {application.lastUpdated}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Resume:</span>{" "}
                      {application.resumeFileName || "Profile resume"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">QR source:</span>{" "}
                      {application.sourceQrToken || "Direct application"}
                    </p>
                  </div>
                </div>
                <Badge tone="emerald">{titleCase(application.status)}</Badge>
              </div>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );
}

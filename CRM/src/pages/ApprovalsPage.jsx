import { useEffect, useMemo, useState } from "react";
import { LuCircleX, LuClipboardCheck, LuSearch, LuShieldCheck } from "react-icons/lu";
import {
  Badge,
  EmptyState,
  MetricCard,
  ModalShell,
  PageState,
  PanelCard,
  SectionHeading,
  TextAreaField,
  ToolbarInput,
} from "../components/Ui";
import { getJobApprovals, updateJobApproval } from "../services/crmApi";
import { formatDateTime, formatNumber, titleCase } from "../utils/formatters";

export default function ApprovalsPage() {
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) =>
      [job.title, job.companyName, job.department, job.location]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase()),
    );
  }, [jobs, searchQuery]);

  const metrics = useMemo(() => {
    const pending = jobs.filter((job) => job.approvalStatus === "PENDING").length;
    const rejected = jobs.filter((job) => job.approvalStatus === "REJECTED").length;

    return [
      {
        label: "Approval queue",
        value: formatNumber(jobs.length),
        detail: "All client-originated jobs needing CRM intervention.",
        icon: LuShieldCheck,
        tone: "blue",
      },
      {
        label: "Pending jobs",
        value: formatNumber(pending),
        detail: "Fresh openings waiting for a CRM decision.",
        icon: LuClipboardCheck,
        tone: "amber",
      },
      {
        label: "Rejected jobs",
        value: formatNumber(rejected),
        detail: "Requests already returned to the client with feedback.",
        icon: LuCircleX,
        tone: "rose",
      },
    ];
  }, [jobs]);

  useEffect(() => {
    loadApprovals();
  }, []);

  async function loadApprovals() {
    setIsLoading(true);
    setPageError("");

    try {
      const response = await getJobApprovals();
      setJobs(response.data);
    } catch (requestError) {
      setPageError(requestError.message || "Unable to load approval queue.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleApprove = async (job) => {
    setActionError("");
    setIsSaving(true);

    try {
      await updateJobApproval(job.id, { decision: "APPROVE" });
      await loadApprovals();
    } catch (requestError) {
      setActionError(requestError.message || "Unable to approve job.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReject = async (event) => {
    event.preventDefault();
    setActionError("");
    setIsSaving(true);

    try {
      await updateJobApproval(selectedJob.id, {
        decision: "REJECT",
        rejectionReason,
      });
      await loadApprovals();
      setIsRejectModalOpen(false);
      setRejectionReason("");
      setSelectedJob(null);
    } catch (requestError) {
      setActionError(requestError.message || "Unable to reject job.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageState title="Loading approval queue..." />;
  }

  if (pageError) {
    return <PageState title={pageError} error />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <PanelCard>
        <SectionHeading
          eyebrow="Approval authority"
          title="Approve or reject job openings created by clients"
          description="Review queue items, validate package compliance, and return precise feedback where the client submission needs changes."
        />

        {actionError ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {actionError}
          </div>
        ) : null}

        <div className="mt-6 max-w-xl">
          <ToolbarInput
            icon={LuSearch}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search approval queue"
          />
        </div>

        <div className="mt-6 space-y-4">
          {filteredJobs.length ? (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-[24px] border border-slate-200 p-5 transition hover:border-lime-300 hover:bg-lime-50/30"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                      <Badge tone={job.approvalStatus === "PENDING" ? "amber" : "rose"}>
                        {titleCase(job.approvalStatus)}
                      </Badge>
                      <Badge tone="blue">{titleCase(job.createdBySource)}</Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                      {job.companyName} {"\u2022"} {job.department || "General"} {"\u2022"}{" "}
                      {job.location || "Location pending"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {job.jobType || "Role"} {"\u2022"} {job.workplaceType || "Flexible"} {"\u2022"}{" "}
                      {job.experience || "Experience open"}
                    </p>
                    {job.rejectionReason ? (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {job.rejectionReason}
                      </div>
                    ) : null}
                    <p className="text-xs text-slate-400">
                      Updated {formatDateTime(job.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleApprove(job)}
                      disabled={isSaving}
                      className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setRejectionReason(job.rejectionReason || "");
                        setIsRejectModalOpen(true);
                      }}
                      className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="No jobs in the approval queue"
              description="Pending or rejected client-created openings will show here for CRM review."
            />
          )}
        </div>
      </PanelCard>

      <ModalShell
        open={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject job submission"
        description={
          selectedJob
            ? `Provide the reason CRM is returning ${selectedJob.title} to ${selectedJob.companyName}.`
            : ""
        }
      >
        <form onSubmit={handleReject} className="space-y-5">
          <TextAreaField
            label="Rejection reason"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Explain the package, compliance, or content issue the client should correct."
            required
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-lime-300 hover:bg-lime-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Submitting..." : "Confirm rejection"}
            </button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}

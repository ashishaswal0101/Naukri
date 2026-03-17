import { useEffect, useState } from "react";
import { LuArrowRight, LuSearch, LuSparkles } from "react-icons/lu";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Badge,
  EmptyState,
  PageState,
  PanelCard,
  SectionHeading,
  ToolbarInput,
} from "../components/Ui";
import { formatDate, titleCase } from "../utils/formatters";
import {
  createApplication,
  getJobs,
  getSimilarJobs,
} from "../services/candidateApi";

export default function JobsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mappedToken = searchParams.get("token") || "";
  const focusedJobId = (searchParams.get("jobId") || "").trim();
  const [search, setSearch] = useState("");
  const [state, setState] = useState({
    loading: true,
    error: "",
    data: null,
  });
  const [feedback, setFeedback] = useState("");
  const [expandedJob, setExpandedJob] = useState("");
  const [similarJobs, setSimilarJobs] = useState({});
  const [similarStatus, setSimilarStatus] = useState({});
  const [activeApplyId, setActiveApplyId] = useState("");

  const loadJobs = async (nextSearch = search) => {
    try {
      setState((current) => ({ ...current, loading: true, error: "" }));
      const response = await getJobs({ token: mappedToken, search: nextSearch });
      setState({
        loading: false,
        error: "",
        data: response.data,
      });
    } catch (error) {
      setState({
        loading: false,
        error: error.message || "Unable to load jobs.",
        data: null,
      });
    }
  };

  useEffect(() => {
    loadJobs("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappedToken]);

  useEffect(() => {
    if (!focusedJobId || !state.data) return;

    const element = document.getElementById(`job-${focusedJobId}`);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusedJobId, state.data]);

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    await loadJobs(search);
  };

  const handleApply = async (jobId, sourceJobId = "") => {
    try {
      setActiveApplyId(jobId);
      setFeedback("");
      await createApplication({
        jobId,
        qrToken: mappedToken,
        sourceJobId,
      });
      setFeedback("Application submitted successfully.");
      await loadJobs(search);
    } catch (error) {
      setFeedback(error.message || "Unable to submit application.");
    } finally {
      setActiveApplyId("");
    }
  };

  const handleLoadSimilar = async (jobId) => {
    if (expandedJob === jobId) {
      setExpandedJob("");
      return;
    }

    setExpandedJob(jobId);

    if (similarJobs[jobId] && !similarStatus[jobId]?.error) {
      return;
    }

    try {
      setSimilarStatus((current) => ({
        ...current,
        [jobId]: { loading: true, error: "" },
      }));
      const response = await getSimilarJobs(jobId);
      setSimilarJobs((current) => ({
        ...current,
        [jobId]: response.data || [],
      }));
      setSimilarStatus((current) => ({
        ...current,
        [jobId]: { loading: false, error: "" },
      }));
    } catch (error) {
      setSimilarJobs((current) => ({
        ...current,
        [jobId]: [],
      }));
      setSimilarStatus((current) => ({
        ...current,
        [jobId]: {
          loading: false,
          error: error?.message || "Unable to load similar roles right now.",
        },
      }));
    }
  };

  if (state.loading && !state.data) {
    return (
      <PageState
        title="Loading jobs"
        description="Fetching mapped openings and application context."
      />
    );
  }

  if (state.error && !state.data) {
    return (
      <PageState
        title="Jobs unavailable"
        description={state.error}
        error
      />
    );
  }

  const jobs = state.data?.jobs || [];
  const company = state.data?.company;
  const visibleJobs = focusedJobId
    ? jobs.filter((job) => String(job.id) === focusedJobId)
    : jobs;

  const handleViewAll = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("jobId");
    const query = next.toString();
    navigate(`/candidate/jobs${query ? `?${query}` : ""}`, { replace: true });
  };

  return (
    <div className="space-y-6">
      <PanelCard>
        <SectionHeading
          eyebrow="Job Discovery"
          title={
            company
              ? `Mapped openings from ${company.name}`
              : "Browse active openings"
          }
          description={
            company
              ? `This view is scoped to the active QR mapping for ${company.name}.`
              : "Search all currently approved jobs available to candidate accounts."
          }
          action={
            company || focusedJobId ? (
              <div className="flex flex-wrap items-center gap-3">
                {company ? (
                  <Badge tone="lime">{company.industry || "Active company"}</Badge>
                ) : null}
                {focusedJobId ? (
                  <button
                    type="button"
                    onClick={handleViewAll}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-lime-300 hover:bg-lime-50 hover:text-[#163060]"
                  >
                    View all openings
                  </button>
                ) : null}
              </div>
            ) : null
          }
        />

        <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col gap-3 md:flex-row">
          <div className="flex-1">
            <ToolbarInput
              icon={LuSearch}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, department, or location"
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-[#163060] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d3f7f]"
          >
            Search jobs
          </button>
        </form>

        {feedback ? (
          <div className="mt-5 rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm font-medium text-lime-800">
            {feedback}
          </div>
        ) : null}
      </PanelCard>

      {visibleJobs.length ? (
        <div className="grid gap-5">
          {visibleJobs.map((job) => {
            const similarState = similarStatus[job.id] || {};
            const similarList = similarJobs[job.id] || [];
            const isSimilarLoading = Boolean(similarState.loading);
            const similarError = similarState.error;

            return (
              <PanelCard
                key={job.id}
                id={`job-${job.id}`}
                className={
                  focusedJobId && String(job.id) === focusedJobId
                    ? "overflow-hidden ring-2 ring-lime-200"
                    : "overflow-hidden"
                }
              >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="break-words text-2xl font-bold text-slate-900">{job.title}</h2>
                    <Badge tone={job.hasApplied ? "emerald" : "blue"}>
                      {job.hasApplied ? titleCase(job.applicationStatus) : "Open"}
                    </Badge>
                  </div>
                  <p className="mt-3 break-words text-sm text-slate-500">
                    {job.companyName} | {job.department} | {job.location || "Location shared later"}
                  </p>
                  <p className="mt-4 break-words text-sm leading-7 text-slate-600">
                    {job.description || "Role details are available in the application workflow."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(job.skills || []).map((skill) => (
                      <span
                        key={`${job.id}-${skill}`}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-slate-400">
                    {job.deadline ? `Apply by ${formatDate(job.deadline)}` : "No published deadline"}
                  </p>
                </div>

                <div className="flex min-w-[240px] flex-col gap-3">
                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={job.hasApplied || activeApplyId === job.id}
                    className="rounded-2xl bg-[#163060] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d3f7f] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {job.hasApplied
                      ? titleCase(job.applicationStatus)
                      : activeApplyId === job.id
                        ? "Submitting..."
                        : "Apply now"}
                  </button>
                  <button
                    onClick={() => handleLoadSimilar(job.id)}
                    disabled={isSimilarLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-lime-300 hover:bg-lime-50 hover:text-[#163060] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LuSparkles size={16} />
                    {isSimilarLoading ? "Loading similar roles" : "Similar roles"}
                  </button>
                </div>
              </div>

              {expandedJob === job.id ? (
                <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-2">
                    <LuSparkles size={16} className="text-lime-600" />
                    <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Similar job openings
                    </h3>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {isSimilarLoading ? (
                      <EmptyState
                        title="Loading similar jobs"
                        description="Finding related openings for you."
                      />
                    ) : similarError ? (
                      <EmptyState
                        title="Unable to load similar jobs"
                        description={similarError}
                      />
                    ) : similarList.length ? (
                      similarList.map((similarJob) => (
                        <div
                          key={similarJob.id}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="break-words font-semibold text-slate-900">
                                {similarJob.title}
                              </p>
                              <p className="mt-1 break-words text-sm text-slate-500">
                                {similarJob.companyName}
                              </p>
                            </div>
                            <Badge tone={similarJob.hasApplied ? "emerald" : "lime"}>
                              {similarJob.hasApplied
                                ? titleCase(similarJob.applicationStatus)
                                : "Available"}
                            </Badge>
                          </div>
                          <button
                            onClick={() => handleApply(similarJob.id, job.id)}
                            disabled={similarJob.hasApplied || activeApplyId === similarJob.id}
                            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#163060] transition hover:text-lime-600 disabled:cursor-not-allowed disabled:text-slate-400"
                          >
                            {activeApplyId === similarJob.id ? "Submitting..." : "Apply to similar job"}
                            <LuArrowRight size={15} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <EmptyState
                        title="No similar jobs found"
                        description="There are no additional related openings available right now."
                      />
                    )}
                  </div>
                </div>
              ) : null}
              </PanelCard>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={focusedJobId ? "Job not available" : "No jobs available"}
          description={
            focusedJobId
              ? "This job link is no longer active. View all openings to explore other roles."
              : "There are no active openings matching the current search or QR context."
          }
        />
      )}
    </div>
  );
}

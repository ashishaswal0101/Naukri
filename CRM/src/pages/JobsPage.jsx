import { useEffect, useMemo, useState } from "react";
import {
  LuBriefcaseBusiness,
  LuClipboardCheck,
  LuMapPin,
  LuPlus,
  LuSearch,
} from "react-icons/lu";
import {
  Badge,
  EmptyState,
  MetricCard,
  ModalShell,
  PageState,
  PanelCard,
  SectionHeading,
  SelectField,
  TextAreaField,
  TextField,
  ToolbarInput,
} from "../components/Ui";
import { createJob, getClients, getJobs, updateJob } from "../services/crmApi";
import { formatDate, formatNumber, titleCase } from "../utils/formatters";

const defaultJobForm = {
  companyId: "",
  title: "",
  summary: "",
  department: "",
  jobType: "",
  workplaceType: "",
  location: "",
  experience: "",
  salaryMin: "",
  salaryMax: "",
  skills: "",
  deadline: "",
  description: "",
  createAsClient: false,
};

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successNote, setSuccessNote] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeToggleId, setActiveToggleId] = useState("");
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState(defaultJobForm);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const haystack = [
        job.title,
        job.companyName,
        job.department,
        job.jobType,
        job.workplaceType,
        job.location,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchQuery.trim() || haystack.includes(searchQuery.trim().toLowerCase());
      const matchesCompany =
        companyFilter === "ALL" || job.companyId === companyFilter;
      const matchesStatus =
        statusFilter === "ALL" || job.approvalStatus === statusFilter;

      return matchesSearch && matchesCompany && matchesStatus;
    });
  }, [companyFilter, jobs, searchQuery, statusFilter]);

  const metricCards = useMemo(() => {
    const approved = jobs.filter((job) => job.approvalStatus === "APPROVED").length;
    const pending = jobs.filter((job) => job.approvalStatus === "PENDING").length;
    const active = jobs.filter((job) => job.isActive).length;

    return [
      {
        label: "Total jobs",
        value: formatNumber(jobs.length),
        detail: "Complete CRM view of published and client-submitted openings.",
        icon: LuBriefcaseBusiness,
        tone: "blue",
      },
      {
        label: "Approved jobs",
        value: formatNumber(approved),
        detail: "Roles already released to the platform and available for applications.",
        icon: LuClipboardCheck,
        tone: "emerald",
      },
      {
        label: "Pending review",
        value: formatNumber(pending),
        detail: "Client-originated job requests still waiting for CRM review.",
        icon: LuClipboardCheck,
        tone: "amber",
      },
      {
        label: "Active listings",
        value: formatNumber(active),
        detail: "Currently active job postings consuming live package capacity.",
        icon: LuMapPin,
        tone: "lime",
      },
    ];
  }, [jobs]);

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    setIsLoading(true);
    setPageError("");

    try {
      const [jobsResponse, clientsResponse] = await Promise.all([
        getJobs(),
        getClients(),
      ]);

      setJobs(jobsResponse.data);
      setClients(clientsResponse.data);
    } catch (requestError) {
      setPageError(requestError.message || "Unable to load job operations.");
    } finally {
      setIsLoading(false);
    }
  }

  const openCreateModal = () => {
    setEditingJob(null);
    setJobForm({
      ...defaultJobForm,
      companyId: clients[0]?.id || "",
    });
    setActionError("");
    setSuccessNote("");
    setIsModalOpen(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setJobForm({
      companyId: job.companyId,
      title: job.title,
      summary: job.summary || "",
      department: job.department,
      jobType: job.jobType,
      workplaceType: job.workplaceType,
      location: job.location,
      experience: job.experience,
      salaryMin: job.salaryMin || "",
      salaryMax: job.salaryMax || "",
      skills: Array.isArray(job.skills) ? job.skills.join(", ") : "",
      deadline: job.deadline ? job.deadline.slice(0, 10) : "",
      description: job.description || "",
      createAsClient: job.createdBySource === "CLIENT",
    });
    setActionError("");
    setSuccessNote("");
    setIsModalOpen(true);
  };

  const handleToggleActive = async (job) => {
    if (job.approvalStatus !== "APPROVED") {
      return;
    }

    setActiveToggleId(job.id);
    setActionError("");
    setSuccessNote("");

    try {
      await updateJob(job.id, { isActive: !job.isActive });
      await loadPage();
      setSuccessNote(`Job ${job.isActive ? "deactivated" : "activated"} successfully.`);
    } catch (requestError) {
      setActionError(requestError.message || "Unable to update job status.");
    } finally {
      setActiveToggleId("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setActionError("");
    setSuccessNote("");

    const payload = {
      ...jobForm,
      salaryMin: Number(jobForm.salaryMin || 0),
      salaryMax: Number(jobForm.salaryMax || 0),
      skills: jobForm.skills
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      if (editingJob) {
        await updateJob(editingJob.id, payload);
      } else {
        await createJob(payload);
      }

      await loadPage();
      setIsModalOpen(false);
    } catch (requestError) {
      setActionError(requestError.message || "Unable to save job.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageState title="Loading job operations..." />;
  }

  if (pageError) {
    return <PageState title={pageError} error />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <PanelCard>
        <SectionHeading
          eyebrow="Job command"
          title="Create, edit, and manage job postings across all clients"
          description="CRM can publish roles directly on behalf of clients or submit them into the approval queue as client-originated openings."
          action={
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#163060] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20498f]"
            >
              <LuPlus size={16} />
              Create job
            </button>
          }
        />

        {actionError ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {actionError}
          </div>
        ) : null}

        {successNote ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {successNote}
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 xl:grid-cols-[1.2fr_0.85fr_0.85fr]">
          <ToolbarInput
            icon={LuSearch}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search job title, company, department, or location"
          />
          <SelectField
            label="Company"
            value={companyFilter}
            onChange={(event) => setCompanyFilter(event.target.value)}
            options={[
              { label: "All companies", value: "ALL" },
              ...clients.map((client) => ({
                label: client.name,
                value: client.id,
              })),
            ]}
          />
          <SelectField
            label="Approval status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[
              { label: "All statuses", value: "ALL" },
              { label: "Approved", value: "APPROVED" },
              { label: "Pending", value: "PENDING" },
              { label: "Rejected", value: "REJECTED" },
            ]}
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <div className="grid grid-cols-[1.3fr_0.95fr_0.9fr_0.85fr_0.85fr_0.7fr] gap-3 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            <span>Job</span>
            <span>Company</span>
            <span>Format</span>
            <span>Approval</span>
            <span>Updated</span>
            <span className="text-right">Actions</span>
          </div>
          {filteredJobs.length ? (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="grid grid-cols-[1.3fr_0.95fr_0.9fr_0.85fr_0.85fr_0.7fr] gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600 transition hover:bg-lime-50/30"
              >
                <div>
                  <p className="font-semibold text-slate-900">{job.title}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {job.department || "General"} {"\u2022"}{" "}
                    {job.experience || "Experience open"}
                  </p>
                </div>
                <div>{job.companyName}</div>
                <div>
                  <p>{job.jobType || "Type pending"}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {job.workplaceType || "Flexible"} {"\u2022"}{" "}
                    {job.location || "Location pending"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge
                    tone={
                      job.approvalStatus === "APPROVED"
                        ? "emerald"
                        : job.approvalStatus === "PENDING"
                          ? "amber"
                          : "rose"
                    }
                  >
                    {titleCase(job.approvalStatus)}
                  </Badge>
                  <p className="text-xs text-slate-400">
                    {titleCase(job.createdBySource)}
                  </p>
                </div>
                <div>
                  <p>{job.lastUpdated}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(job.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => openEditModal(job)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-lime-300 hover:bg-lime-50"
                    >
                      Edit
                    </button>
                    {job.approvalStatus === "APPROVED" ? (
                      <button
                        onClick={() => handleToggleActive(job)}
                        disabled={activeToggleId === job.id}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-lime-300 hover:bg-lime-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {activeToggleId === job.id
                          ? "Saving..."
                          : job.isActive
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6">
              <EmptyState
                title="No jobs match the active filters"
                description="Adjust the search, company, or approval filters to review more roles."
              />
            </div>
          )}
        </div>
      </PanelCard>

      <ModalShell
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingJob ? "Edit job posting" : "Create job posting"}
        description="Publish roles on behalf of clients or create them as client-originated requests for CRM review."
        width="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <SelectField
              label="Company"
              value={jobForm.companyId}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, companyId: event.target.value }))
              }
              options={clients.map((client) => ({
                label: client.name,
                value: client.id,
              }))}
            />
            <TextField
              label="Job title"
              value={jobForm.title}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
            <TextAreaField
              label="JD summary / brief"
              className="md:col-span-2"
              value={jobForm.summary}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, summary: event.target.value }))
              }
              placeholder="Short summary for the job description."
            />
            <TextField
              label="Department"
              value={jobForm.department}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, department: event.target.value }))
              }
            />
            <TextField
              label="Job type"
              value={jobForm.jobType}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, jobType: event.target.value }))
              }
              placeholder="Full Time"
            />
            <TextField
              label="Workplace type"
              value={jobForm.workplaceType}
              onChange={(event) =>
                setJobForm((current) => ({
                  ...current,
                  workplaceType: event.target.value,
                }))
              }
              placeholder="On-site / Hybrid / Remote"
            />
            <TextField
              label="Location"
              value={jobForm.location}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, location: event.target.value }))
              }
            />
            <TextField
              label="Experience"
              value={jobForm.experience}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, experience: event.target.value }))
              }
              placeholder="3-5 years"
            />
            <TextField
              label="Deadline"
              type="date"
              value={jobForm.deadline}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, deadline: event.target.value }))
              }
            />
            <TextField
              label="Salary min"
              type="number"
              value={jobForm.salaryMin}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, salaryMin: event.target.value }))
              }
            />
            <TextField
              label="Salary max"
              type="number"
              value={jobForm.salaryMax}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, salaryMax: event.target.value }))
              }
            />
          </div>

          <TextField
            label="Skills"
            value={jobForm.skills}
            onChange={(event) =>
              setJobForm((current) => ({ ...current, skills: event.target.value }))
            }
            placeholder="React, JavaScript, Team Leadership"
          />

          <TextAreaField
            label="Description"
            value={jobForm.description}
            onChange={(event) =>
              setJobForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Describe the role, responsibilities, and hiring expectations"
          />

          {!editingJob ? (
            <label className="flex items-start gap-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={jobForm.createAsClient}
                onChange={(event) =>
                  setJobForm((current) => ({
                    ...current,
                    createAsClient: event.target.checked,
                  }))
                }
                className="mt-1 h-4 w-4 rounded border-slate-300 text-lime-500 focus:ring-lime-400"
              />
              <span>
                <span className="block font-semibold text-slate-900">
                  Submit as client-created opening
                </span>
                <span className="mt-1 block leading-6">
                  Use this when CRM is entering a role on behalf of the client but still wants it to pass through the approval queue before going live.
                </span>
              </span>
            </label>
          ) : null}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-lime-300 hover:bg-lime-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-[#163060] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20498f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Saving..." : editingJob ? "Update job" : "Create job"}
            </button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}

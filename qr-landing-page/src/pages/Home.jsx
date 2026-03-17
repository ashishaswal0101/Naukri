import { useEffect, useState } from "react";
import { HiBriefcase, HiLocationMarker, HiLightningBolt } from "react-icons/hi";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AppLayout from "../Layout/AppLayout";
import { fetchLandingData } from "../Redux/thunks/landingThunks";

const normalizeBaseUrl = (value) => String(value || "").trim().replace(/\/+$/, "");

const getCandidateAppBaseUrl = (fallbackUrl = "") => {
  const envValue = normalizeBaseUrl(import.meta.env.VITE_CANDIDATE_APP_URL);
  if (envValue) return envValue;

  const fallbackValue = normalizeBaseUrl(fallbackUrl);
  if (fallbackValue) return fallbackValue;

  if (typeof window === "undefined") {
    return "";
  }

  const { protocol, hostname, port } = window.location;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    if (port === "5173") return `${protocol}//${hostname}:5174`;
    if (port === "5174") return `${protocol}//${hostname}:5173`;
  }

  return "";
};

const buildCandidateJobUrl = ({ token, jobId, baseUrl }) => {
  const resolvedBaseUrl = baseUrl || getCandidateAppBaseUrl();
  const safeToken = encodeURIComponent(token);
  const params = new URLSearchParams();
  params.set("jobId", jobId);
  params.set("applyJobId", jobId);
  return `${resolvedBaseUrl}/landing/${safeToken}?${params.toString()}`;
};

export default function CompanyLandingPage() {
  const { token } = useParams();
  const dispatch = useDispatch();
  const { company, loading, error, candidateWebUrl } = useSelector(
    (state) => state.landing,
  );
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [actionError, setActionError] = useState("");
  const candidateBaseUrl = getCandidateAppBaseUrl(candidateWebUrl);
  const hasExplicitCandidateUrl = Boolean(
    normalizeBaseUrl(import.meta.env.VITE_CANDIDATE_APP_URL) ||
      normalizeBaseUrl(candidateWebUrl),
  );

  useEffect(() => {
    if (!token || typeof window === "undefined") return;

    const baseUrl = candidateBaseUrl;
    if (!baseUrl) return;

    const targetUrl = `${baseUrl}/landing/${encodeURIComponent(token)}${window.location.search}`;
    if (window.location.href !== targetUrl) {
      setIsRedirecting(true);
      window.location.replace(targetUrl);
    }
  }, [token, candidateBaseUrl]);

  useEffect(() => {
    if (token && !isRedirecting) dispatch(fetchLandingData(token));
  }, [token, dispatch, isRedirecting]);

  if (isRedirecting) {
    return (
      <AppLayout>
        <div className="h-full grid place-items-center px-6">
          <div className="rounded-3xl border border-[#e6ecff] bg-white px-6 py-5 text-sm font-semibold text-[#4a5f82] shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
            Redirecting to the candidate portal...
          </div>
        </div>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="h-full grid place-items-center px-6">
          <div className="rounded-3xl border border-[#e6ecff] bg-white px-6 py-5 text-sm font-semibold text-[#4a5f82] shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
            Loading company profile...
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="h-full grid place-items-center px-6">
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm font-semibold text-rose-700">
            {error}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!company) {
    return (
      <AppLayout>
        <div className="h-full grid place-items-center px-6">
          <div className="rounded-3xl border border-[#e6ecff] bg-white px-6 py-5 text-sm font-semibold text-[#4a5f82]">
            Company data is unavailable.
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleApplyNavigate = (applyUrl) => {
    if (!applyUrl || applyUrl === "#") {
      setActionError(
        "Apply is unavailable right now. Configure the Candidate app URL to enable redirects.",
      );
      return;
    }

    setActionError("");
    window.location.assign(applyUrl);
  };

  const jobs = Array.isArray(company.jobs) ? company.jobs : [];
  const locationLabel =
    company.location?.city ||
    company.location?.region ||
    company.headquarters ||
    company.hq ||
    "Location";

  return (
    <AppLayout headerProps={{ companyName: company.name }}>
      <div className="h-full">
        <div className="h-full max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">
          <section className="rounded-3xl border border-[#e6ecff] bg-white px-6 py-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a3c7a]">
                {company.name}
              </h1>
              <p className="text-[15px] leading-relaxed text-[#4a5f82] max-w-4xl">
                {company.tagline || "Explore open roles and apply in minutes."}
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-[#6b7c93]">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#eef3ff] px-4 py-2 text-[#1a3c7a]">
                  <HiLocationMarker className="h-4 w-4" />
                  {locationLabel}
                </span>
                {typeof company.openRoles === "number" ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#e6f9fb] px-4 py-2 text-[#007b86]">
                    <HiLightningBolt className="h-4 w-4" />
                    {company.openRoles} open roles
                  </span>
                ) : null}
              </div>
            </div>
          </section>

          {!hasExplicitCandidateUrl ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
              Candidate app URL is not configured. Set `VITE_CANDIDATE_APP_URL`
              for this QR landing build so Apply can redirect correctly.
            </div>
          ) : null}

          <section className="flex-1 overflow-hidden rounded-3xl border border-[#e6ecff] bg-white shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-4 border-b border-[#e6ecff] px-6 py-4">
              <h2 className="text-[18px] font-bold text-[#1a3c7a]">
                Open Positions
              </h2>
              <div className="text-[13px] font-semibold text-[#8fa3bf]">
                {jobs.length} opening{jobs.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="h-full overflow-y-auto px-6 py-5">
              {actionError ? (
                <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {actionError}
                </div>
              ) : null}
              {jobs.length ? (
                <div className="grid gap-4">
                  {jobs.map((job) => {
                    const jobId = String(job._id || job.id || "");
                    const applyUrl =
                      candidateBaseUrl && token && jobId
                        ? buildCandidateJobUrl({
                            token,
                            jobId,
                            baseUrl: candidateBaseUrl,
                          })
                        : "#";

                    return (
                      <article
                        key={jobId || job.title}
                        className="rounded-2xl border border-[#e6ecff] bg-white p-5 transition hover:shadow-md"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="text-lg font-bold text-[#1a3c7a] truncate">
                              {job.title || "Open role"}
                            </h3>
                            <div className="mt-2 flex flex-wrap gap-3 text-sm text-[#6b7c93]">
                              <span className="inline-flex items-center gap-2">
                                <HiLocationMarker className="h-4 w-4" />
                                {job.location || locationLabel}
                              </span>
                              {job.department ? (
                                <span className="inline-flex items-center gap-2">
                                  <HiBriefcase className="h-4 w-4" />
                                  {job.department}
                                </span>
                              ) : null}
                              {job.jobType ? (
                                <span className="inline-flex items-center gap-2">
                                  <HiLightningBolt className="h-4 w-4" />
                                  {job.jobType}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleApplyNavigate(applyUrl)}
                            className="shrink-0 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#00a8b4] to-[#5cba47] px-5 py-3 text-xs font-bold text-white transition hover:opacity-90"
                          >
                            Apply now
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d8e4f4] bg-[#f9fbff] px-6 py-10 text-center text-sm text-[#4a5f82]">
                  No open positions available right now.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

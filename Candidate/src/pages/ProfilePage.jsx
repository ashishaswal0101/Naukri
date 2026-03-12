import { useEffect, useMemo, useState } from "react";
import {
  EmptyState,
  PageState,
  PanelCard,
  SectionHeading,
  TextAreaField,
  TextField,
} from "../components/Ui";
import { formatDateTime, titleCase } from "../utils/formatters";
import { getProfile, updateProfile, uploadResume } from "../services/candidateApi";

const emptyForm = {
  name: "",
  phone: "",
  altPhone: "",
  headline: "",
  summary: "",
  totalExperience: "",
  currentTitle: "",
  currentCompany: "",
  noticePeriod: "",
  currentCity: "",
  currentState: "",
  currentCountry: "",
  preferredLocations: "",
  preferredRoles: "",
  skills: "",
  linkedInUrl: "",
  portfolioUrl: "",
  expectedSalary: "",
};

export default function ProfilePage() {
  const [state, setState] = useState({
    loading: true,
    error: "",
    profile: null,
    history: [],
  });
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const syncForm = (profile) => {
    setForm({
      name: profile.user.name || "",
      phone: profile.phone || "",
      altPhone: profile.altPhone || "",
      headline: profile.headline || "",
      summary: profile.summary || "",
      totalExperience: profile.totalExperience || "",
      currentTitle: profile.currentTitle || "",
      currentCompany: profile.currentCompany || "",
      noticePeriod: profile.noticePeriod || "",
      currentCity: profile.currentCity || "",
      currentState: profile.currentState || "",
      currentCountry: profile.currentCountry || "",
      preferredLocations: (profile.preferredLocations || []).join(", "),
      preferredRoles: (profile.preferredRoles || []).join(", "),
      skills: (profile.skills || []).join(", "),
      linkedInUrl: profile.linkedInUrl || "",
      portfolioUrl: profile.portfolioUrl || "",
      expectedSalary: profile.expectedSalary || "",
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const response = await getProfile();

        if (isMounted) {
          setState({
            loading: false,
            error: "",
            profile: response.data.profile,
            history: response.data.history,
          });
          syncForm(response.data.profile);
        }
      } catch (error) {
        if (isMounted) {
          setState({
            loading: false,
            error: error.message || "Unable to load profile.",
            profile: null,
            history: [],
          });
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const resumeLabel = useMemo(() => {
    if (!state.profile?.resume?.url) {
      return "No resume uploaded yet";
    }

    return `${state.profile.resume.fileName} • ${titleCase(
      state.profile.resume.storageProvider || "cloud storage",
    )}`;
  }, [state.profile]);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setFeedback("");

    try {
      const response = await updateProfile(form);
      setState((current) => ({
        ...current,
        profile: response.data,
      }));
      syncForm(response.data);
      setFeedback("Profile updated successfully.");
    } catch (error) {
      setFeedback(error.message || "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Robust PDF parsing for auto-fill
    if (file.type === "application/pdf") {
      const pdfjsLib = await import("pdfjs-dist/build/pdf");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";
      const reader = new FileReader();
      reader.onload = async (e) => {
        const typedarray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(" ") + " ";
        }
        // Helper regexes
        const phoneMatch = text.match(/(\+\d{1,3}[-.\s]?)?(\d{10,12})/);
        const linkedInMatch = text.match(/https?:\/\/(www\.)?linkedin\.com\/[a-zA-Z0-9\-_/]+/);
        // Name: first non-empty line, likely at top
        let name = "";
        const lines = text.split(/\n|\r|\r\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length > 0) name = lines[0];
        // Experience: look for years or experience
        let experience = "";
        const expMatch = text.match(/([0-9]+\+?)\s*(years|yrs|year|yr)?\s*(of)?\s*experience/i);
        if (expMatch) experience = expMatch[1] + (expMatch[2] ? " " + expMatch[2] : " years");
        // City: look for 'Current City' or 'Location' or after 'Address'
        let city = "";
        const cityMatch = text.match(/Current City:?\s*([A-Za-z ]+)/i) || text.match(/Location:?\s*([A-Za-z ]+)/i) || text.match(/Address:?\s*([A-Za-z ]+)/i);
        if (cityMatch) city = cityMatch[1].trim();
        // Summary: look for 'Summary' or 'Profile Summary' section
        let summary = "";
        const summaryMatch = text.match(/(Summary|Professional Summary|Profile Summary|About)[\s:]*([\s\S]{0,500})/i);
        if (summaryMatch) summary = summaryMatch[2].split(/\n|\r|\r\n/)[0].trim();
        setForm((current) => ({
          ...current,
          name: name || current.name,
          phone: phoneMatch ? phoneMatch[0] : current.phone,
          totalExperience: experience || current.totalExperience,
          currentCity: city || current.currentCity,
          linkedInUrl: linkedInMatch ? linkedInMatch[0] : current.linkedInUrl,
          summary: summary || current.summary,
        }));
      };
      reader.readAsArrayBuffer(file);
    }
    setIsUploading(true);
    setFeedback("");

    try {
      const response = await uploadResume(file);
      setState((current) => ({
        ...current,
        profile: response.data,
      }));
      syncForm(response.data);
      setFeedback("Resume uploaded successfully.");
    } catch (error) {
      setFeedback(error.message || "Unable to upload resume.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  if (state.loading) {
    return (
      <PageState
        title="Loading profile"
        description="Fetching your candidate profile, resume status, and edit history."
      />
    );
  }

  if (state.error || !state.profile) {
    return (
      <PageState
        title="Profile unavailable"
        description={state.error || "Unable to load candidate profile."}
        error
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <PanelCard>
          <SectionHeading
            eyebrow="Candidate Profile"
            title="Maintain your core application profile"
            description="Changes are tracked centrally so Admin and CRM can access the latest approved candidate data when required."
          />

          {feedback ? (
            <div className="mt-5 rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm font-medium text-lime-800">
              {feedback}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
            <TextField label="Full name" value={form.name} onChange={handleChange("name")} />
            <TextField label="Phone" value={form.phone} onChange={handleChange("phone")} />
            <TextField label="Total experience" value={form.totalExperience} onChange={handleChange("totalExperience")} />
            <TextField label="Current city" value={form.currentCity} onChange={handleChange("currentCity")} />
            <TextField label="LinkedIn URL" value={form.linkedInUrl} onChange={handleChange("linkedInUrl")} />
            <TextAreaField label="Professional summary" value={form.summary} onChange={handleChange("summary")} className="md:col-span-2" />
            <div className="md:col-span-2">
              <button type="submit" disabled={isSaving} className="rounded-2xl bg-[#163060] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d3f7f] disabled:cursor-not-allowed disabled:opacity-70">
                {isSaving ? "Saving..." : "Save profile changes"}
              </button>
            </div>
          </form>
        </PanelCard>

        <div className="space-y-6">
          <PanelCard>
            <SectionHeading
              eyebrow="Resume"
              title="Upload your latest CV"
              description="PDF, DOC, and DOCX are supported. Resume storage is handled securely through the configured backend provider."
            />

            <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">Current file</p>
              <h3 className="mt-3 text-lg font-bold text-slate-900">{resumeLabel}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {state.profile.resume.uploadedAt
                  ? `Uploaded on ${formatDateTime(state.profile.resume.uploadedAt)}`
                  : "Upload a resume to unlock applications."}
              </p>
              <label className="mt-5 inline-flex cursor-pointer items-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-lime-300 hover:bg-lime-50 hover:text-[#163060]">
                {isUploading ? "Uploading..." : "Upload resume"}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleResumeUpload}
                />
              </label>
            </div>
          </PanelCard>

          <PanelCard>
            <SectionHeading
              eyebrow="Edit History"
              title="Tracked profile activity"
              description="Profile and resume changes are stored centrally for governance and reporting."
            />

            <div className="mt-5 space-y-3">
              {state.history.length ? (
                state.history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">
                        {titleCase(item.action)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {(item.changedFields || []).length
                        ? item.changedFields.join(", ")
                        : "Initial profile record"}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No profile history yet"
                  description="Profile edits and resume updates will appear here."
                />
              )}
            </div>
          </PanelCard>
        </div>
      </section>
    </div>
  );
}

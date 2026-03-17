import { useEffect, useMemo, useState } from "react";
import {
  LuBriefcaseBusiness,
  LuBuilding2,
  LuCheck,
  LuCircleDashed,
  LuInfo,
  LuLink2,
  LuMail,
  LuMapPin,
  LuPlus,
  LuSparkles,
  LuTrash2,
} from "react-icons/lu";
import {
  PanelCard,
  SectionHeading,
  SelectField,
  TextAreaField,
  TextField,
} from "./Ui";
import {
  COMPANY_SIZES,
  INDUSTRIES,
  JOB_TYPES,
  QR_SECTIONS,
} from "../data/qrManagementOptions";
import { generateManagedQRCode, getQrPdfDownloadUrl } from "../services/crmApi";

const emptyJob = () => ({
  title: "",
  department: "",
  jobType: "",
  location: "",
  workplaceType: "",
  exp: "",
  salaryMin: "",
  salaryMax: "",
  skills: [],
  deadline: "",
  description: "",
});

const emptyHighlight = () => ({
  icon: "",
  title: "",
  desc: "",
});

const defaultForm = {
  companyName: "",
  tagline: "",
  industry: "",
  companySize: "",
  foundedYear: "",
  employeesCount: "",
  headquarters: "",
  website: "",
  linkedIn: "",
  activelyHiring: true,
  openings: "1",
  email: "",
  phone: "",
  altPhone: "",
  region: "",
  city: "",
  zone: "",
  address: "",
  pincode: "",
  contactPerson: "",
  contactRole: "",
  notes: "",
  about: "",
  mission: "",
  vision: "",
  jobs: [emptyJob()],
  whyJoinUs: [emptyHighlight()],
};

const requiredFields = ["companyName", "industry", "email", "phone", "region", "city", "about"];

export default function QrManagementWizard({ onGenerated }) {
  const [formData, setFormData] = useState(defaultForm);
  const [activeSection, setActiveSection] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const progress = useMemo(() => {
    const completed = requiredFields.filter((field) => String(formData[field] || "").trim()).length;
    const total = requiredFields.length + 1;
    const score = completed + (formData.jobs.some((job) => job.title.trim()) ? 1 : 0);
    return Math.round((score / total) * 100);
  }, [formData]);

  useEffect(() => {
    const openings = Math.max(1, Number(formData.openings || 1));

    setFormData((current) => {
      const jobs = [...current.jobs];
      if (jobs.length === openings) {
        return current;
      }
      if (jobs.length > openings) {
        return { ...current, jobs: jobs.slice(0, openings) };
      }
      while (jobs.length < openings) {
        jobs.push(emptyJob());
      }
      return { ...current, jobs };
    });
  }, [formData.openings]);

  const updateField = (field, value) =>
    setFormData((current) => ({ ...current, [field]: value }));

  const updateJob = (index, field, value) =>
    setFormData((current) => {
      const jobs = [...current.jobs];
      jobs[index] = { ...jobs[index], [field]: value };
      return { ...current, jobs };
    });

  const updateHighlight = (index, field, value) =>
    setFormData((current) => {
      const whyJoinUs = [...current.whyJoinUs];
      whyJoinUs[index] = { ...whyJoinUs[index], [field]: value };
      return { ...current, whyJoinUs };
    });

  const addSkill = (jobIndex, skill) => {
    const normalized = skill.trim();
    if (!normalized) {
      return;
    }

    setFormData((current) => {
      const jobs = [...current.jobs];
      const skills = jobs[jobIndex].skills || [];
      if (!skills.includes(normalized)) {
        jobs[jobIndex] = { ...jobs[jobIndex], skills: [...skills, normalized] };
      }
      return { ...current, jobs };
    });
  };

  const removeSkill = (jobIndex, skillIndex) =>
    setFormData((current) => {
      const jobs = [...current.jobs];
      jobs[jobIndex] = {
        ...jobs[jobIndex],
        skills: jobs[jobIndex].skills.filter((_, index) => index !== skillIndex),
      };
      return { ...current, jobs };
    });

  const addHighlight = () =>
    setFormData((current) => ({
      ...current,
      whyJoinUs: [...current.whyJoinUs, emptyHighlight()],
    }));

  const removeHighlight = (index) =>
    setFormData((current) => ({
      ...current,
      whyJoinUs: current.whyJoinUs.filter((_, itemIndex) => itemIndex !== index),
    }));

  const handleGenerate = async (event) => {
    event.preventDefault();
    setIsGenerating(true);
    setError("");

    try {
      const response = await generateManagedQRCode({
        company: {
          name: formData.companyName,
          tagline: formData.tagline,
          industry: formData.industry,
          size: formData.companySize,
          founded: formData.foundedYear,
          employees: formData.employeesCount,
          headquarters: formData.headquarters || formData.city,
          website: formData.website,
          linkedIn: formData.linkedIn,
          activelyHiring: formData.activelyHiring,
          openings: formData.openings,
          contact: {
            email: formData.email,
            phone: formData.phone,
            altPhone: formData.altPhone,
          },
          location: {
            region: formData.region,
            city: formData.city,
            zone: formData.zone,
            address: formData.address,
            pincode: formData.pincode,
          },
        },
        metadata: {
          contactPerson: formData.contactPerson,
          contactRole: formData.contactRole,
          notes: formData.notes,
        },
        about: formData.about,
        mission: formData.mission,
        vision: formData.vision,
        jobs: formData.jobs,
        whyJoinUs: formData.whyJoinUs.filter(
          (item) => item.title.trim() || item.desc.trim() || item.icon.trim(),
        ),
      });

      const generated = {
        token: response.token,
        qrImage: response.qrImage,
        redirectUrl: response.redirectUrl,
        pdfUrl: response.pdfUrl,
        companyName: formData.companyName,
      };

      setResult(generated);
      onGenerated?.();
    } catch (requestError) {
      setError(requestError.message || "Unable to generate QR kit.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PanelCard>
        <SectionHeading
          eyebrow="QR management"
          title="Create company and generate branded QR kits"
          description="CRM now owns the full QR workflow previously exposed in the Client panel, including company setup, job mapping, branded PDF generation, and distribution readiness."
        />

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-slate-600">Completion progress</p>
            <p className="text-sm font-bold text-[#163060]">{progress}%</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#163060] via-[#2c5db4] to-[#8dc63f]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {QR_SECTIONS.map((section, index) => (
            <button
              key={section}
              type="button"
              onClick={() => setActiveSection(index)}
              className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                activeSection === index
                  ? "border-[#163060] bg-[#163060] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-lime-300 hover:bg-lime-50"
              }`}
            >
              {section}
            </button>
          ))}
        </div>

        <form onSubmit={handleGenerate} className="mt-6 space-y-6">
          <WizardSection
            visible={activeSection === 0}
            icon={LuBuilding2}
            title="Company identity"
            description="Capture the company profile that will appear in the QR journey."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <TextField label="Company name" value={formData.companyName} onChange={(event) => updateField("companyName", event.target.value)} required />
              <TextField label="Tagline / slogan" value={formData.tagline} onChange={(event) => updateField("tagline", event.target.value)} />
              <SelectField label="Industry" value={formData.industry} onChange={(event) => updateField("industry", event.target.value)} options={[{ label: "Select industry", value: "" }, ...INDUSTRIES.map((item) => ({ label: item, value: item }))]} required />
              <SelectField label="Company size" value={formData.companySize} onChange={(event) => updateField("companySize", event.target.value)} options={[{ label: "Select size", value: "" }, ...COMPANY_SIZES.map((item) => ({ label: item, value: item }))]} />
              <TextField label="Founded year" value={formData.foundedYear} onChange={(event) => updateField("foundedYear", event.target.value)} />
              <TextField label="Employees count" value={formData.employeesCount} onChange={(event) => updateField("employeesCount", event.target.value)} />
              <TextField label="Headquarters" value={formData.headquarters} onChange={(event) => updateField("headquarters", event.target.value)} />
              <TextField label="Open roles" type="number" min="1" value={formData.openings} onChange={(event) => updateField("openings", event.target.value)} />
              <TextField label="Website" value={formData.website} onChange={(event) => updateField("website", event.target.value)} />
              <TextField label="LinkedIn" value={formData.linkedIn} onChange={(event) => updateField("linkedIn", event.target.value)} />
            </div>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={formData.activelyHiring}
                onChange={(event) => updateField("activelyHiring", event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-lime-500 focus:ring-lime-400"
              />
              Mark company as actively hiring
            </label>
          </WizardSection>

          <WizardSection visible={activeSection === 1} icon={LuMail} title="Contact details" description="Client-facing contact and CRM notes.">
            <div className="grid gap-5 md:grid-cols-2">
              <TextField label="Email" type="email" value={formData.email} onChange={(event) => updateField("email", event.target.value)} required />
              <TextField label="Phone" value={formData.phone} onChange={(event) => updateField("phone", event.target.value)} required />
              <TextField label="Alternate phone" value={formData.altPhone} onChange={(event) => updateField("altPhone", event.target.value)} />
              <TextField label="Contact person" value={formData.contactPerson} onChange={(event) => updateField("contactPerson", event.target.value)} />
              <TextField label="Contact role" value={formData.contactRole} onChange={(event) => updateField("contactRole", event.target.value)} />
            </div>
            <TextAreaField label="Operational notes" value={formData.notes} onChange={(event) => updateField("notes", event.target.value)} />
          </WizardSection>

          <WizardSection visible={activeSection === 2} icon={LuMapPin} title="Location details" description="Geo fields used for reporting and client display.">
            <div className="grid gap-5 md:grid-cols-2">
              <TextField label="State" value={formData.region} onChange={(event) => updateField("region", event.target.value)} required />
              <TextField label="City" value={formData.city} onChange={(event) => updateField("city", event.target.value)} required />
              <TextField label="Zone" value={formData.zone} onChange={(event) => updateField("zone", event.target.value)} />
              <TextField label="Address" value={formData.address} onChange={(event) => updateField("address", event.target.value)} />
              <TextField label="Pincode" value={formData.pincode} onChange={(event) => updateField("pincode", event.target.value)} />
            </div>
          </WizardSection>

          <WizardSection visible={activeSection === 3} icon={LuInfo} title="About the company" description="Content used in the landing page and branded PDF.">
            <TextAreaField label="About" value={formData.about} onChange={(event) => updateField("about", event.target.value)} required />
            <TextAreaField label="Mission" value={formData.mission} onChange={(event) => updateField("mission", event.target.value)} />
            <TextAreaField label="Vision" value={formData.vision} onChange={(event) => updateField("vision", event.target.value)} />
          </WizardSection>

          <WizardSection visible={activeSection === 4} icon={LuBriefcaseBusiness} title="Job requirements" description="Map all role requirements before QR generation.">
            <div className="space-y-5">
              {formData.jobs.map((job, index) => (
                <div key={`job-${index}`} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-bold text-slate-900">Job {index + 1}</h3>
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <TextField label="Title" value={job.title} onChange={(event) => updateJob(index, "title", event.target.value)} required />
                    <TextField label="Department" value={job.department} onChange={(event) => updateJob(index, "department", event.target.value)} />
                    <SelectField label="Job type" value={job.jobType} onChange={(event) => updateJob(index, "jobType", event.target.value)} options={[{ label: "Select type", value: "" }, ...JOB_TYPES.map((item) => ({ label: item, value: item }))]} />
                    <TextField label="Workplace type" value={job.workplaceType} onChange={(event) => updateJob(index, "workplaceType", event.target.value)} />
                    <TextField label="Location" value={job.location} onChange={(event) => updateJob(index, "location", event.target.value)} />
                    <TextField label="Experience" value={job.exp} onChange={(event) => updateJob(index, "exp", event.target.value)} />
                    <TextField label="Salary min" type="number" value={job.salaryMin} onChange={(event) => updateJob(index, "salaryMin", event.target.value)} />
                    <TextField label="Salary max" type="number" value={job.salaryMax} onChange={(event) => updateJob(index, "salaryMax", event.target.value)} />
                    <TextField label="Deadline" type="date" value={job.deadline} onChange={(event) => updateJob(index, "deadline", event.target.value)} />
                  </div>
                  <TextAreaField label="Description" value={job.description} onChange={(event) => updateJob(index, "description", event.target.value)} />
                  <SkillEditor skills={job.skills} onAdd={(skill) => addSkill(index, skill)} onRemove={(skillIndex) => removeSkill(index, skillIndex)} />
                </div>
              ))}
            </div>
          </WizardSection>

          <WizardSection visible={activeSection === 5} icon={LuSparkles} title="Why join us" description="Capture value propositions for the company landing.">
            <div className="space-y-5">
              {formData.whyJoinUs.map((item, index) => (
                <div key={`highlight-${index}`} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-slate-900">Highlight {index + 1}</h3>
                    {formData.whyJoinUs.length > 1 ? (
                      <button type="button" onClick={() => removeHighlight(index)} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700">
                        <LuTrash2 size={16} />
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <TextField label="Icon" value={item.icon} onChange={(event) => updateHighlight(index, "icon", event.target.value)} />
                    <TextField label="Title" value={item.title} onChange={(event) => updateHighlight(index, "title", event.target.value)} />
                  </div>
                  <TextAreaField label="Description" value={item.desc} onChange={(event) => updateHighlight(index, "desc", event.target.value)} />
                </div>
              ))}
            </div>
            <button type="button" onClick={addHighlight} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-lime-300 hover:bg-lime-50">
              <LuPlus size={16} />
              Add highlight
            </button>
          </WizardSection>

          <div className="flex flex-wrap justify-between gap-3">
            <div className="flex gap-3">
              <button type="button" onClick={() => setActiveSection((current) => Math.max(0, current - 1))} disabled={activeSection === 0} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-lime-300 hover:bg-lime-50 disabled:cursor-not-allowed disabled:opacity-60">Previous</button>
              <button type="button" onClick={() => setActiveSection((current) => Math.min(QR_SECTIONS.length - 1, current + 1))} disabled={activeSection === QR_SECTIONS.length - 1} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-lime-300 hover:bg-lime-50 disabled:cursor-not-allowed disabled:opacity-60">Next</button>
            </div>
            <button type="submit" disabled={isGenerating} className="rounded-2xl bg-[#163060] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#20498f] disabled:cursor-not-allowed disabled:opacity-70">
              {isGenerating ? "Generating..." : "Create Company & Generate QR"}
            </button>
          </div>
        </form>
      </PanelCard>

      {result ? (
        <PanelCard>
          <SectionHeading eyebrow="Generation result" title="QR kit created successfully" description="CRM generated the landing URL, QR image, and branded PDF package." />
          <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-center">
              <img src={result.qrImage} alt="Generated QR" className="mx-auto h-56 w-56 rounded-2xl border border-slate-200 bg-white p-4" />
            </div>
            <div className="space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"><p className="text-sm font-semibold text-slate-500">Company</p><p className="mt-2 text-xl font-bold text-slate-900">{result.companyName}</p></div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"><p className="text-sm font-semibold text-slate-500">Token</p><p className="mt-2 break-all text-sm font-medium text-slate-900">{result.token}</p></div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"><p className="text-sm font-semibold text-slate-500">Redirect URL</p><a href={result.redirectUrl} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm font-medium text-[#163060] underline">{result.redirectUrl}</a></div>
              <div className="flex flex-wrap gap-3">
                <a href={getQrPdfDownloadUrl(result.token)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-[#163060] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20498f]"><LuMail size={16} />Download PDF</a>
                <a href={result.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-lime-300 hover:bg-lime-50"><LuLink2 size={16} />Open hosted PDF</a>
              </div>
            </div>
          </div>
        </PanelCard>
      ) : null}
    </div>
  );
}

function WizardSection({ visible, icon: IconComponent, title, description, children }) {
  if (!visible) {
    return null;
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#163060] to-[#2856a6] text-white">
          <IconComponent size={20} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      <div className="mt-6 space-y-5">{children}</div>
    </div>
  );
}

function SkillEditor({ skills, onAdd, onRemove }) {
  const [draft, setDraft] = useState("");

  return (
    <div className="mt-5 rounded-[20px] border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-700">Skills</p>
      <div className="mt-3 flex gap-3">
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add a skill" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:bg-white" />
        <button type="button" onClick={() => { onAdd(draft); setDraft(""); }} className="rounded-2xl bg-[#163060] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#20498f]">Add</button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {skills.length ? skills.map((skill, index) => (
          <span key={`${skill}-${index}`} className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-800">
            <LuCheck size={14} />
            {skill}
            <button type="button" onClick={() => onRemove(index)} className="text-lime-800/70 transition hover:text-rose-600">
              <LuTrash2 size={12} />
            </button>
          </span>
        )) : (
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            <LuCircleDashed size={14} />
            No skills added yet
          </span>
        )}
      </div>
    </div>
  );
}

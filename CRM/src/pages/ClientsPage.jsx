import { useEffect, useMemo, useState } from "react";
import {
  LuBuilding2,
  LuBriefcaseBusiness,
  LuKeyRound,
  LuPlus,
  LuSearch,
  LuSettings2,
  LuUsers,
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
import {
  createClient,
  getClients,
  getPackages,
  getQrPdfDownloadUrl,
  updateClient,
  updateClientCredentials,
} from "../services/crmApi";
import { formatNumber, titleCase } from "../utils/formatters";

const industryOptions = [
  "IT Services",
  "Software / SaaS",
  "Healthcare",
  "Education",
  "Retail",
  "E-commerce",
  "Finance",
  "Manufacturing",
  "Logistics",
  "Hospitality",
  "Real Estate",
  "Media",
];

const defaultClientForm = {
  name: "",
  industry: "",
  email: "",
  phone: "",
  city: "",
  region: "",
  zone: "",
  packageType: "STANDARD",
  configurationNotes: "",
  accountManager: "",
  clientName: "",
  clientEmail: "",
  clientPassword: "",
  status: "ACTIVE",
};

const defaultCredentialForm = {
  clientName: "",
  clientEmail: "",
  clientPassword: "",
};

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [packages, setPackages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [packageFilter, setPackageFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successNote, setSuccessNote] = useState("");
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [credentialsTarget, setCredentialsTarget] = useState(null);
  const [generatedQrKit, setGeneratedQrKit] = useState(null);
  const [clientForm, setClientForm] = useState(defaultClientForm);
  const [credentialsForm, setCredentialsForm] = useState(defaultCredentialForm);
  const [isSaving, setIsSaving] = useState(false);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const haystack = [
        client.name,
        client.industry,
        client.email,
        client.city,
        client.region,
        client.zone,
        client.accountManager,
        client.clientUser?.name,
        client.clientUser?.email,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchQuery.trim() || haystack.includes(searchQuery.trim().toLowerCase());
      const matchesPackage =
        packageFilter === "ALL" || client.packageType === packageFilter;
      const matchesStatus = statusFilter === "ALL" || client.status === statusFilter;

      return matchesSearch && matchesPackage && matchesStatus;
    });
  }, [clients, packageFilter, searchQuery, statusFilter]);

  useEffect(() => {
    loadPage();
  }, []);

  const metricCards = useMemo(() => {
    const activeClients = clients.filter((client) => client.status === "ACTIVE").length;
    const totalSlots = clients.reduce((sum, client) => sum + Number(client.jobLimit || 0), 0);
    const liveJobs = clients.reduce(
      (sum, client) => sum + Number(client.activeJobCount || 0),
      0,
    );
    const overLimitClients = clients.filter(
      (client) => Number(client.activeJobCount || 0) > Number(client.jobLimit || 0),
    ).length;

    return [
      {
        label: "Managed clients",
        value: formatNumber(clients.length),
        detail: "Company accounts controlled directly by CRM.",
        icon: LuBuilding2,
        tone: "blue",
      },
      {
        label: "Active accounts",
        value: formatNumber(activeClients),
        detail: "Live clients currently open for recruitment operations.",
        icon: LuUsers,
        tone: "lime",
      },
      {
        label: "Configured slots",
        value: formatNumber(totalSlots),
        detail: "Job posting capacity allocated through CRM package plans.",
        icon: LuSettings2,
        tone: "amber",
      },
      {
        label: "Live jobs",
        value: formatNumber(liveJobs),
        detail: "Active roles already consuming the current client package limits.",
        icon: LuBuilding2,
        tone: "emerald",
      },
      {
        label: "Over limit",
        value: formatNumber(overLimitClients),
        detail: "Clients whose active jobs exceed their configured package limit.",
        icon: LuBriefcaseBusiness,
        tone: "rose",
      },
    ];
  }, [clients]);

  async function loadPage() {
    setIsLoading(true);
    setPageError("");

    try {
      const [clientsResponse, packagesResponse] = await Promise.all([
        getClients(),
        getPackages(),
      ]);

      setClients(clientsResponse.data);
      setPackages(packagesResponse.data);
    } catch (requestError) {
      setPageError(requestError.message || "Unable to load client accounts.");
    } finally {
      setIsLoading(false);
    }
  }

  const openCreateClient = () => {
    setEditingClient(null);
    setClientForm({
      ...defaultClientForm,
      packageType: packages[0]?.name || "STANDARD",
    });
    setActionError("");
    setSuccessNote("");
    setIsClientModalOpen(true);
  };

  const openEditClient = (client) => {
    setEditingClient(client);
    setClientForm({
      name: client.name || "",
      industry: client.industry || "",
      email: client.email || "",
      phone: client.phone || "",
      city: client.city || "",
      region: client.region || "",
      zone: client.zone || "",
      packageType: client.packageType || "STANDARD",
      configurationNotes: client.configurationNotes || "",
      accountManager: client.accountManager || "",
      clientName: "",
      clientEmail: "",
      clientPassword: "",
      status: client.status || "ACTIVE",
    });
    setActionError("");
    setSuccessNote("");
    setIsClientModalOpen(true);
  };

  const openCredentialsModal = (client) => {
    setCredentialsTarget(client);
    setCredentialsForm({
      clientName: client.clientUser?.name || "",
      clientEmail: client.clientUser?.email || "",
      clientPassword: "",
    });
    setActionError("");
    setSuccessNote("");
    setIsCredentialsModalOpen(true);
  };

  const handleClientSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setActionError("");
    setSuccessNote("");

    try {
      if (editingClient) {
        await updateClient(editingClient.id, clientForm);
      } else {
        const response = await createClient(clientForm);
        if (response.temporaryPassword) {
          setSuccessNote(
            `Client created successfully. Temporary password: ${response.temporaryPassword}`,
          );
        }
        if (response.qrCode) {
          setGeneratedQrKit(response.qrCode);
        } else if (response.qrGenerationError) {
          setSuccessNote((current) =>
            current
              ? `${current} QR kit: ${response.qrGenerationError}`
              : `Client created, but QR kit generation failed: ${response.qrGenerationError}`,
          );
        }
      }

      await loadPage();
      setIsClientModalOpen(false);
    } catch (requestError) {
      setActionError(requestError.message || "Unable to save client account.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCredentialsSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setActionError("");
    setSuccessNote("");

    try {
      await updateClientCredentials(credentialsTarget.id, credentialsForm);
      await loadPage();
      setSuccessNote("Client credentials updated successfully.");
      setIsCredentialsModalOpen(false);
    } catch (requestError) {
      setActionError(requestError.message || "Unable to update credentials.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageState title="Loading client operations..." />;
  }

  if (pageError) {
    return <PageState title={pageError} error />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metricCards.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <PanelCard>
        <SectionHeading
          eyebrow="Client control"
          title="Manage and configure all client/company accounts"
          description="CRM controls company onboarding, package limits, geographic configuration, and client access credentials from one operational surface."
          action={
            <button
              onClick={openCreateClient}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#163060] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20498f] hover:shadow-[0_16px_40px_rgba(22,48,96,0.24)]"
            >
              <LuPlus size={16} />
              Add client
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

        <div className="mt-6 grid gap-3 xl:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <ToolbarInput
            icon={LuSearch}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search company, manager, geography, or client credentials"
          />
          <SelectField
            label="Package"
            value={packageFilter}
            onChange={(event) => setPackageFilter(event.target.value)}
            options={[
              { label: "All packages", value: "ALL" },
              ...packages.map((pkg) => ({
                label: titleCase(pkg.name),
                value: pkg.name,
              })),
            ]}
          />
          <SelectField
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[
              { label: "All statuses", value: "ALL" },
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
            ]}
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <div className="grid grid-cols-[1.2fr_0.95fr_0.9fr_0.8fr_0.9fr_0.85fr] gap-3 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            <span>Company</span>
            <span>Geography</span>
            <span>Package</span>
            <span>Client access</span>
            <span>Account manager</span>
            <span className="text-right">Actions</span>
          </div>
          {filteredClients.length ? (
            filteredClients.map((client) => (
              <div
                key={client.id}
                className="grid grid-cols-[1.2fr_0.95fr_0.9fr_0.8fr_0.9fr_0.85fr] gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600 transition hover:bg-lime-50/30"
              >
                <div>
                  <p className="font-semibold text-slate-900">{client.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{client.industry}</p>
                  <p className="mt-2 text-xs text-slate-500">{client.email}</p>
                </div>
                <div>
                  <p>{client.city || "City pending"}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {client.region || "Region pending"} {"\u2022"}{" "}
                    {client.zone || "Zone pending"}
                  </p>
                </div>
                <div>
                  <Badge tone="blue">{titleCase(client.packageType)}</Badge>
                  <p className="mt-2 text-xs text-slate-500">
                    {client.activeJobCount}/{client.jobLimit} jobs active
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {client.clientUser?.name || "Not linked"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {client.clientUser?.email || "No credentials"}
                  </p>
                </div>
                <div>
                  <p>{client.accountManager || "Unassigned"}</p>
                  <p className="mt-1 text-xs text-slate-400">{client.lastUpdated}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge tone={client.status === "ACTIVE" ? "emerald" : "rose"}>
                    {titleCase(client.status)}
                  </Badge>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditClient(client)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-lime-300 hover:bg-lime-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openCredentialsModal(client)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-lime-300 hover:bg-lime-50"
                    >
                      Credentials
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6">
              <EmptyState
                title="No clients match the current filters"
                description="Adjust the search, package, or status filters to widen the portfolio view."
              />
            </div>
          )}
        </div>
      </PanelCard>

      <ModalShell
        open={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title={editingClient ? "Edit client account" : "Create client account"}
        description="Control company setup, package limits, and the primary client user from the CRM panel."
        width="max-w-4xl"
      >
        <form onSubmit={handleClientSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Company name"
              value={clientForm.name}
              onChange={(event) =>
                setClientForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Maven Retail Pvt Ltd"
              required
            />
            <SelectField
              label="Industry"
              value={clientForm.industry}
              onChange={(event) =>
                setClientForm((current) => ({ ...current, industry: event.target.value }))
              }
              options={[
                { label: "Select industry", value: "" },
                ...industryOptions.map((industry) => ({ label: industry, value: industry })),
                ...(clientForm.industry &&
                !industryOptions.some(
                  (industry) =>
                    industry.toLowerCase() === clientForm.industry.trim().toLowerCase(),
                )
                  ? [{ label: `${clientForm.industry} (Custom)`, value: clientForm.industry }]
                  : []),
              ]}
            />
            <TextField
              label="Company email"
              type="email"
              value={clientForm.email}
              onChange={(event) =>
                setClientForm((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="company@example.com"
              required
            />
            <TextField
              label="Phone"
              value={clientForm.phone}
              onChange={(event) =>
                setClientForm((current) => ({ ...current, phone: event.target.value }))
              }
              placeholder="+91 98765 43210"
            />
            <TextField
              label="City"
              value={clientForm.city}
              onChange={(event) =>
                setClientForm((current) => ({ ...current, city: event.target.value }))
              }
            />
            <TextField
              label="Region"
              value={clientForm.region}
              onChange={(event) =>
                setClientForm((current) => ({ ...current, region: event.target.value }))
              }
            />
            <TextField
              label="Zone"
              value={clientForm.zone}
              onChange={(event) =>
                setClientForm((current) => ({ ...current, zone: event.target.value }))
              }
            />
            <TextField
              label="Account manager"
              value={clientForm.accountManager}
              onChange={(event) =>
                setClientForm((current) => ({
                  ...current,
                  accountManager: event.target.value,
                }))
              }
              placeholder="North Enterprise Desk"
            />
            <SelectField
              label="Package plan"
              value={clientForm.packageType}
              onChange={(event) =>
                setClientForm((current) => ({
                  ...current,
                  packageType: event.target.value,
                }))
              }
              options={packages.map((pkg) => ({
                label: `${titleCase(pkg.name)} (${pkg.jobLimit} posts)`,
                value: pkg.name,
              }))}
            />
            <SelectField
              label="Status"
              value={clientForm.status}
              onChange={(event) =>
                setClientForm((current) => ({ ...current, status: event.target.value }))
              }
              options={[
                { label: "Active", value: "ACTIVE" },
                { label: "Inactive", value: "INACTIVE" },
              ]}
            />
          </div>

          {!editingClient ? (
            <div className="grid gap-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5 md:grid-cols-3">
              <TextField
                label="Client user name"
                value={clientForm.clientName}
                onChange={(event) =>
                  setClientForm((current) => ({
                    ...current,
                    clientName: event.target.value,
                  }))
                }
                required
              />
              <TextField
                label="Client user email"
                type="email"
                value={clientForm.clientEmail}
                onChange={(event) =>
                  setClientForm((current) => ({
                    ...current,
                    clientEmail: event.target.value,
                  }))
                }
                required
              />
              <TextField
                label="Client password"
                type="text"
                value={clientForm.clientPassword}
                onChange={(event) =>
                  setClientForm((current) => ({
                    ...current,
                    clientPassword: event.target.value,
                  }))
                }
                placeholder="Leave empty to auto-generate"
              />
            </div>
          ) : null}

          <TextAreaField
            label="Configuration notes"
            value={clientForm.configurationNotes}
            onChange={(event) =>
              setClientForm((current) => ({
                ...current,
                configurationNotes: event.target.value,
              }))
            }
            placeholder="Special package overrides, custom hiring workflow notes, or account-level configuration details"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsClientModalOpen(false)}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-lime-300 hover:bg-lime-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-[#163060] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20498f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Saving..." : editingClient ? "Update client" : "Create client"}
            </button>
          </div>
        </form>
      </ModalShell>

      <ModalShell
        open={isCredentialsModalOpen}
        onClose={() => setIsCredentialsModalOpen(false)}
        title="Edit client credentials"
        description={
          credentialsTarget
            ? `Update the primary login for ${credentialsTarget.name}.`
            : ""
        }
      >
        <form onSubmit={handleCredentialsSubmit} className="space-y-5">
          <TextField
            label="Client user name"
            value={credentialsForm.clientName}
            onChange={(event) =>
              setCredentialsForm((current) => ({
                ...current,
                clientName: event.target.value,
              }))
            }
            required
          />
          <TextField
            label="Client user email"
            type="email"
            value={credentialsForm.clientEmail}
            onChange={(event) =>
              setCredentialsForm((current) => ({
                ...current,
                clientEmail: event.target.value,
              }))
            }
            required
          />
          <TextField
            label="Reset password"
            value={credentialsForm.clientPassword}
            onChange={(event) =>
              setCredentialsForm((current) => ({
                ...current,
                clientPassword: event.target.value,
              }))
            }
            placeholder="Leave empty to keep current password"
          />

          <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <LuKeyRound size={16} />
              Access note
            </div>
            <p className="mt-2 leading-6">
              CRM can directly correct login email or issue a password reset if the client requests account support.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCredentialsModalOpen(false)}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-lime-300 hover:bg-lime-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-[#163060] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20498f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Update credentials"}
            </button>
          </div>
        </form>
      </ModalShell>

      <ModalShell
        open={Boolean(generatedQrKit)}
        onClose={() => setGeneratedQrKit(null)}
        title="QR kit generated"
        description={
          generatedQrKit
            ? `A QR kit was generated for ${generatedQrKit.companyName}.`
            : ""
        }
      >
        {generatedQrKit ? (
          <div className="grid gap-5 md:grid-cols-[0.75fr_1.25fr]">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-center">
              <img
                src={generatedQrKit.qrImageUrl}
                alt="Generated QR"
                className="mx-auto h-56 w-56 rounded-2xl border border-slate-200 bg-white p-4"
              />
            </div>
            <div className="space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-500">Token</p>
                <p className="mt-2 break-all text-sm font-medium text-slate-900">
                  {generatedQrKit.token}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={getQrPdfDownloadUrl(generatedQrKit.token)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#163060] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20498f]"
                >
                  Download PDF
                </a>
                {generatedQrKit.pdfUrl ? (
                  <a
                    href={generatedQrKit.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-lime-300 hover:bg-lime-50"
                  >
                    Open hosted PDF
                  </a>
                ) : null}
                <a
                  href={generatedQrKit.qrImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-lime-300 hover:bg-lime-50"
                >
                  View QR image
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </ModalShell>
    </div>
  );
}

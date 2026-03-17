import { useEffect, useMemo, useState } from "react";
import { LuLink2, LuMail, LuQrCode, LuSend } from "react-icons/lu";
import {
  Badge,
  EmptyState,
  MetricCard,
  ModalShell,
  PageState,
  PanelCard,
  SectionHeading,
  SelectField,
  TextField,
} from "../components/Ui";
import QrManagementWizard from "../components/QrManagementWizard";
import {
  getQrPdfDownloadUrl,
  getQRCodes,
  shareQRCode,
} from "../services/crmApi";
import { formatDateTime, formatNumber, titleCase } from "../utils/formatters";

export default function QRCodesPage() {
  const [qrCodes, setQrCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successNote, setSuccessNote] = useState("");
  const [selectedQRCode, setSelectedQRCode] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareForm, setShareForm] = useState({ channel: "EMAIL", email: "" });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const getQrIdentifier = (item) => item?.id || item?._id || item?.token || "";

  const metrics = useMemo(() => {
    const shared = qrCodes.filter((item) => item.lastSharedAt).length;
    const scans = qrCodes.reduce((sum, item) => sum + Number(item.scans || 0), 0);

    return [
      {
        label: "Generated QR kits",
        value: formatNumber(qrCodes.length),
        detail: "Branded QR assets generated and managed by CRM.",
        icon: LuQrCode,
        tone: "blue",
      },
      {
        label: "Shared kits",
        value: formatNumber(shared),
        detail: "Assets already distributed to client teams.",
        icon: LuSend,
        tone: "lime",
      },
      {
        label: "Scans tracked",
        value: formatNumber(scans),
        detail: "Total landing-page scans across active QR journeys.",
        icon: LuQrCode,
        tone: "amber",
      },
    ];
  }, [qrCodes]);

  useEffect(() => {
    loadQrCodes();
  }, []);

  async function loadQrCodes() {
    setIsLoading(true);
    setPageError("");
    setSuccessNote("");

    try {
      const response = await getQRCodes();
      setQrCodes(response.data);
    } catch (requestError) {
      setPageError(requestError.message || "Unable to load QR management.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleShare = async (event) => {
    event.preventDefault();
    setIsSharing(true);
    setActionError("");

    try {
      const identifier = getQrIdentifier(selectedQRCode);
      if (!identifier) {
        throw new Error("Unable to identify the QR record.");
      }
      await shareQRCode(identifier, shareForm);
      await loadQrCodes();
      setIsShareModalOpen(false);
    } catch (requestError) {
      setActionError(requestError.message || "Unable to update share details.");
    } finally {
      setIsSharing(false);
    }
  };



  if (isLoading) {
    return <PageState title="Loading QR management..." />;
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
          eyebrow="QR creation"
          title="Generate a new branded QR kit"
          description="Generate a QR landing token, scannable image, and branded PDF kit for a company. Mandatory fields are marked with a red asterisk."
        />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Create a new QR kit without leaving this page.
          </p>
          <button
            type="button"
            onClick={() => {
              setIsCreateModalOpen(true);
              setActionError("");
              setSuccessNote("");
            }}
            className="rounded-2xl bg-[#163060] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20498f]"
          >
            Create / Generate QR
          </button>
        </div>
      </PanelCard>

      <PanelCard>
        <SectionHeading
          eyebrow="Generated assets"
          title="CRM-side QR history and sharing"
          description="Review every generated QR kit, open PDFs, inspect scan counts, and record sharing activity with client teams."
        />

        {successNote ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {successNote}
          </div>
        ) : null}

        {actionError ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {actionError}
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {qrCodes.length ? (
            qrCodes.map((item) => (
              <div
                key={item.id}
                className="rounded-[24px] border border-slate-200 p-5 transition hover:border-lime-300 hover:bg-lime-50/30"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">
                        {item.companyName}
                      </h3>
                      <Badge tone="blue">{item.jobTitle}</Badge>
                      <Badge tone={item.isActive ? "emerald" : "rose"}>
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">Token: {item.token}</p>
                    <p className="text-sm text-slate-500">
                      Shared via {titleCase(item.shareChannel || "manual")} with{" "}
                      {item.sharedWithEmail || "no recipient recorded"}
                    </p>
                    <p className="text-xs text-slate-400">
                      Created {formatDateTime(item.createdAt)} {"\u2022"}{" "}
                      {formatNumber(item.scans)} scans
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <a
                      href={item.qrImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-lime-300 hover:bg-lime-50"
                    >
                      <LuQrCode size={16} />
                      View QR
                    </a>
                    <a
                      href={getQrPdfDownloadUrl(item.token)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-lime-300 hover:bg-lime-50"
                    >
                      <LuMail size={16} />
                      Download PDF
                    </a>
                    {item.pdfUrl ? (
                      <a
                        href={item.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-lime-300 hover:bg-lime-50"
                      >
                        <LuLink2 size={16} />
                        Open PDF
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedQRCode(item);
                        setShareForm({
                          channel: item.shareChannel || "EMAIL",
                          email: item.sharedWithEmail || "",
                        });
                        setIsShareModalOpen(true);
                      }}
                      className="rounded-2xl bg-[#163060] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#20498f]"
                    >
                      Share record
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="No QR kits generated yet"
              description="Generate the first client QR workflow from the QR creation button above."
            />
          )}
        </div>
      </PanelCard>

      <ModalShell
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create / Generate QR"
        description="Generate a QR landing kit. Ensure all mandatory fields are filled before submitting."
        width="max-w-5xl"
      >
        <QrManagementWizard
          onGenerated={() => {
            loadQrCodes();
          }}
        />
      </ModalShell>


      <ModalShell
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Record QR sharing"
        description={
          selectedQRCode
            ? `Track how the QR kit for ${selectedQRCode.companyName} was shared with the client.`
            : ""
        }
      >
        <form onSubmit={handleShare} className="space-y-5">
          <SelectField
            label="Channel"
            value={shareForm.channel}
            onChange={(event) =>
              setShareForm((current) => ({ ...current, channel: event.target.value }))
            }
            options={[
              { label: "Email", value: "EMAIL" },
              { label: "App", value: "APP" },
              { label: "Manual", value: "MANUAL" },
            ]}
          />
          <TextField
            label="Recipient email"
            type="email"
            value={shareForm.email}
            onChange={(event) =>
              setShareForm((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="client@example.com"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(false)}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-lime-300 hover:bg-lime-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSharing}
              className="rounded-2xl bg-[#163060] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20498f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSharing ? "Saving..." : "Save share record"}
            </button>
          </div>
        </form>
      </ModalShell>

    </div>
  );
}

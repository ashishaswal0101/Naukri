function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

const badgeTones = {
  blue: "bg-[#163060]/8 text-[#163060]",
  lime: "bg-lime-100 text-lime-800",
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
  slate: "bg-slate-100 text-slate-700",
};

const accentTones = {
  blue: "from-[#163060] to-[#2856a6]",
  lime: "from-[#7fd000] to-[#b2f114]",
  emerald: "from-emerald-500 to-green-500",
  amber: "from-amber-500 to-orange-500",
  rose: "from-rose-500 to-pink-500",
  slate: "from-slate-500 to-slate-700",
};

export function PageState({ title, description, error = false }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-xl rounded-[28px] border border-slate-200 bg-white px-8 py-7 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          CRM Workspace
        </p>
        <h2
          className={cx(
            "mt-3 text-2xl font-bold",
            error ? "text-rose-700" : "text-slate-900",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

export function PanelCard({ className = "", children }) {
  return (
    <section
      className={cx(
        "rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 text-2xl font-bold text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function MetricCard({ label, value, detail, icon: Icon, tone = "blue" }) {
  return (
    <article className="group flex min-h-[184px] flex-col justify-between rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-1 hover:border-lime-300 hover:shadow-[0_20px_50px_rgba(132,204,22,0.16)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        {Icon ? (
          <div
            className={cx(
              "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white transition-transform duration-200 group-hover:scale-105",
              accentTones[tone] || accentTones.blue,
            )}
          >
            <Icon size={20} />
          </div>
        ) : null}
      </div>
      {detail ? <p className="mt-5 text-sm leading-6 text-slate-500">{detail}</p> : null}
    </article>
  );
}

export function Badge({ tone = "slate", children }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        badgeTones[tone] || badgeTones.slate,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

export function ModalShell({
  open,
  title,
  description,
  onClose,
  children,
  width = "max-w-2xl",
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8">
      <div
        className={cx(
          "max-h-[90vh] w-full overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.25)]",
          width,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-lime-300 hover:bg-lime-50 hover:text-slate-900"
          >
            Close
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function TextField({ label, required = false, className = "", ...props }) {
  return (
    <label className={cx("block", className)}>
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </span>
      <input
        {...props}
        required={required}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:bg-white"
      />
    </label>
  );
}

export function SelectField({
  label,
  options,
  required = false,
  className = "",
  ...props
}) {
  return (
    <label className={cx("block", className)}>
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </span>
      <select
        {...props}
        required={required}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:bg-white"
      >
        {options.map((option) => {
          const normalized =
            typeof option === "string"
              ? { label: option, value: option }
              : option;

          return (
            <option key={normalized.value} value={normalized.value}>
              {normalized.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}

export function TextAreaField({ label, required = false, className = "", ...props }) {
  return (
    <label className={cx("block", className)}>
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </span>
      <textarea
        {...props}
        required={required}
        className="mt-2 min-h-[120px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:bg-white"
      />
    </label>
  );
}

export function ToolbarInput({ icon: Icon, ...props }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition focus-within:border-lime-300 focus-within:bg-white">
      {Icon ? <Icon size={18} className="text-slate-400" /> : null}
      <input
        {...props}
        className="w-full bg-transparent outline-none placeholder:text-slate-400"
      />
    </label>
  );
}

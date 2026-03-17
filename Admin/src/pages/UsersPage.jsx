import { useEffect, useMemo, useState } from "react";
import {
  LuBadgeCheck,
  LuFilter,
  LuPencilLine,
  LuPlus,
  LuSearch,
  LuShieldCheck,
  LuTrash2,
  LuX,
} from "react-icons/lu";
import {
  createAdminUser,
  deleteAdminUser,
  getUsersData,
  updateAdminUser,
} from "../services/adminApi";

const defaultUserForm = {
  fullName: "",
  email: "",
  role: "CRM",
  department: "",
  scope: "",
  status: "ACTIVE",
  password: "",
};

const roleOptions = ["INTERNAL", "ALL", "ADMIN", "CRM", "FSE", "CLIENT", "CANDIDATE"];
const assignableRoleOptions = ["ADMIN", "CRM", "FSE", "CLIENT", "CANDIDATE"];
const statusOptions = ["ALL", "ACTIVE", "PENDING_INVITE", "RESTRICTED"];
const internalRoles = ["ADMIN", "CRM", "FSE"];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("INTERNAL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formState, setFormState] = useState(defaultUserForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !searchQuery.trim() ||
        `${user.fullName} ${user.email} ${user.scope} ${user.department}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === "ALL" ||
        (roleFilter === "INTERNAL"
          ? internalRoles.includes(user.role)
          : user.role === roleFilter);
      const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, searchQuery, statusFilter, users]);

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreateDrawer = () => {
    setEditingUser(null);
    setFormState(defaultUserForm);
    setActionError("");
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (user) => {
    setEditingUser(user);
    setFormState({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department || "",
      scope: user.scope || "",
      status: user.status,
      password: "",
    });
    setActionError("");
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setEditingUser(null);
    setFormState(defaultUserForm);
    setActionError("");
    setIsDrawerOpen(false);
  };

  async function loadUsers() {
    setIsLoading(true);
    setPageError("");

    try {
      const response = await getUsersData();
      setUsers(response.data.users);
      setMetrics(response.data.metrics);
    } catch (requestError) {
      setPageError(requestError.message || "Unable to load users.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSaveUser = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setActionError("");

    try {
      const payload = {
        fullName: formState.fullName.trim(),
        email: formState.email.trim(),
        role: formState.role,
        department: formState.department.trim(),
        scope: formState.scope.trim(),
        status: formState.status,
      };

      if (formState.password.trim()) {
        payload.password = formState.password.trim();
      }

      if (!editingUser && !payload.password) {
        throw new Error("Password is required when creating a user.");
      }

      if (editingUser) {
        await updateAdminUser({
          source: editingUser.source,
          id: editingUser.id,
          payload,
        });
      } else {
        await createAdminUser(payload);
      }

      await loadUsers();
      closeDrawer();
    } catch (requestError) {
      setActionError(requestError.message || "Unable to save user.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (user) => {
    setActionError("");

    try {
      await deleteAdminUser({
        source: user.source,
        id: user.id,
      });
      await loadUsers();
    } catch (requestError) {
      setActionError(requestError.message || "Unable to delete user.");
    }
  };

  if (isLoading) {
    return <PageState title="Loading user operations..." />;
  }

  if (pageError) {
    return <PageState title={pageError} error />;
  }

  const metricCards = [
    { label: "System users", value: metrics?.systemUsers ?? 0, tone: "slate" },
    { label: "Active accounts", value: metrics?.activeAccounts ?? 0, tone: "lime" },
    { label: "Pending invites", value: metrics?.pendingInvites ?? 0, tone: "amber" },
    { label: "Protected roles", value: metrics?.protectedRoles ?? 0, tone: "blue" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <article
            key={metric.label}
            className="group flex min-h-[170px] flex-col justify-between rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-1 hover:border-lime-300 hover:shadow-[0_20px_50px_rgba(132,204,22,0.16)]"
          >
            <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
            <div className="space-y-3">
              <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
              <MetricAccent tone={metric.tone} />
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              User operations
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Create and manage system users
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Search users, filter by role or status, and manage onboarding and
              account access from one place.
            </p>
          </div>

          <button
            onClick={openCreateDrawer}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#163060] px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#20498f] hover:shadow-[0_16px_40px_rgba(22,48,96,0.24)]"
          >
            <LuPlus size={16} />
            Create user
          </button>
        </div>

        {actionError ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {actionError}
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 xl:grid-cols-[1.3fr_0.7fr_0.7fr]">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition-colors duration-200 focus-within:border-lime-300 focus-within:bg-white">
            <LuSearch size={18} className="text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name, email, department, or scope"
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
            />
          </label>

          <FilterSelect
            icon={LuFilter}
            value={roleFilter}
            onChange={setRoleFilter}
            options={roleOptions}
          />

          <FilterSelect
            icon={LuBadgeCheck}
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <div className="grid grid-cols-[1.3fr_1.1fr_0.8fr_0.9fr_0.9fr_0.7fr] gap-3 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            <span>User</span>
            <span>Department</span>
            <span>Role</span>
            <span>Scope</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-slate-200">
            {filteredUsers.map((user) => (
              <div
                key={`${user.source}-${user.id}`}
                className="grid min-h-[92px] grid-cols-[1.3fr_1.1fr_0.8fr_0.9fr_0.9fr_0.7fr] items-center gap-3 px-5 py-4 text-sm transition-colors duration-200 hover:bg-lime-50/30"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {user.fullName}
                  </p>
                  <p className="mt-1 truncate text-slate-500">{user.email}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-700">
                    {user.department || "Unassigned"}
                  </p>
                  <p className="mt-1 truncate text-slate-500">{user.lastActive}</p>
                </div>
                <div>
                  <RoleBadge role={user.role} />
                </div>
                <p className="font-medium text-slate-700">
                  {user.scope || "Global"}
                </p>
                <div>
                  <StatusBadge status={user.status} />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <IconButton
                    label="Edit user"
                    icon={LuPencilLine}
                    onClick={() => openEditDrawer(user)}
                  />
                  <IconButton
                    label="Delete user"
                    icon={LuTrash2}
                    onClick={() => handleDeleteUser(user)}
                    destructive
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isDrawerOpen && (
        <UserDrawer
          formState={formState}
          setFormState={setFormState}
          onClose={closeDrawer}
          onSubmit={handleSaveUser}
          title={editingUser ? "Edit user" : "Create user"}
          isSaving={isSaving}
          editingUser={editingUser}
          error={actionError}
        />
      )}
    </div>
  );
}

function PageState({ title, error = false }) {
  return (
    <div className="mx-auto flex min-h-[420px] w-full max-w-7xl items-center justify-center">
      <div
        className={`rounded-[28px] border px-8 py-7 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] ${
          error ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-white"
        }`}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
          User Operations
        </p>
        <p className="mt-3 text-lg font-semibold text-slate-900">{title}</p>
      </div>
    </div>
  );
}

function MetricAccent({ tone }) {
  const accentClass =
    tone === "lime"
      ? "bg-lime-100 text-lime-800"
      : tone === "amber"
        ? "bg-amber-100 text-amber-800"
        : tone === "blue"
          ? "bg-sky-100 text-sky-800"
          : "bg-slate-100 text-slate-700";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${accentClass}`}>
      Live admin metric
    </span>
  );
}

function FilterSelect({ icon: Icon, value, onChange, options }) {
  const formatOptionLabel = (option) => {
    if (option === "ALL") return "All";
    if (option === "INTERNAL") return "Internal team";
    return option.replaceAll("_", " ");
  };

  return (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition-colors duration-200 focus-within:border-lime-300 focus-within:bg-white">
      <Icon size={18} className="text-slate-400" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {formatOptionLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function RoleBadge({ role }) {
  const toneClass =
    role === "ADMIN"
      ? "bg-[#163060]/10 text-[#163060]"
      : role === "CRM"
        ? "bg-sky-100 text-sky-800"
        : role === "FSE"
          ? "bg-lime-100 text-lime-800"
          : role === "CLIENT"
            ? "bg-violet-100 text-violet-800"
            : "bg-amber-100 text-amber-800";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {role}
    </span>
  );
}

function StatusBadge({ status }) {
  const toneClass =
    status === "ACTIVE"
      ? "bg-lime-100 text-lime-800"
      : status === "PENDING_INVITE"
        ? "bg-amber-100 text-amber-800"
        : "bg-rose-100 text-rose-800";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

function IconButton({ icon: Icon, label, onClick, destructive = false }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-200 ${
        destructive
          ? "border-rose-200 text-rose-600 hover:bg-rose-50"
          : "border-slate-200 text-slate-600 hover:border-lime-300 hover:bg-lime-50 hover:text-[#163060]"
      }`}
    >
      <Icon size={16} />
    </button>
  );
}

function UserDrawer({
  formState,
  setFormState,
  onClose,
  onSubmit,
  title,
  isSaving,
  editingUser,
  error,
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 px-4 py-4 backdrop-blur-sm">
      <div className="h-full w-full max-w-xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              User workflow
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-lime-300 hover:bg-lime-50"
          >
            <LuX size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5" autoComplete="off">
          <Field
            label="Full name"
            value={formState.fullName}
            onChange={(value) =>
              setFormState((current) => ({ ...current, fullName: value }))
            }
          />
          <Field
            label="Email"
            type="email"
            autoComplete="off"
            value={formState.email}
            onChange={(value) =>
              setFormState((current) => ({ ...current, email: value }))
            }
          />
          <Field
            label={editingUser ? "Password reset (optional)" : "Password"}
            type="password"
            autoComplete="new-password"
            value={formState.password}
            onChange={(value) =>
              setFormState((current) => ({ ...current, password: value }))
            }
          />
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Role"
              type="select"
              value={formState.role}
              options={assignableRoleOptions}
              onChange={(value) =>
                setFormState((current) => ({ ...current, role: value }))
              }
            />
            <Field
              label="Status"
              type="select"
              value={formState.status}
              options={statusOptions.slice(1)}
              onChange={(value) =>
                setFormState((current) => ({ ...current, status: value }))
              }
            />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Department"
              value={formState.department}
              onChange={(value) =>
                setFormState((current) => ({ ...current, department: value }))
              }
            />
            <Field
              label="Scope"
              value={formState.scope}
              onChange={(value) =>
                setFormState((current) => ({ ...current, scope: value }))
              }
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-lime-300 hover:bg-lime-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#163060] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20498f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LuShieldCheck size={16} />
              {isSaving ? "Saving..." : "Save user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", options = [], autoComplete }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {type === "select" ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:bg-white"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:bg-white"
        />
      )}
    </label>
  );
}

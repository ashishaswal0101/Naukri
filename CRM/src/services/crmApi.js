const API_ROOT =
  import.meta.env.VITE_CRM_API_URL || "http://localhost:3000/api/v1/crm-panel";
const CORE_API_ROOT =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const SESSION_KEY = "crm_panel_session";

const parseJsonSafely = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

export function getStoredSession() {
  const rawValue = sessionStorage.getItem(SESSION_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function setStoredSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getStoredCrmUser() {
  return getStoredSession()?.user || null;
}

function getStoredToken() {
  return getStoredSession()?.token || "";
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  return requestTo(API_ROOT, path, { method, body, auth });
}

async function requestTo(
  baseUrl,
  path,
  { method = "GET", body, auth = true } = {},
) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getStoredToken();

    if (!token) {
      throw new Error("Authentication required");
    }

    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    if (auth && [401, 403].includes(response.status)) {
      clearStoredSession();
    }

    throw new Error(payload.message || "Request failed");
  }

  return payload;
}

export function loginCrm(credentials) {
  return request("/auth/login", {
    method: "POST",
    body: credentials,
    auth: false,
  });
}

export function getCrmProfile() {
  return request("/auth/me");
}

export function getDashboardData() {
  return request("/dashboard");
}

export function getClients() {
  return request("/clients");
}

export function createClient(payload) {
  return request("/clients", {
    method: "POST",
    body: payload,
  });
}

export function updateClient(id, payload) {
  return request(`/clients/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function updateClientCredentials(id, payload) {
  return request(`/clients/${id}/credentials`, {
    method: "PATCH",
    body: payload,
  });
}

export function getJobs() {
  return request("/jobs");
}

export function createJob(payload) {
  return request("/jobs", {
    method: "POST",
    body: payload,
  });
}

export function updateJob(id, payload) {
  return request(`/jobs/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function getJobApprovals() {
  return request("/job-approvals");
}

export function updateJobApproval(id, payload) {
  return request(`/job-approvals/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function getPackages() {
  return request("/packages");
}

export function updatePackage(name, payload) {
  return request(`/packages/${name}`, {
    method: "PUT",
    body: payload,
  });
}

export function getQRCodes() {
  return request("/qr-codes");
}

export function getQRCode(id) {
  return request(`/qr-codes/${id}`);
}

export function createQRCode(payload) {
  return request("/qr-codes", {
    method: "POST",
    body: payload,
  });
}

export function updateQRCode(id, payload) {
  return request(`/qr-codes/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function shareQRCode(id, payload) {
  return request(`/qr-codes/${id}/share`, {
    method: "PATCH",
    body: payload,
  });
}

export function getApplications() {
  return request("/applications");
}

export function updateApplicationStatus(id, payload) {
  return request(`/applications/${id}/status`, {
    method: "PATCH",
    body: payload,
  });
}

export function getNotifications() {
  return request("/notifications");
}

export function createNotification(payload) {
  return request("/notifications", {
    method: "POST",
    body: payload,
  });
}

export function getAnalytics() {
  return request("/analytics");
}

export function getSettings() {
  return request("/settings");
}

export function updateSettings(payload) {
  return request("/settings", {
    method: "PATCH",
    body: payload,
  });
}

export function generateManagedQRCode(payload) {
  return requestTo(CORE_API_ROOT, "/qr/generate", {
    method: "POST",
    body: payload,
  });
}

export function getQrPdfDownloadUrl(token) {
  return `${CORE_API_ROOT}/qr/download/${token}`;
}

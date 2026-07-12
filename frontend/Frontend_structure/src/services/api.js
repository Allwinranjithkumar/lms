const DEFAULT_API_BASE_URL = "http://localhost:8000/api";

function normalizeApiBaseUrl(value) {
  const baseUrl = String(value || DEFAULT_API_BASE_URL).trim().replace(/\/+$/, "");
  return baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
}

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

const SESSION_KEY = "jawa-edtech-session";

function readStorage(storage) {
  try {
    const raw = storage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getSession() {
  return readStorage(localStorage) || readStorage(sessionStorage);
}

export function getToken() {
  return getSession()?.token || "";
}

export function saveSession(payload, remember = true) {
  const session = JSON.stringify(payload);
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);

  if (remember) {
    localStorage.setItem(SESSION_KEY, session);
  } else {
    sessionStorage.setItem(SESSION_KEY, session);
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function redirectPathForRole(role) {
  return role === "teacher" ? "/teacher" : "/student";
}

export function isAuthorizedForRole(role) {
  const session = getSession();
  return Boolean(session?.token && session?.user?.role === role);
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = options.token ?? getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: isFormData || typeof options.body === "string"
      ? options.body
      : options.body
        ? JSON.stringify(options.body)
        : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }
    throw new Error(data.detail || "Request failed.");
  }

  return data;
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export function loginUser(payload) {
  return apiRequest("/auth/login", { method: "POST", token: "", body: payload });
}

export function registerUser(payload) {
  return apiRequest("/auth/register", { method: "POST", token: "", body: payload });
}

export function socialLogin(payload) {
  return apiRequest("/auth/social", { method: "POST", token: "", body: payload });
}

export function getMe() {
  return apiRequest("/auth/me");
}

export function updateProfile(payload) {
  return apiRequest("/auth/profile", { method: "PATCH", body: payload });
}

// ─── Courses ───────────────────────────────────────────────────────────────

export function getCourses(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/courses${query ? "?" + query : ""}`);
}

export function getPublicCourses(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/courses/public${query ? "?" + query : ""}`);
}

export function createCourse(payload) {
  return apiRequest("/courses", { method: "POST", body: payload });
}

export function updateCourse(id, payload) {
  return apiRequest(`/courses/${id}`, { method: "PATCH", body: payload });
}

export function deleteCourse(id) {
  return apiRequest(`/courses/${id}`, { method: "DELETE" });
}

export function enrollCourse(id) {
  return apiRequest(`/courses/${id}/enroll`, { method: "POST" });
}

// ─── Dashboards ────────────────────────────────────────────────────────────

export function getStudentDashboard() {
  return apiRequest("/student/dashboard");
}

export function getTeacherDashboard() {
  return apiRequest("/teacher/dashboard");
}

export function getTeacherCourses() {
  return apiRequest("/teacher/courses");
}

export function getTeacherStudents() {
  return apiRequest("/teacher/students");
}

export function getTeacherAnalytics() {
  return apiRequest("/analytics/teacher");
}

// ─── Live Classes ──────────────────────────────────────────────────────────

export function getLiveClasses() {
  return apiRequest("/live-classes");
}

export function createLiveClass(payload) {
  return apiRequest("/live-classes", { method: "POST", body: payload });
}

export function startLiveClass(id) {
  return apiRequest(`/live-classes/${id}/start`, { method: "PATCH" });
}

export function endLiveClass(id) {
  return apiRequest(`/live-classes/${id}/end`, { method: "PATCH" });
}

export function markLiveClassAttendance(id, payload = {}) {
  return apiRequest(`/live-classes/${id}/attendance`, { method: "POST", body: payload });
}

// ─── Assignments ───────────────────────────────────────────────────────────

export function getAssignments(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/assignments${query ? "?" + query : ""}`);
}

export function createAssignment(payload) {
  return apiRequest("/assignments", { method: "POST", body: payload });
}

export function submitAssignment(id, payload) {
  return apiRequest(`/assignments/${id}/submit`, { method: "POST", body: payload });
}

export function getAssignmentSubmissions(id) {
  return apiRequest(`/assignments/${id}/submissions`);
}

export function gradeSubmission(id, payload) {
  return apiRequest(`/submissions/${id}/grade`, { method: "PATCH", body: payload });
}

// ─── Resources ─────────────────────────────────────────────────────────────

export function getResources(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/resources${query ? "?" + query : ""}`);
}

export function uploadResource(formData) {
  return apiRequest("/resources", { method: "POST", body: formData });
}

export function deleteResource(id) {
  return apiRequest(`/resources/${id}`, { method: "DELETE" });
}

export function getResourceDownloadUrl(id) {
  const token = getSession()?.token || "";
  return `${API_BASE_URL}/resources/${id}/download?token=${token}`;
}

// ─── Messages ─────────────────────────────────────────────────────────────

export function getConversations() {
  return apiRequest("/messages/conversations");
}

export function sendMessage(payload) {
  return apiRequest("/messages", { method: "POST", body: payload });
}

export function broadcastMessage(payload) {
  return apiRequest("/messages/broadcast", { method: "POST", body: payload });
}

export function markConversationRead(id) {
  return apiRequest(`/messages/conversations/${id}/read`, { method: "PATCH" });
}

export function getContacts() {
  return apiRequest("/users/contacts");
}

// ─── Notifications ─────────────────────────────────────────────────────────

export function getNotifications() {
  return apiRequest("/notifications");
}

export function markAllNotificationsRead() {
  return apiRequest("/notifications/read-all", { method: "PATCH" });
}

export function markNotificationRead(id) {
  return apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
}

// ─── Certificates ──────────────────────────────────────────────────────────

export function getCertificates() {
  return apiRequest("/certificates");
}

export function issueCertificate(payload) {
  return apiRequest("/certificates/issue", { method: "POST", body: payload });
}

export function verifyCertificate(credentialId) {
  return apiRequest(`/certificates/verify/${credentialId}`);
}

// ─── Students (teacher only) ───────────────────────────────────────────────

export function getStudents() {
  return apiRequest("/teacher/students");
}



// ─── AI ────────────────────────────────────────────────────────────────────

export function runTeacherAITool(payload) {
  return apiRequest("/ai/teacher-tool", { method: "POST", body: payload });
}

export function runStudentAI(payload) {
  return apiRequest("/ai/student-assistant", { method: "POST", body: payload });
}

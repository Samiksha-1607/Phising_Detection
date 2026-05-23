import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

const handleResponse = (response) => response.data;
const handleError = (error) => {
  const message = error?.response?.data?.error || error.message || "Request failed";
  throw new Error(message);
};

export const api = {
  login: (email, password) =>
    apiClient
      .post("/login", { email, password })
      .then(handleResponse)
      .catch(handleError),
  getInbox: (email) =>
    apiClient
      .get(`/inbox/${encodeURIComponent(email)}`)
      .then(handleResponse)
      .catch(handleError),
  sendEmail: (payload) =>
    apiClient
      .post("/send-email", payload)
      .then(handleResponse)
      .catch(handleError),
  markEmailRead: (emailId) =>
    apiClient
      .patch(`/email/${emailId}/read`)
      .then(handleResponse)
      .catch(handleError),
  scanUrl: (url, emailId) =>
    apiClient
      .post("/scan-url", { url, email_id: emailId })
      .then(handleResponse)
      .catch(handleError),
  submitReport: (payload) =>
    apiClient
      .post("/report", payload)
      .then(handleResponse)
      .catch(handleError),
  getReports: () =>
    apiClient
      .get("/reports")
      .then(handleResponse)
      .catch(handleError),
  actionReport: (reportId, payload) =>
    apiClient
      .patch(`/report/${reportId}/action`, payload)
      .then(handleResponse)
      .catch(handleError),
  getStats: () =>
    apiClient
      .get("/stats")
      .then(handleResponse)
      .catch(handleError),
};

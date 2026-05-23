import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import AttackerInbox from "./pages/AttackerInbox";
import VictimInbox from "./pages/VictimInbox";
import AdminDashboard from "./pages/AdminDashboard";

function ProtectedRoute({ children, role }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/" replace />;
  if (role && session.role !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/attacker"
        element={
          <ProtectedRoute role="attacker">
            <AttackerInbox />
          </ProtectedRoute>
        }
      />
      <Route
        path="/victim"
        element={
          <ProtectedRoute role="victim">
            <VictimInbox />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

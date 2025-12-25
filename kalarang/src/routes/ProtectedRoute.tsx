import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
    import { ReactElement } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: ReactElement;
}) {
  const { firebaseUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!firebaseUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}

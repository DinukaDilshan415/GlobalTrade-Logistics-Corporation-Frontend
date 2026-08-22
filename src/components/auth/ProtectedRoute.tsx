// ProtectedRoute.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRoles?: string[];
}

export const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
    const { token, roles, isLoading } = useAuth();

    const PulsingDots = () => {
        return (
            <div className="flex items-center justify-center space-x-2 mt-60">
                <div className="h-20 w-20 animate-pulse rounded-full bg-blue-500 [animation-delay:-0.3s]"></div>
                <div className="h-20 w-20 animate-pulse rounded-full bg-blue-500 [animation-delay:-0.15s]"></div>
                <div className="h-20 w-20 animate-pulse rounded-full bg-blue-500"></div>
            </div>
        );
    };

    if (isLoading) {
        // still checking auth status (e.g. attempting silent refresh on app load)
        return <div><PulsingDots /></div>;
    }

    if (!token) {
        if(!requiredRoles?.indexOf("admin")){
           return <Navigate to="/admin/login" replace />
        } 
        return <Navigate to="/" replace />;
    }

    if (requiredRoles && requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some((role) => roles?.includes(role));
        if (!hasRequiredRole) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return <>{children}</>;
};
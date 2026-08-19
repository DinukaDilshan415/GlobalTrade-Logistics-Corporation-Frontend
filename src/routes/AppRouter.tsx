import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "../components/login/Login";
import Home from "../components/Home";
import { TrackingDetails } from "../components/Tracking/TrackingDetails";
import AdminLogin from "../components/Admin/AdminLogin";
import AdminDashboard from "../components/Admin/AdminDashboard";
import Test from "../components/Test";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import UnauthorizedPage from "../components/UnauthorizedPage";
import VendorAccountRequest from "../components/user/VendorAccountRequest";
import VendorProfile from "../components/user/VendorProfile";

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      //   <GuestRoute>
      <Login />
      //   </GuestRoute>
    ),
  },
  {
    path: "/unauthorized",
    Component: UnauthorizedPage
  },
  {
    path: "/",
    Component: Home
  },
  {
    path: "/test",
    Component: Test
  },
  {
    path: "/tracking",
    Component: TrackingDetails
  },
  {
    path: "/admin/login",
    Component: AdminLogin
  },
  {
    path: "/admin/dashboard",
    element: (
      // <ProtectedRoute requiredRoles={["admin", "manager"]}>
      <AdminDashboard />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/open-vender-account",
    element: (
      <ProtectedRoute requiredRoles={["customer"]}>
        <VendorAccountRequest />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute requiredRoles={["customer"]}>
        <VendorProfile />
      </ProtectedRoute>
    ),
  },

]);

const AppRouter = () => {
  return (<><RouterProvider router={router} /></>)
}

export default AppRouter
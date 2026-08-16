import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "../components/login/Login";
import Home from "../components/Home";
import { TrackingDetails } from "../components/Tracking/TrackingDetails";
import AdminLogin from "../components/Admin/AdminLogin";
import AdminDashboard from "../components/Admin/AdminDashboard";

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
    //   <GuestRoute>
        <Login/>
    //   </GuestRoute>
    ),
  },
  {
    path: "/",
    Component: Home
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
    Component: AdminDashboard
  },

]);

const AppRouter = () => {
  return (<><RouterProvider router={router} /></>)
}

export default AppRouter
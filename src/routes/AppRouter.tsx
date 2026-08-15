import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "../components/login/Login";
import Home from "../components/Home";

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

]);

const AppRouter = () => {
  return (<><RouterProvider router={router} /></>)
}

export default AppRouter
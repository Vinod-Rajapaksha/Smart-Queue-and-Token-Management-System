import { createBrowserRouter } from "react-router-dom";
import HomePage from "../../pages/HomePage";
import NotFoundPage from "../../pages/NotFoundPage";
import UnauthorizedPage from "../../pages/UnauthorizedPage";
import LoginPage from "../../pages/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import { ADMIN_PORTAL_ROLES } from "../../types/enums";
import AdminLayout from "../../layouts/AdminLayout";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/unauthorized", element: <UnauthorizedPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            element: <RoleRoute allowed={ADMIN_PORTAL_ROLES} />,
            children: [
              { path: "/", element: <HomePage /> },
            ],
          },
        ],
      },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);

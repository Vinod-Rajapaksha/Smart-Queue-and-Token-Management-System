import { createBrowserRouter, Navigate } from "react-router-dom";
import HomePage from "../../pages/HomePage";
import NotFoundPage from "../../pages/NotFoundPage";
import UnauthorizedPage from "../../pages/UnauthorizedPage";
import LoginPage from "../../pages/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import { ADMIN_PORTAL_ROLES } from "../../types/enums";
import AdminLayout from "../../layouts/AdminLayout";
import ProfilePage from "../../features/profile/pages/ProfilePage";
import { BranchListPage, BranchDetailsPage } from "../../features/branch";
import { CounterPage } from "../../features/counter";
import { QueueListPage, QueueLivePage } from "../../features/queue";
import { TokenListPage } from "../../features/token";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/unauthorized", element: <UnauthorizedPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      { 
        path: "/admin",
        element: <AdminLayout />,
        children: [
          {
            element: <RoleRoute allowed={ADMIN_PORTAL_ROLES} />,
            children: [
              { index: true, element: <HomePage /> },
              { path: "profile", element: <ProfilePage /> },
              { path: "branches", element: <BranchListPage /> },
              { path: "branches/:id", element: <BranchDetailsPage /> },
              { path: "counters", element: <CounterPage /> },
              { path: "queues", element: <QueueListPage /> },
              { path: "queues/live", element: <QueueLivePage /> },
              { path: "tokens", element: <TokenListPage /> },
            ],
          },
        ],
      },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);

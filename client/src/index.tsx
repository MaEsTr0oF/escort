import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ContactAdminPage from './pages/ContactAdminPage';
import LoginPage from './pages/admin/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CitiesPage from './pages/admin/CitiesPage';
import SettingsPage from './pages/admin/SettingsPage';
import ProfilesPage from './pages/admin/ProfilesPage';
import EditProfilePage from './pages/admin/EditProfilePage';
import ProfilesManagementPage from './pages/admin/ProfilesManagementPage';
import AdminLayout from './components/admin/AdminLayout';

// Создаем роутер с явным определением всех маршрутов
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "profile/:id",
        element: <ProfilePage />
      },
      {
        path: "add-profile",
        element: <ContactAdminPage />
      },
      {
        path: "admin/login",
        element: <LoginPage />
      },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          {
            path: "dashboard",
            element: <AdminDashboard />
          },
          {
            path: "profiles",
            element: <ProfilesPage />
          },
          {
            path: "profiles-management",
            element: <ProfilesManagementPage />
          },
          {
            path: "profiles/new",
            element: <EditProfilePage />
          },
          {
            path: "profiles/:id/edit",
            element: <EditProfilePage />
          },
          {
            path: "cities",
            element: <CitiesPage />
          },
          {
            path: "settings",
            element: <SettingsPage />
          }
        ]
      }
    ]
  }
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();

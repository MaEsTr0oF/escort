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
import AdminLayout from './components/admin/AdminLayout';
import { Navigate } from 'react-router-dom';

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
            path: "profiles/new",
            element: <Navigate to="/admin/profiles" replace />
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

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./Pages/HomePage.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import SignupPage from "./Pages/SignupPage.jsx";
import OrganizeRoute from "./lib/OrganizeRoute.jsx";
import OrganizePage from "./Pages/OrganizePage.jsx";
import ViewEventPage from "./Pages/ViewEventPage.jsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/organize", element: <OrganizeRoute /> },
      { path: "/create-draft/:id", element: <OrganizePage /> },
      {path: "/view-event", element : <ViewEventPage/>}
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

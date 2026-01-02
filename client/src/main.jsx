import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./Pages/HomePage.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import SignupPage from "./Pages/SignupPage.jsx";
import OrganizeRoute from "./lib/OrganizeRoute.jsx";
import OrganizePage from "./Components/DashBoardComponents/OrganizePage.jsx";
import ViewEventPage from "./Pages/ViewEventPage.jsx";
import CreateInventoryPage from "./Components/DashBoardComponents/CreateInventoryPage.jsx";
import PaymentPage from "./Pages/PaymentPage.jsx";
import TicketDetailsPage from "./Pages/TicketDetailsPage.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Manage from "./Components/DashBoardComponents/Manage.jsx";
import CreateEventPage from "./Components/DashBoardComponents/CreateEventPage.jsx";
import ViewEditInventory from "./Components/DashBoardComponents/veInventory.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/organize", element: <OrganizeRoute /> },
      { path: "/view-event", element: <ViewEventPage /> },
      { path: "/ticket-details/:eventId", element: <TicketDetailsPage /> },
      { path: "/payment/:reservationId", element: <PaymentPage /> },
      {
        path: "/dashboard",
        element: <Dashboard />,
        children: [
          { index: true, element: <Manage /> },
          { path: "drafts", element: <OrganizePage /> },
          { path: "drafts/:id", element: <OrganizePage /> },
          { path: "create-bookings/:id", element: <CreateInventoryPage /> },
          { path: "edit-inventory/:id", element: <ViewEditInventory /> },
          {
            path: "create-event",
            element: <CreateEventPage />, //create-bookings/${creatingEventId}
          },
        ],
      },
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

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
import CreateInventoryPage from "./Pages/CreateInventoryPage.jsx";
import PaymentPage from "./Pages/PaymentPage.jsx";
import TicketDetailsPage from "./Pages/TicketDetailsPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/organize", element: <OrganizeRoute /> },
      { path: "/create-draft/:id", element: <OrganizePage /> },
      {path: "/view-event", element : <ViewEventPage/>},
      {path: "/ticket-details/:eventId", element : <TicketDetailsPage/>},
      {path: "/create-bookings/:id", element : <CreateInventoryPage/>},
      {path: "/payment/:reservationId", element : <PaymentPage/>}
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

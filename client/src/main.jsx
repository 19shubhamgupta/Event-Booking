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
import ManageTheatrePage from "./Components/TheatreComponents/ManageTheatrePage.jsx";
import TheatreRoute from "./Components/TheatreComponents/TheatreRoute.jsx";
import AddScreenPage from "./Components/TheatreComponents/AddScreenPage.jsx";
import AddShowPage from "./Components/TheatreComponents/AddShowPage.jsx";
import SelectShowPage from "./Pages/SelectShowPage.jsx";
import AddMoviePage from "./Pages/AddMoviePage.jsx";
import SeatSelectionPage from "./Pages/SeatSelectionPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/organize", element: <OrganizeRoute /> },
      { path: "/view-event", element: <ViewEventPage /> },
      { path: "/view-show/:movieId", element: <SelectShowPage /> },
      { path: "/seat-selection/:showId", element: <SeatSelectionPage /> },
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
          {
            path: "theatre",
            element: <TheatreRoute />,
          },
          {
            path: "manage-theatre",
            element: <ManageTheatrePage />,
          },
          {
            path: "theatre/add-screen",
            element: <AddScreenPage />,
          },
          {
            path: "theatre/add-show",
            element: <AddShowPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/add-movie",
    element: <AddMoviePage />,
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
]);

createRoot(document.getElementById("root")).render(
  
    <RouterProvider router={router} />
  
);

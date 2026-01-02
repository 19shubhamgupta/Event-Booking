import { useOrganizationStore } from "../store/useOrganization.js";
import CreateOrganizationPage from "../Pages/CreateOrganizationPage.jsx";
import { Navigate } from "react-router-dom";

const OrganizeRoute = () => {
  
  const { organization } = useOrganizationStore();
  return organization
    ? <Navigate to="/dashboard/create-event" replace />
    : <CreateOrganizationPage />;
};

export default OrganizeRoute;

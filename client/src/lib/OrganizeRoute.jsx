import { useOrganizationStore } from "../store/useOrganization.js";
import CreateEventPage from "../Components/DashBoardComponents/CreateEventPage.jsx";
import CreateOrganizationPage from "../Pages/CreateOrganizationPage.jsx";

const OrganizeRoute = () => {
  const { organization } = useOrganizationStore();
  return organization ? <CreateEventPage /> : <CreateOrganizationPage />;
};

export default OrganizeRoute;

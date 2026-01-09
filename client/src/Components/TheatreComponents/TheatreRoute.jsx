import { useTheatreStore } from "../../store/useTheatreStore";
import { Navigate } from "react-router-dom";
import CreateTheatrePage from "./CreateTheatrePage";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { useOrganizationStore } from "../../store/useOrganization";

const TheatreRoute = () => {
  const { theatre, fetchingTheatre, getTheatreByOwnerId } = useTheatreStore();
  const {organization} = useOrganizationStore()

  useEffect(() => {
    if(organization)getTheatreByOwnerId(organization._id);
  }, [getTheatreByOwnerId]);

  // Show loader while fetching theatre data
  if (fetchingTheatre) {
    return (
      <div className="flex h-screen pt-16 items-center justify-center">
        <div className="text-center">
          <Loader className="h-16 w-16 text-[#6d27da] mx-auto mb-4 animate-spin" />
          <p className="text-xl text-gray-600">Loading theatre...</p>
        </div>
      </div>
    );
  }

  // Redirect if theatre exists, otherwise show create page
  return theatre ? (
    <Navigate to="/dashboard/manage-theatre" replace />
  ) : (
    <CreateTheatrePage />
  );
};

export default TheatreRoute;

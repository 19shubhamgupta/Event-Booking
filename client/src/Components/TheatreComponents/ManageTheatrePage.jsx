import { Film, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";

// will have all ongoing show details
// and have a two options to add screens and and shows

const ManageTheatrePage = () => {
    const navigate = useNavigate()
  const handleAddScreen = () => {
    // Add screen logic
    navigate('/dashboard/theatre/add-screen');
  };

  const handleCreateShow = () => {
    // Create show logic
    navigate('/dashboard/theatre/add-show');
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 ">Manage Theatre</h1>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {/* Add Screen Button */}
          <button
            onClick={handleAddScreen}
            className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border-2 border-transparent hover:border-[#6d27da] transform hover:-translate-y-0.5"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#6d27da] transition-colors duration-300">
                <LayoutGrid className="w-7 h-7 text-[#6d27da] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Add Screen
              </h3>
              <p className="text-sm text-purple-600 font-semibold ">
                Create new screens for your theatre
              </p>
            </div>
          </button>

          {/* Create Show Button */}
          <button
            onClick={handleCreateShow}
            className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border-2 border-transparent hover:border-[#6d27da] transform hover:-translate-y-0.5"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#6d27da] transition-colors duration-300">
                <Film className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Create Show
              </h3>
              <p className="text-sm text-purple-600 font-semibold">
                Schedule new shows and movie screenings
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageTheatrePage;

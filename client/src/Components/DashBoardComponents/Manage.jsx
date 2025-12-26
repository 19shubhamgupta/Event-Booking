import React, { useEffect, useState } from "react";
import { useOrganizationStore } from "../../store/useOrganization";
import { Calendar } from "lucide-react";
import Card from "./Card";

const Manage = () => {
  const { getInventoryForDashByStatus } = useOrganizationStore();
  const [draftInventories, setDraftInventories] = useState([]);

  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchDraftInventories();
  }, []);

  const fetchDraftInventories = async () => {
    setLoading(true);
    try {
      const inventories = await getInventoryForDashByStatus("draft");
      console.log("invent in manage with status ${draft} : ", inventories);
      
      setDraftInventories(inventories || []);
    } catch (error) {
      console.error("Error fetching draft inventories:", error);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6d27da] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Ready to Go Events
        </h1>
      </div>

      {/* Cards Grid */}
      {draftInventories.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-white rounded-lg shadow-md p-12 max-w-md mx-auto">
            <div className="w-20 h-20 bg-[#e7dbf8] rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-[#6d27da]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Draft Inventories
            </h3>
            <p className="text-gray-600">
              Create an event inventory to get started
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {draftInventories.map((inventory) => (
            <Card inventory={inventory}/>
          ))}
        </div>
      )}
    </div>
  );
};

export default Manage;

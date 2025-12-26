import React, { useEffect, useState } from "react";
import ToolBox from "../PageEditor/ToolBox";
import Canvas from "../PageEditor/Canvas";
import useEditorStore from "../../store/useEditorstore";
import Inspector from "../PageEditor/Inspector";
import { useNavigate, useParams } from "react-router-dom";
import { useOrganizationStore } from "../../store/useOrganization";

const OrganizePage = () => {
  const {
    getCurrentPage,
    currentPage,
    saveToDb,
    createPage,
    initNewPage,
    setSaving,
    isSaving,
    isLoading,
  } = useEditorStore();

  const { creatingEventId, clearCreatingEventId } = useOrganizationStore();

  useEffect(() => {
    console.log("creatingEventID in OrganizePage: ", creatingEventId);
  }, [creatingEventId]);

  const { id } = useParams();

  const navigate = useNavigate();

  // Check if we're in create mode (no id) or edit mode (has id)
  const isCreateMode = !id;

  // Track if initialization is complete
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(false);

    if (id) {
      // Edit mode: fetch existing page
      getCurrentPage(id).finally(() => setIsInitialized(true));
    } else {
      // Create mode: initialize empty page
      initNewPage();
      setIsInitialized(true);
    }
    console.log(
      "rendered organizepage, mode:",
      isCreateMode ? "create" : "edit"
    );
  }, [id]);

  //handle save button
  async function handleSave() {
    console.log("save called : ", currentPage);
    setSaving(true);

    if (isCreateMode && !currentPage._id) {
      // First save - create new page in DB
      const newPage = await createPage(currentPage);
      if (newPage?._id) {
        // Navigate to edit mode with the new page id
        navigate(`/dashboard/drafts/${newPage._id}`, { replace: true });
      }
    } else {
      // Update existing page
      await saveToDb(currentPage);
    }

    setSaving(false);
  }

  //handle Publish button
  async function handleNext() {
    console.log("next called : ", currentPage);
    if (creatingEventId) {
      await saveToDb(currentPage);
      clearCreatingEventId(); // Clear the event ID after navigation
      navigate(`/dashboard/create-bookings/${creatingEventId}`);
    }
  }

  const ControlBtns = () => {
    return (
      <div className="flex ml-3 gap-2">
        <button
          className="flex items-center bg-[#6d27da] text-[#e7dbf8] gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-[#e7dbf8] hover:text-[#6d27da]"
          style={{
            border: "1px solid #e7dbf8",
          }}
          onClick={handleSave}
          disabled={isSaving}
        >
          Save
        </button>
        {creatingEventId && (
          <button
            className="flex items-center bg-[#6d27da] text-[#e7dbf8] gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-[#e7dbf8] hover:text-[#6d27da]"
            style={{
              border: "1px solid #e7dbf8",
            }}
            onClick={handleNext}
          >
            Next
          </button>
        )}
      </div>
    );
  };

  // Show loading spinner while fetching page or initializing
  if (isLoading || !isInitialized) {
    return (
      <div className="flex h-screen pt-16 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#6d27da] mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  // Show error if no page loaded (only in edit mode)
  if (!currentPage && !isLoading && !isCreateMode) {
    return (
      <div className="flex h-screen pt-16 items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">Failed to load page</p>
          <button
            onClick={() => getCurrentPage(id)}
            className="mt-4 px-4 py-2 bg-[#6d27da] text-white rounded-lg hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen pt-16">
      {/* Toolbox - Left Sidebar */}
      <ToolBox />

      {/* Canvas - Main Editor Area */}
      <Canvas ControlBtns={ControlBtns} />

      {/* Inspector - Right Sidebar */}
      <Inspector />
    </div>
  );
};

export default OrganizePage;

/*
this is a page which will show inventory data that we are geeting from getInventoryById , also refer the model as well as create event page and createinventory page , i want you to show here struct similar to those form keep it in two parts 1st is create event page part second is create inventory part its possible that you dont have some data as compared to model for eg 
_id
694ed17e3eabfb9b17b49d1b
eventId
"694ed17d757c5e5e0226fc6b"
organizationId
"6941acceb92b2d8f1dbba855"
eventTitle
"Tech Innovation Conference 2025"
eventCategory
"Conference"
eventStatus
"draft"
startDate
"2025-12-28"
endDate
"2025-12-30"
startTime
"10:00"
endTime
"17:30"

location
Object

ticketTypes
Array (empty)
totalCapacity
0
totalAvailable
0
totalReserved
0
totalSold
0
isSoldOut
false

bookingSettings
Object

bookingStats
Object
activeReservations
0
lastSyncedAt
2025-12-26T18:18:38.054+00:00
createdAt
2025-12-26T18:18:38.096+00:00
updatedAt
2025-12-26T18:18:38.096+00:00
__v
0 but still show and handle everything properly. 
*/

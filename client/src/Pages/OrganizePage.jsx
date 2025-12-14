import React, { useEffect } from "react";
import ToolBox from "../Components/PageEditor/ToolBox";
import Canvas from "../Components/PageEditor/Canvas";
import useEditorStore from "../store/useEditorstore";
import Inspector from "../Components/PageEditor/Inspector";
import { useParams } from "react-router-dom";

const OrganizePage = () => {
  const {
    getCurrentPage,
    currentPage,
    saveToDb,
    setSaving,
    isSaving,
    isLoading,
  } = useEditorStore();

  const { id } = useParams();
  
  useEffect(() => {
    if (id) {
      getCurrentPage(id);
    }
    console.log("rendered organizepage")
  }, [id, getCurrentPage]);

  //handle save button
  async function handleSave() {
    console.log("save called : ", currentPage);
    setSaving(true);
    await saveToDb(currentPage);
    setSaving(false);
  }

  //handle Publish button
  function handlePublish() {
    console.log("publish called : ", currentPage);
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
        <button
          className="flex items-center bg-[#6d27da] text-[#e7dbf8] gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-[#e7dbf8] hover:text-[#6d27da]"
          style={{
            border: "1px solid #e7dbf8",
          }}
          onClick={handlePublish}
        >
          Publish
        </button>
      </div>
    );
  };

  // Show loading spinner while fetching page
  if (isLoading) {
    return (
      <div className="flex h-screen pt-16 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#6d27da] mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  // Show error if no page loaded
  if (!currentPage && !isLoading) {
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

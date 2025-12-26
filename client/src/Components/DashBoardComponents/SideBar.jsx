import React, { useState, useEffect } from "react";
import {
  MdEventNote,
  MdDrafts,
  MdAddCircle,
  MdMenu,
  MdClose,
  MdAdd,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
} from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useOrganizationStore } from "../../store/useOrganization";

const Sidebar = ({ open, setOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [draftsOpen, setDraftsOpen] = useState(false);

  const { organization, allDrafts, fetchingAllDrafts, getAllDrafts } =
    useOrganizationStore();

  // Fetch drafts when drafts submenu is opened
  useEffect(() => {
    if (draftsOpen && organization?._id && !allDrafts) {
      getAllDrafts(organization._id);
    }
  }, [draftsOpen, organization?._id, allDrafts, getAllDrafts]);

  const menus = [
    {
      name: "Manage",
      link: "/dashboard",
      icon: MdEventNote,
    },
    {
      name: "Create Event",
      link: "/dashboard/create-event",
      icon: MdAddCircle,
    },
  ];

  return (
    <div
      className={`h-[calc(100vh-64px)] ${
        open ? "w-64" : "w-16"
      } duration-300 text-gray-800 px-3 fixed left-0 top-19 pt-4 border-r-3 border-purple-800 bg-[#e7dbf8] flex flex-col`}
      style={{
        zIndex: 40,
      }}
    >
      {/* Toggle Button - FAB style */}
      <div className="flex justify-end mb-2 flex-shrink-0">
        <button
          onClick={() => setOpen(!open)}
          className="w-10 h-10 flex items-center justify-center text-[#6d27da] mb-2"
        >
          {open ? <MdClose size="20" /> : <MdMenu size="20" />}
        </button>
      </div>

      <div
        className="flex flex-col gap-2 flex-1 overflow-y-auto"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#a855f7 transparent",
        }}
      >
        {menus.map((menu, i) => {
          const isActive = location.pathname === menu.link;
          return (
            <Link
              key={i}
              to={menu.link}
              className={`group flex items-center gap-3 font-medium p-3 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? "bg-purple-50 text-purple-700"
                    : "hover:bg-gray-100 text-purple-700"
                }`}
            >
              <div className="text-purple-700">
                {React.createElement(menu.icon, { size: "22" })}
              </div>
              <span
                className={`whitespace-nowrap duration-300 ${
                  !open && "opacity-0 w-0 overflow-hidden"
                }`}
              >
                {menu.name}
              </span>
              {/* Tooltip when sidebar is collapsed */}
              {!open && (
                <span
                  className="absolute left-14 bg-gray-900 text-white text-sm font-medium px-2 py-1 rounded-md 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap"
                >
                  {menu.name}
                </span>
              )}
            </Link>
          );
        })}

        {/* Drafts Menu with Submenu */}
        <div className="relative">
          <div
            onClick={() => {
              if (open) {
                setDraftsOpen(!draftsOpen);
              } else {
                setOpen(true);
                setDraftsOpen(true);
              }
            }}
            className={`group flex items-center gap-3 font-medium p-3 rounded-lg transition-all duration-200 cursor-pointer
              ${
                location.pathname.startsWith("/dashboard/drafts")
                  ? "bg-purple-50 text-purple-700"
                  : "hover:bg-gray-100 text-purple-700"
              }`}
          >
            <div className="text-purple-700">
              <MdDrafts size="22" />
            </div>
            <span
              className={`whitespace-nowrap duration-300 flex-1 ${
                !open && "opacity-0 w-0 overflow-hidden"
              }`}
            >
              Drafts
            </span>
            {open && (
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/dashboard/drafts");
                  }}
                  className="p-1 hover:bg-purple-200 rounded-full transition-colors"
                  title="Add Draft"
                >
                  <MdAdd size="18" />
                </button>
                {draftsOpen ? (
                  <MdKeyboardArrowUp size="20" />
                ) : (
                  <MdKeyboardArrowDown size="20" />
                )}
              </div>
            )}
            {/* Tooltip when sidebar is collapsed */}
            {!open && (
              <span
                className="absolute left-14 bg-gray-900 text-white text-sm font-medium px-2 py-1 rounded-md 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap"
              >
                Drafts
              </span>
            )}
          </div>

          {/* Drafts Submenu */}
          {open && draftsOpen && (
            <div className="ml-6 mt-1 flex flex-col gap-1 border-l-2 border-purple-300 pl-3">
              {fetchingAllDrafts ? (
                <div className="text-sm text-purple-600 py-2 px-2">
                  Loading...
                </div>
              ) : allDrafts && allDrafts.length > 0 ? (
                allDrafts.map((draft) => (
                  <Link
                    key={draft._id}
                    to={`/dashboard/drafts/${draft._id}`}
                    className={`text-sm py-2 px-2 rounded-md transition-colors truncate flex-shrink-0
                      ${
                        location.pathname === `/dashboard/drafts/${draft._id}`
                          ? "bg-purple-100 text-purple-800"
                          : "hover:bg-purple-50 text-purple-600"
                      }`}
                    title={draft.title || "Untitled Draft"}
                  >
                    {draft.title || "Untitled Draft"}
                  </Link>
                ))
              ) : (
                <div className="text-sm text-purple-500 py-2 px-2">
                  No drafts yet
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

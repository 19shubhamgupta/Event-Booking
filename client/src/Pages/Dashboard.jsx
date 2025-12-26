import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Components/DashBoardComponents/SideBar";

const Dashboard = () => {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex bg-[#e7dbf8] pt-20">
      <Sidebar open={open} setOpen={setOpen} />
      <div
        className={`${
          open ? "ml-64" : "ml-16"
        } flex-1 min-h-screen bg-[#e7dbf8] duration-300`}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;

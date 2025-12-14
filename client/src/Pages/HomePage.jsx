import React from "react";
import { useStoreAuth } from "../store/useAuthStore";

const HomePage = () => {
  const { authUser } = useStoreAuth();
  console.log("Auth User:", authUser);
  return (
    authUser && (
      <div className="min-h-screen bg-[#e7dbf8] ">
        <div className="container mx-auto px-2    ">
          <div className="w-full mx-auto bg-white h-150 overflow-hidden rounded-2xl">
            {/* Banner Images (Highlighted Events) */}
            <img
              src="/banner1.jpg"
              alt="banner"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
        <div className="mt-42w-full min-h-screen border-t-5 border-[#6d27da] bg-[#e7dbf8] rounded-t-[10vw]"></div>
      </div>
    )
  );
};

export default HomePage;

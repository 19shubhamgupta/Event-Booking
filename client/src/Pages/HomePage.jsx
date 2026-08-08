import React from "react";
import { useStoreAuth } from "../store/useAuthStore";
import UpcomingEventsSection from "../Components/HomePageComponents/UpcomingEventsSection";
import CategoryEventsSection from "../Components/HomePageComponents/CategoryEventsSection";
import MoviesSection from "../Components/HomePageComponents/MoviesSection";

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
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="banner"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
        <div className="mt-8 w-full min-h-screen border-t-4 border-[#6d27da] bg-[#e7dbf8] rounded-t-[10vw] pt-8">
          {/* Upcoming events */}
          <UpcomingEventsSection />

          {/* Category Events */}
          <CategoryEventsSection />

          {/* Movies */}
          <MoviesSection />
        </div>
      </div>
    )
  );
};

export default HomePage;

import { Link } from "react-router-dom";
import { useStoreAuth } from "../store/useAuthStore";
import {
  LogOut,
  Calendar,
  Film,
  Search,
  UserPlus,
  LogIn,
  Plus,
  User,
} from "lucide-react";
import { useEffect } from "react";
import { useOrganizationStore } from "../store/useOrganization";

const NavBar = () => {
  const { logout, authUser, showNavBar } = useStoreAuth();
  const {verifyOrganization  , organization } = useOrganizationStore()

  useEffect(()=>{
    verifyOrganization().then(()=>console.log("org in navbar : ", organization))
  },[])

  const categoryLinks = [
    { name: "Events", path: "/events", icon: Calendar },
    { name: "Movies", path: "/movies", icon: Film },
  ];

  const authLinks = authUser
    ? organization
      ? [
          { name: "Dashboard", path: "/dashboard", icon: Plus },
          { name: "Organize", path: "/organize", icon: Plus },
          { name: "Logout", action: logout, icon: LogOut, isButton: true },
        ]
      : [
          { name: "Organize", path: "/organize", icon: Plus },
          { name: "Logout", action: logout, icon: LogOut, isButton: true },
        ]
    : [
        { name: "Login", path: "/login", icon: LogIn },
        { name: "Sign Up", path: "/signup", icon: UserPlus },
      ];

  return showNavBar ? (
    <header className="fixed w-full text-center top-0 z-40 bg-transparent  flex items-center justify-center mt-2">
      <div className="container w-[80%] bg-[#6d27da] px-10 h-16 rounded-2xl">
        <div className="flex items-center justify-between h-full ">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-all"
          >
            <div
              className="size-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#e7dbf8" }}
            >
              <Calendar className="w-5 h-5" style={{ color: "#6d27da" }} />
            </div>
            <h1 className="text-lg font-bold text-white">EventHub</h1>
          </Link>

          {/* Category Links */}
          <nav className="hidden md:flex items-center gap-3">
            {categoryLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="flex items-center gap-2 px-2 rounded-lg transition-all duration-200 hover:bg-white/10"
                  style={{ color: "#e7dbf8" }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold text-lg">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-md  hidden lg:block">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: "#6d27da" }}
              />
              <input
                type="text"
                placeholder="Search events, movies..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border-0 focus:ring-2 focus:outline-none"
                style={{
                  backgroundColor: "#e7dbf8",
                  color: "#6d27da",
                  focusRing: "#e7dbf8",
                }}
              />
            </div>
          </div>

          {/* Auth Links */}
          <div className="flex items-center gap-5 ">
            {authLinks.map((link) => {
              const Icon = link.icon;

              if (link.isButton && link.name === "Organize") {
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-white/10"
                    style={{
                      backgroundColor: "transparent",
                      color: "#e7dbf8",
                      border: "1px solid #e7dbf8",
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline font-semibold">
                      {link.name}
                    </span>
                  </Link>
                );
              }

              if (link.isButton && link.name === "Logout") {
                return (
                  <button
                    key={link.name}
                    onClick={link.action}
                    className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:opacity-80 border-2"
                    style={{
                      borderColor: "#e7dbf8",
                    }}
                    title="Profile"
                  >
                    <img
                      src={authUser?.profilePicture || "/avatar.png"}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = "/avatar.png";
                      }}
                    />
                  </button>
                );
              }

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor:
                      link.name === "Sign Up" ? "#e7dbf8" : "transparent",
                    color: link.name === "Sign Up" ? "#6d27da" : "#e7dbf8",
                    border:
                      link.name === "Sign Up" ? "none" : "1px solid #e7dbf8",
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline font-semibold">
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  ) : (
    <></>
  );
};
export default NavBar;

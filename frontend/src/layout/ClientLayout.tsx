'use client';

import Navbar from "@/components/common/Navbar";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { useUser } from "@/context/UserContext";
import { ToastContainer } from "react-toastify";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  const baseLinks = user
    ? [
      { text: "Home", path: "/home" },
      { text: "Stadiums", path: "/stadiums" },
      { text: "Tournaments", path: "/tournaments" },
      { text: "Academies", path: "/academies" },
      { text: "My Bookings", path: "/my-bookings" },
    ]
    : [{ text: "Home", path: "/home" }];

  const roleBasedLinks =
    user && !["user", "teamLeader"].includes(user?.role)
      ? [{ text: "Dashboard", path: "/dashboard" }]
      : [];

  const navLinks = [...baseLinks, ...roleBasedLinks];

  return (
    <>
      <Navbar navLinks={navLinks} />
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeTogglerTwo />
      </div>
      <main>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          className="z-auto"
        />
        {children}
      </main>
    </>
  );
}

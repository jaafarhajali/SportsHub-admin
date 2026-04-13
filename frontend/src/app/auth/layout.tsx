import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";
import Image from "next/image";
import { ToastContainer } from "react-toastify";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-stone-950 p-10 md:p-0">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-gray-100 dark:bg-stone-900 items-center justify-center hidden lg:flex">
            <div className="relative flex items-center justify-center z-1 w-full">
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
              <GridShape />
              <div className="flex flex-col justify-between items-center max-w-xs">
                {/* Logo Section */}
                <div className="w-[250px]">
                  <Image
                    width={231}
                    height={48}
                    src="/images/logo/logo_no_bg.png"
                    alt="Logo"
                  />
                </div>
                
                {/* Text Section with proper spacing */}
                <div className="text-center">
                  <p className="text-gray-400 dark:text-white/60 text-lg">
                    Welcome to SportsHub!
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
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
    </div>
  );
}
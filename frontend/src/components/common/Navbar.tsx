"use client";
import { useState } from "react";
import NotificationDropdown from "../header/NotificationDropdown";
import UserDropdown from "../header/UserDropdown";
import Link from "next/link";
import { usePathname } from "next/navigation";


const Navbar = ({ navLinks = [] }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-gray-200 dark:bg-stone-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>

              {/* Hamburger icon */}
              <svg
                className={`${isMobileMenuOpen ? "hidden" : "block"} size-6`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>

              {/* Close icon */}
              <svg
                className={`${isMobileMenuOpen ? "block" : "hidden"} size-6`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Logo and Navigation Links */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.path}
                    className={`rounded-md px-3 py-2 text-sm font-medium ${pathname === link.path
                        ? "bg-white/70 dark:bg-stone-700 text-black dark:text-white"
                        : "text-gray-700 hover:bg-white/70 hover:text-black dark:text-gray-400 dark:hover:bg-stone-700 dark:hover:text-white"
                      }`}
                    aria-current={pathname === link.path ? "page" : undefined}
                  >
                    {link.text}
                  </Link>

                ))}
              </div>
            </div>
          </div>

          {/* Right side - Notifications and User Menu */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <NotificationDropdown />
            <div className="relative ml-3">
              <UserDropdown />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="space-y-1 px-2 pt-2 pb-3">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                href={link.path}
                className={`block rounded-md px-3 py-2 text-base font-medium ${index === 0
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                aria-current={index === 0 ? "page" : undefined}
              >
                {link.text}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

'use client'
import Image from "next/image";
import Link from "next/link";
import React from "react";
import GridShape from "@/components/common/GridShape";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 bg-gray-200 dark:bg-stone-800 overflow-hidden">
      <GridShape />
      <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
        <h1 className="mb-8 font-bold text-stone-800 text-title-md dark:text-white/90 xl:text-title-2xl">
          ERROR 503
        </h1>

        <Image
          src="/images/error/503.svg"
          alt="500"
          className="dark:hidden"
          width={472}
          height={152}
        />
        <Image
          src="/images/error/503-dark.svg"
          alt="500"
          className="hidden dark:block"
          width={472}
          height={152}
        />

        <p className="mt-10 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
          Oops! Something went wrong on our end.
        </p>

        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white/15 px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          Try Again
        </button>
      </div>

      <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
        &copy; {new Date().getFullYear()} - TailAdmin
      </p>
    </div>
  );
}

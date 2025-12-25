// *********************
// Role of the component: IntroducingSection with promotional banner
// Name of the component: IntroducingSection.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <IntroducingSection />
// Input parameters: no input parameters
// Output: Section with promotional text and button
// *********************

import Link from "next/link";
import React from "react";

const IntroducingSection = () => {
  return (
    <div className="py-16 bg-gradient-to-r from-[#A8DADC] to-[#457B9D]">
      <div className="text-center flex flex-col gap-y-5 items-center max-w-screen-2xl mx-auto px-6">
        <h2 className="text-white text-5xl font-bold max-md:text-4xl max-sm:text-3xl">
          Discover B-hive Wellness
        </h2>
        <div>
          <p className="text-white text-xl font-medium max-md:text-lg max-sm:text-base">
            Embrace natural health with our curated selection.
          </p>
          <p className="text-white text-xl font-medium max-md:text-lg max-sm:text-base">
            Quality products for a balanced life.
          </p>
          <Link href="/shop" className="inline-block bg-white text-[#457B9D] font-semibold px-8 py-3 rounded-full hover:bg-slate-100 transition mt-6">
            Explore Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default IntroducingSection;

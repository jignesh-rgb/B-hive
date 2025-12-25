// *********************
// Role of the component: Classical hero component on home page
// Name of the component: Hero.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <Hero />
// Input parameters: no input parameters
// Output: Classical hero component with two columns on desktop and one column on smaller devices
// *********************

import Image from "next/image";
import Link from "next/link";
import React from "react";

const Hero = () => {
  return (
    <div className="h-[700px] w-full bg-[#F1FAEE] max-lg:h-[900px] max-md:h-[750px]">
      <div className="grid grid-cols-3 items-center justify-items-center px-10 gap-x-10 max-w-screen-2xl mx-auto h-full max-lg:grid-cols-1 max-lg:py-10 max-lg:gap-y-10">
        <div className="flex flex-col gap-y-5 max-lg:order-last col-span-2">
          <h1 className="text-6xl text-slate-800 font-bold mb-3 max-xl:text-5xl max-md:text-4xl max-sm:text-3xl">
            Wellness Starts Here
          </h1>
          <p className="text-slate-600 max-sm:text-sm">
            Discover natural health products designed for your well-being. From organic supplements to eco-friendly essentials, find everything you need for a healthier lifestyle.
          </p>
          <div className="flex gap-x-4 max-lg:flex-col max-lg:gap-y-4">
            <Link href="/shop" className="bg-[#A8DADC] text-slate-800 font-semibold px-8 py-3 rounded-full hover:bg-opacity-90 transition text-center">
              Shop Now
            </Link>
            <button className="border-2 border-[#A8DADC] text-[#457B9D] font-semibold px-8 py-3 rounded-full hover:bg-[#A8DADC] hover:text-slate-800 transition">
              Learn More
            </button>
          </div>
        </div>
        <Image
          src="/watch for banner.png"
          width={400}
          height={400}
          alt="health product"
          className="max-md:w-[300px] max-md:h-[300px] max-sm:h-[250px] max-sm:w-[250px] w-auto h-auto"
        />
      </div>
    </div>
  );
};

export default Hero;

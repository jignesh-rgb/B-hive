// *********************
// Role of the component: Footer component
// Name of the component: Footer.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <Footer />
// Input parameters: no input parameters
// Output: Footer component
// *********************

import { navigation } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaCcVisa, FaCcMastercard, FaCcPaypal } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200" aria-labelledby="footer-heading">
      <div>
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="mx-auto max-w-screen-2xl px-6 lg:px-8 pt-16 pb-8">
          <div className="xl:grid xl:grid-cols-4 xl:gap-8">
            <div className="space-y-8">
              <Image
                src="/logo v1.png"
                alt="B-hive logo"
                width={150}
                height={150}
                className="h-auto w-auto"
              />
              <p className="text-sm text-slate-600 max-w-xs">
                Your trusted partner for health & wellness products. Quality, care, and sustainability in every purchase.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-600 hover:text-[#457B9D] transition">
                  <FaFacebook size={20} />
                </a>
                <a href="#" className="text-slate-600 hover:text-[#457B9D] transition">
                  <FaTwitter size={20} />
                </a>
                <a href="#" className="text-slate-600 hover:text-[#457B9D] transition">
                  <FaInstagram size={20} />
                </a>
                <a href="#" className="text-slate-600 hover:text-[#457B9D] transition">
                  <FaYoutube size={20} />
                </a>
              </div>
            </div>
            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-lg font-semibold leading-6 text-slate-800">
                    Shop
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.sale.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm leading-6 text-slate-600 hover:text-[#457B9D] transition"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-lg font-semibold leading-6 text-slate-800">
                    About
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.about.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm leading-6 text-slate-600 hover:text-[#457B9D] transition"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-lg font-semibold leading-6 text-slate-800">
                    Support
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.help.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm leading-6 text-slate-600 hover:text-[#457B9D] transition"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-lg font-semibold leading-6 text-slate-800">
                    Legal
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.buy.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm leading-6 text-slate-600 hover:text-[#457B9D] transition"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-16 xl:mt-0">
              <h3 className="text-lg font-semibold leading-6 text-slate-800">
                Newsletter
              </h3>
              <p className="mt-4 text-sm text-slate-600">
                Subscribe to get special offers and updates.
              </p>
              <form className="mt-6">
                <div className="flex gap-x-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#A8DADC] focus:border-transparent outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#A8DADC] text-slate-800 rounded-lg hover:bg-opacity-90 transition font-medium"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="mt-16 border-t border-slate-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-slate-600">
                © 2025 B-hive. All rights reserved.
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="text-sm text-slate-600">We accept:</span>
                <FaCcVisa size={24} className="text-slate-600" />
                <FaCcMastercard size={24} className="text-slate-600" />
                <FaCcPaypal size={24} className="text-slate-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

// *********************
// Role of the component: Trust indicators section
// Name of the component: TrustIndicators.tsx
// Developer: AI Assistant
// Version: 1.0
// Component call: <TrustIndicators />
// Input parameters: no input parameters
// Output: Trust indicators with icons and text
// *********************

import React from "react";
import { FaShippingFast, FaShieldAlt, FaLeaf, FaHeadset } from "react-icons/fa";

const TrustIndicators = () => {
  const indicators = [
    {
      icon: <FaShippingFast size={32} className="text-[#A8DADC]" />,
      title: "Free Shipping",
      description: "On orders over $50",
    },
    {
      icon: <FaShieldAlt size={32} className="text-[#A8DADC]" />,
      title: "Secure Payment",
      description: "100% safe transactions",
    },
    {
      icon: <FaLeaf size={32} className="text-[#A8DADC]" />,
      title: "Natural Products",
      description: "Eco-friendly & organic",
    },
    {
      icon: <FaHeadset size={32} className="text-[#A8DADC]" />,
      title: "24/7 Support",
      description: "Always here to help",
    },
  ];

  return (
    <div className="bg-slate-50 py-16">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {indicators.map((indicator, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">
                {indicator.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {indicator.title}
              </h3>
              <p className="text-slate-600">
                {indicator.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustIndicators;
// *********************
// Role of the component: Hero component on home page
// Name of the component: Hero.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.0 - Redesigned for health & wellness brand
// Component call: <Hero />
// Input parameters: no input parameters
// Output: Modern hero component with strong CTAs and trust indicators
// *********************

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaStar, FaShieldAlt, FaTruck, FaLeaf } from "react-icons/fa";

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-5"></div>

      <div className="relative container-max section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
                <FaLeaf className="text-primary-600" />
                100% Natural & Organic
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Wellness Starts
                <span className="block text-primary-600">Here</span>
              </h1>
              <p className="text-lg md:text-xl text-neutral-600 max-w-lg leading-relaxed">
                Discover natural health products designed for your well-being. From organic supplements to eco-friendly essentials, find everything you need for a healthier lifestyle.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop" className="btn-primary text-center">
                Shop Now
              </Link>
              <Link href="/about" className="btn-outline text-center">
                Learn More
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} size={16} />
                  ))}
                </div>
                <span className="text-sm font-medium text-neutral-700">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <FaShieldAlt size={16} />
                <span className="text-sm font-medium">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <FaTruck size={16} />
                <span className="text-sm font-medium">Free Shipping</span>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-scale-in">
            <div className="relative">
              <Image
                src="/watch for banner.png"
                width={500}
                height={500}
                alt="Natural health and wellness products"
                className="w-full h-auto max-w-md mx-auto lg:max-w-none"
                priority
              />
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-large p-4 animate-bounce">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">98%</div>
                  <div className="text-xs text-neutral-600">Satisfaction</div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-primary-500 text-white rounded-2xl shadow-large p-4">
                <div className="text-center">
                  <div className="text-lg font-bold">Free</div>
                  <div className="text-xs">Shipping</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">10K+</div>
            <div className="text-sm text-neutral-600">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
            <div className="text-sm text-neutral-600">Products</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
            <div className="text-sm text-neutral-600">Brands</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
            <div className="text-sm text-neutral-600">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

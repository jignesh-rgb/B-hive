import React from 'react';
import Link from 'next/link';
import { FaLeaf, FaUsers, FaAward, FaHeart } from 'react-icons/fa';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - B-hive',
  description: 'Learn about B-hive\'s mission to provide natural health and wellness products for a healthier lifestyle.',
};

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="container-max section-padding">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About B-hive
            </h1>
            <p className="text-xl text-primary-100 leading-relaxed">
              Your trusted partner in natural health and wellness, committed to bringing you the finest organic and sustainable products for a healthier lifestyle.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-neutral-600 leading-relaxed">
                At B-hive, we believe that true wellness comes from nature. Our mission is to make natural, high-quality health products accessible to everyone, promoting sustainable living and supporting local communities.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  Why Choose Natural?
                </h3>
                <p className="text-neutral-600 mb-6">
                  We carefully select products that are free from harmful chemicals, sustainably sourced, and backed by scientific research. Every item in our collection supports your journey toward optimal health.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <FaLeaf className="text-primary-500 flex-shrink-0" />
                    <span className="text-neutral-700">100% Natural Ingredients</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FaLeaf className="text-primary-500 flex-shrink-0" />
                    <span className="text-neutral-700">Eco-Friendly Packaging</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FaLeaf className="text-primary-500 flex-shrink-0" />
                    <span className="text-neutral-700">Sustainable Sourcing</span>
                  </li>
                </ul>
              </div>
              <div className="bg-primary-50 rounded-2xl p-8">
                <div className="text-center">
                  <div className="text-6xl text-primary-500 mb-4">
                    🌿
                  </div>
                  <h4 className="text-xl font-bold text-neutral-900 mb-2">
                    Nature&apos;s Best
                  </h4>
                  <p className="text-neutral-600">
                    We believe in harnessing the power of nature to support your health and well-being.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-white section-padding">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
              Our Values
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              These core principles guide everything we do, from product selection to customer service.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaLeaf className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                Natural Focus
              </h3>
              <p className="text-neutral-600">
                We prioritize natural, organic ingredients that support your body&apos;s natural healing processes.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-secondary-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-secondary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                Community
              </h3>
              <p className="text-neutral-600">
                We support local farmers, artisans, and communities that share our commitment to quality.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaAward className="text-accent-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                Quality
              </h3>
              <p className="text-neutral-600">
                Every product undergoes rigorous testing to ensure it meets our high standards.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-success w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaHeart className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                Wellness
              </h3>
              <p className="text-neutral-600">
                We&apos;re dedicated to helping you achieve optimal health and well-being.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary-50 section-padding">
        <div className="container-max">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">2020</div>
              <div className="text-neutral-600">Founded</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">10K+</div>
              <div className="text-neutral-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-neutral-600">Products</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-neutral-600">Partner Brands</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-max">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Wellness Journey?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Discover our curated collection of natural health products and take the first step toward a healthier you.
            </p>
            <Link href="/shop" className="inline-block bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-neutral-50 transition-all duration-200 hover:scale-105">
              Shop Our Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
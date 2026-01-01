"use client";
import { DashboardSidebar, StatsElement } from "@/components";
import React, { useEffect } from "react";
import Link from "next/link";
import { FaArrowUp, FaUsers, FaCartShopping, FaDollarSign, FaBox, FaStar } from "react-icons/fa6";

const AdminDashboardPage = () => {
  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="flex">
        <DashboardSidebar />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Dashboard</h1>
              <p className="text-neutral-600">Welcome back! Here&apos;s what&apos;s happening with your store today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-neutral-900">$45,231</p>
                    <p className="text-sm text-success flex items-center mt-1">
                      <FaArrowUp className="mr-1" />
                      +12.5% from last month
                    </p>
                  </div>
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <FaDollarSign className="text-primary-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600 mb-1">Orders</p>
                    <p className="text-2xl font-bold text-neutral-900">1,429</p>
                    <p className="text-sm text-success flex items-center mt-1">
                      <FaArrowUp className="mr-1" />
                      +8.2% from last month
                    </p>
                  </div>
                  <div className="bg-secondary-100 p-3 rounded-lg">
                    <FaCartShopping className="text-secondary-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600 mb-1">Customers</p>
                    <p className="text-2xl font-bold text-neutral-900">892</p>
                    <p className="text-sm text-success flex items-center mt-1">
                      <FaArrowUp className="mr-1" />
                      +15.3% from last month
                    </p>
                  </div>
                  <div className="bg-accent-100 p-3 rounded-lg">
                    <FaUsers className="text-accent-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600 mb-1">Products</p>
                    <p className="text-2xl font-bold text-neutral-900">234</p>
                    <p className="text-sm text-neutral-600 flex items-center mt-1">
                      <FaBox className="mr-1" />
                      12 low stock
                    </p>
                  </div>
                  <div className="bg-success p-3 rounded-lg">
                    <FaBox className="text-white text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Recent Orders */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-soft p-6">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4">Recent Orders</h2>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((order) => (
                      <div key={order} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-b-0">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <FaCartShopping className="text-primary-600 text-sm" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">Order #BH-{1000 + order}</p>
                            <p className="text-sm text-neutral-600">2 items • $89.99</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-3 py-1 bg-success text-white text-xs rounded-full">
                            Completed
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link href="/admin/orders" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                      View all orders →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Stats */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-soft p-6">
                  <h3 className="text-lg font-bold text-neutral-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link href="/admin/products" className="block w-full bg-primary-500 hover:bg-primary-600 text-white text-center py-3 px-4 rounded-lg transition-colors">
                      Add New Product
                    </Link>
                    <Link href="/admin/bulk-upload" className="block w-full bg-secondary-500 hover:bg-secondary-600 text-white text-center py-3 px-4 rounded-lg transition-colors">
                      Bulk Upload
                    </Link>
                    <Link href="/admin/categories" className="block w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-center py-3 px-4 rounded-lg transition-colors">
                      Manage Categories
                    </Link>
                  </div>
                </div>

                {/* Customer Satisfaction */}
                <div className="bg-white rounded-xl shadow-soft p-6">
                  <h3 className="text-lg font-bold text-neutral-900 mb-4">Customer Satisfaction</h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-neutral-900 mb-2">4.8</div>
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar key={star} className="text-yellow-400 text-lg" />
                      ))}
                    </div>
                    <p className="text-sm text-neutral-600">Based on 1,247 reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

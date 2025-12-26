// *********************
// Role of the component: Sidebar on admin dashboard page
// Name of the component: DashboardSidebar.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.0 - Redesigned for modern admin interface
// Component call: <DashboardSidebar />
// Input parameters: no input parameters
// Output: Modern sidebar for admin dashboard with improved UX
// *********************

"use client";
import React from "react";
import {
  MdDashboard,
  MdTableChart,
  MdPeople,
  MdSettings,
  MdShoppingCart,
  MdStore,
  MdCategory,
  MdCloudUpload
} from "react-icons/md";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DashboardSidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: MdDashboard,
      description: 'Overview & analytics'
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: MdShoppingCart,
      description: 'Manage customer orders'
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: MdTableChart,
      description: 'Product catalog'
    },
    {
      name: 'Bulk Upload',
      href: '/admin/bulk-upload',
      icon: MdCloudUpload,
      description: 'Import products'
    },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: MdCategory,
      description: 'Product categories'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: MdPeople,
      description: 'Customer management'
    },
    {
      name: 'Merchant',
      href: '/admin/merchant',
      icon: MdStore,
      description: 'Store settings'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: MdSettings,
      description: 'System configuration'
    },
  ];

  return (
    <div className="w-80 bg-white border-r border-neutral-200 min-h-screen">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-neutral-200">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <div>
            <h1 className="font-bold text-neutral-900">B-hive</h1>
            <p className="text-xs text-neutral-500">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <item.icon className={`text-xl flex-shrink-0 ${
                  isActive ? 'text-primary-600' : 'text-neutral-500 group-hover:text-neutral-700'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${
                    isActive ? 'text-primary-700' : ''
                  }`}>
                    {item.name}
                  </div>
                  <div className="text-xs text-neutral-500 truncate">
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200 bg-neutral-50/50">
        <div className="text-center">
          <p className="text-xs text-neutral-500">
            B-hive Admin v2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;

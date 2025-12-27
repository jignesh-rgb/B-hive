// *********************
// Role of the component: Header component
// Name of the component: Header.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <Header />
// Input parameters: no input parameters
// Output: Header component
// *********************

"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import HeaderTop from "./HeaderTop";
import Image from "next/image";
import SearchInput from "./SearchInput";
import Link from "next/link";
import { FaBell } from "react-icons/fa6";

import CartElement from "./CartElement";
import NotificationBell from "./NotificationBell";
import HeartElement from "./HeartElement";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import apiClient from "@/lib/api";

const Header = () => {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const { wishlist, setWishlist, wishQuantity } = useWishlistStore();

    const handleLogout = () => {
        setTimeout(() => signOut(), 1000);
        toast.success("Logout successful!");
    };

    // getting all wishlist items by user id
    const getWishlistByUserId = async (id: string) => {
        if(id === null || id === undefined) return;
        const response = await apiClient.get(`/api/wishlist/${id}`);
        const wishlist = response.data;
        const productArray: {
            id: string;
            title: string;
            price: number;
            image: string;
            slug: string
            stockAvailabillity: number;
        }[] = [];

        // return; // temporary disable wishlist fetching while the issue is being resolved

        wishlist.map((item: any) => productArray.push({ id: item?.product?.id, title: item?.product?.title, price: item?.product?.price, image: item?.product?.mainImage, slug: item?.product?.slug, stockAvailabillity: item?.product?.inStock }));

        setWishlist(productArray);
    };

    // getting user by email so I can get his user id
    const getUserByEmail = async () => {
        if (session?.user?.email) {

            apiClient.get(`/api/users/email/${session?.user?.email}`)
                .then((response) => {
                    getWishlistByUserId(response.data?.id);
                })
                .catch((error) => {
                    console.error('Error fetching user:', error);
                });
        }
    };

    useEffect(() => {
        getUserByEmail();
    }, [session?.user?.email, wishlist.length]);

    return (
        <header className="bg-white">
            <HeaderTop />
            {pathname.startsWith("/admin") === false && (
                <>
                    <nav className="bg-white border-b border-slate-200">
                        <div className="max-w-screen-2xl mx-auto px-16 max-md:px-6">
                            <div className="flex items-center justify-center h-12 gap-x-8 max-md:gap-x-4">
                                <Link href="/" className="text-slate-700 hover:text-[#457B9D] transition font-medium">
                                    Home
                                </Link>
                                <Link href="/shop" className="text-slate-700 hover:text-[#457B9D] transition font-medium">
                                    Shop
                                </Link>
                                <Link href="/about" className="text-slate-700 hover:text-[#457B9D] transition font-medium">
                                    About
                                </Link>
                                <Link href="/contact" className="text-slate-700 hover:text-[#457B9D] transition font-medium">
                                    Contact
                                </Link>
                            </div>
                        </div>
                    </nav>
                    <div className="h-32 bg-white flex items-center justify-between px-16 max-[1320px]:px-16 max-md:px-6 max-lg:flex-col max-lg:gap-y-7 max-lg:justify-center max-lg:h-60 max-w-screen-2xl mx-auto">
                        <Link href="/">
                            <img src="/logo v1 svg.svg" width={300} height={300} alt="singitronic logo" className="relative right-5 max-[1023px]:w-56" />
                        </Link>
                        <SearchInput />
                        <div className="flex gap-x-10 items-center">
                            <NotificationBell />
                            <HeartElement wishQuantity={wishQuantity} />
                            <CartElement />
                        </div>
                    </div>
                </>
            )}
            {pathname.startsWith("/admin") === true && (
                <div className="flex justify-between h-32 bg-white items-center px-16 max-[1320px]:px-10  max-w-screen-2xl mx-auto max-[400px]:px-5">
                    <Link href="/">
                        <Image
                            src="/logo v1.png"
                            width={130}
                            height={130}
                            alt="singitronic logo"
                            className="w-56 h-auto"
                        />
                    </Link>
                    <div className="flex gap-x-5 items-center">
                        <NotificationBell />
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="w-10">
                                <Image
                                    src="/randomuser.jpg"
                                    alt="random profile photo"
                                    width={30}
                                    height={30}
                                    className="w-full h-full rounded-full"
                                />
                            </div>
                            <ul
                                tabIndex={0}
                                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                            >
                                <li>
                                    <Link href="/admin">Dashboard</Link>
                                </li>
                                <li>
                                    <a>Profile</a>
                                </li>
                                <li onClick={handleLogout}>
                                    <a href="#">Logout</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;

"use client";

import { nanoid } from "nanoid";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { sanitize } from "@/lib/sanitize";
import { getImageSrc } from "@/lib/image";
import CustomButton from "./CustomButton";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const DashboardProductTable = () => {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        apiClient
            .get("/api/products?mode=admin")
            .then((response) => {
                setProducts(response.data);
            })
            .catch((error) => {
                console.error("Error fetching products:", error);
            });
    }, []);

    // Image source function is imported from @/lib/image

    return (
        <div className="w-full">
            <h1 className="text-3xl font-semibold text-center mb-5">
                All products
            </h1>

            <div className="flex justify-end mb-5">
                <Link href="/admin/products/new">
                    <CustomButton
                        buttonType="button"
                        customWidth="110px"
                        paddingX={10}
                        paddingY={5}
                        textSize="base"
                        text="Add new product"
                    />
                </Link>
            </div>

            <div className="xl:ml-5 max-xl:mt-5 overflow-auto w-full h-[80vh]">
                <table className="table table-md table-pin-cols">
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" className="checkbox" />
                            </th>
                            <th>Product</th>
                            <th>Stock Availability</th>
                            <th>Price</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id ?? nanoid()}>
                                <th>
                                    <input type="checkbox" className="checkbox" />
                                </th>

                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-12 h-12">
                                                <Image
                                                    src={getImageSrc(product.mainImage)}
                                                    width={48}
                                                    height={48}
                                                    alt={sanitize(product.title) || "Product image"}
                                                    className="object-cover"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="font-bold">
                                                {sanitize(product.title)}
                                            </div>
                                            <div className="text-sm opacity-50">
                                                {sanitize(product.manufacturer)}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    {product.inStock ? (
                                        <span className="badge badge-success badge-sm text-white">
                                            In stock
                                        </span>
                                    ) : (
                                        <span className="badge badge-error badge-sm text-white">
                                            Out of stock
                                        </span>
                                    )}
                                </td>

                                <td>${product.price}</td>

                                <th>
                                    <Link
                                        href={`/admin/products/${product._id}`}
                                        className="btn btn-ghost btn-xs"
                                    >
                                        Details
                                    </Link>
                                </th>
                            </tr>
                        ))}
                    </tbody>

                    <tfoot>
                        <tr>
                            <th></th>
                            <th>Product</th>
                            <th>Stock Availability</th>
                            <th>Price</th>
                            <th></th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default DashboardProductTable;

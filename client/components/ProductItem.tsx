// *********************
// Role of the component: High-quality reusable product card component
// Name of the component: ProductItem.tsx
// Developer: AI Assistant
// Version: 2.0 - Redesigned for health & wellness brand
// Component call: <ProductItem product={product} />
// Input parameters: { product: Product; }
// Output: Modern product card with enhanced UX and conversion optimization
// *********************

"use client";
import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { FaStar, FaHeart, FaCartPlus, FaLeaf, FaCheck } from "react-icons/fa";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import { useProductStore } from "@/app/_zustand/store";
import { sanitize } from "@/lib/sanitize";
import { getImageSrc } from "@/lib/image";
import toast from "react-hot-toast";


const ProductItem = ({ product }: { product: Product }) => {
    const { addToCart, calculateTotals } = useProductStore();
    const { wishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Calculate average rating
    const rating = product.rating && product.rating.length > 0
        ? product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length
        : 0;

    const isInWishlist = wishlist.some(item => item.id === product._id);

    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInWishlist) {
            removeFromWishlist(product._id);
            toast.success("Removed from wishlist");
        } else {
            addToWishlist({
                id: product._id,
                title: product.title,
                price: product.price,
                image: getImageSrc(product.mainImage),
                slug: product.slug,
                stockAvailabillity: product.inStock || 1,
            });
            toast.success("Added to wishlist");
        }
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({
            id: product?._id.toString(),
            title: product?.title,
            price: product?.price,
            image: getImageSrc(product?.mainImage),
            amount: 1
        });
        calculateTotals();
        toast.success("Product added to the cart");
    };

    return (
        <div
            className="group relative bg-white rounded-2xl shadow-soft hover:shadow-large transition-all duration-300 overflow-hidden border border-neutral-100 hover:border-primary-200"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                {product.isOrganic && (
                    <div className="bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <FaLeaf size={10} />
                        Organic
                    </div>
                )}
                {product.isBestseller && (
                    <div className="bg-accent-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Bestseller
                    </div>
                )}
            </div>

            {/* Wishlist Button */}
            <button
                onClick={handleWishlistToggle}
                className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200 ${isInWishlist
                        ? 'bg-red-500 text-white scale-110'
                        : 'bg-white/80 text-neutral-600 hover:bg-white hover:scale-110 shadow-soft'
                    }`}
            >
                <FaHeart size={16} className={isInWishlist ? 'fill-current' : ''} />
            </button>

            <Link href={`/product/${product.slug}`} className="block">
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden bg-neutral-50">
                    <Image
                        src={getImageSrc(product.mainImage)}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className={`object-cover transition-all duration-500 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                        alt={sanitize(product?.title) || "Product image"}
                        onLoad={() => setImageLoaded(true)}
                    />

                    {/* Loading skeleton */}
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-neutral-200 animate-pulse"></div>
                    )}

                    {/* Hover overlay with quick actions */}
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
                        }`}>
                        <button
                            onClick={handleAddToCart}
                            className="bg-white text-neutral-900 px-6 py-3 rounded-xl font-medium hover:bg-neutral-50 transition-all duration-200 hover:scale-105 flex items-center gap-2 shadow-large"
                        >
                            <FaCartPlus size={16} />
                            Add to Cart
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    size={14}
                                    className={rating >= star ? "text-yellow-400" : "text-neutral-300"}
                                    fill={rating >= star ? "currentColor" : "none"}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-neutral-600 font-medium">
                            {rating > 0 ? rating.toFixed(1) : 'No reviews'}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-neutral-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {sanitize(product.title)}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-neutral-900">
                                ${product.price}
                            </span>
                            {product.inStock && product.inStock < 10 && (
                                <span className="text-sm text-warning font-medium">
                                    Only {product.inStock} left
                                </span>
                            )}
                        </div>

                        {/* Stock indicator */}
                        {product.inStock && product.inStock > 0 && (
                            <div className="flex items-center gap-1 text-success text-sm font-medium">
                                <FaCheck size={12} />
                                In stock
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProductItem;

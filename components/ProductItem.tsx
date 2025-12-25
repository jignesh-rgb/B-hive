// *********************
// Role of the component: Reusable ProductCard component
// Name of the component: ProductItem.tsx (renamed to ProductCard)
// Developer: AI Assistant
// Version: 1.0
// Component call: <ProductItem product={product} color={color} />
// Input parameters: { product: Product; color: string; }
// Output: Product card with image, title, price, rating, wishlist, add-to-cart, hover interactions
// *********************

"use client";
import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { FaStar, FaHeart, FaCartPlus } from "react-icons/fa";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import { useProductStore } from "@/app/_zustand/store";
import { sanitize } from "@/lib/sanitize";
import toast from "react-hot-toast";

const ProductItem = ({
  product,
  color,
}: {
  product: Product;
  color: string;
}) => {
  const { addToCart } = useProductStore();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  const [isHovered, setIsHovered] = useState(false);

  // Calculate average rating
  const rating = product.rating && product.rating.length > 0
    ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length)
    : 0;

  const isInWishlist = wishlist.some(item => item.id === product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist) {
      removeFromWishlist(product.id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.mainImage || "/product_placeholder.jpg",
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
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.mainImage || "/product_placeholder.jpg",
      quantity: 1,
    });
    toast.success("Added to cart");
  };

  const textColor = color === "black" ? "text-black" : color === "slate" ? "text-slate-800" : "text-white";

  return (
    <div
      className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-slate-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative h-64 overflow-hidden">
          <Image
            src={
              product.mainImage
                ? `/${product.mainImage}`
                : "/product_placeholder.jpg"
            }
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
            alt={sanitize(product?.title) || "Product image"}
          />
          {/* Overlay on hover */}
          {isHovered && (
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center gap-4 transition-opacity duration-300">
              <button
                onClick={handleWishlistToggle}
                className={`p-2 rounded-full ${isInWishlist ? 'bg-red-500 text-white' : 'bg-white text-slate-800'} hover:scale-110 transition`}
              >
                <FaHeart size={20} />
              </button>
              <button
                onClick={handleAddToCart}
                className="p-2 rounded-full bg-[#A8DADC] text-slate-800 hover:bg-[#457B9D] hover:text-white hover:scale-110 transition"
              >
                <FaCartPlus size={20} />
              </button>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className={`text-lg font-semibold mb-2 line-clamp-2 ${textColor}`}>
            {sanitize(product.title)}
          </h3>
          <div className="flex items-center mb-2">
            {Array(5).fill('').map((_, index) => (
              <FaStar
                key={index}
                size={14}
                className={rating >= index + 1 ? "text-yellow-400" : "text-gray-300"}
                fill={rating >= index + 1 ? "currentColor" : "none"}
              />
            ))}
            <span className={`ml-2 text-sm ${textColor}`}>{rating.toFixed(1)}</span>
          </div>
          <p className={`text-xl font-bold ${textColor}`}>
            ${product.price}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default ProductItem;

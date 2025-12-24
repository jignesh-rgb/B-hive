"use client";
import Image from "next/image";
import Link from "next/link";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import apiClient from "@/lib/api";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface WishItemProps {
  id: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  stockAvailabillity: number | boolean;
}

const WishItem = ({ id, title, price, image, slug, stockAvailabillity }: WishItemProps) => {
  const { data: session } = useSession();
  const { wishlist, setWishlist } = useWishlistStore();
  const [isLoading, setIsLoading] = useState(false);

  const isInStock = Boolean(stockAvailabillity);

  const removeFromWishlist = async () => {
    if (!session?.user?.email) {
      toast.error("Please login to remove items from wishlist");
      return;
    }

    setIsLoading(true);
    try {
      // First get user ID
      const userResponse = await apiClient.get(`/api/users/email/${session.user.email}`);
      const userData = await userResponse.json();

      // Remove from wishlist
      await apiClient.delete(`/api/wishlist/${userData.id}/${id}`);

      // Update local state
      const updatedWishlist = wishlist.filter((item) => item.id !== id);
      setWishlist(updatedWishlist);

      toast.success("Item removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove item from wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <tr>
      <th>
        <button
          onClick={removeFromWishlist}
          disabled={isLoading}
          className="btn btn-sm btn-error btn-outline"
        >
          {isLoading ? "Removing..." : "Remove"}
        </button>
      </th>
      <td>
        <Link href={`/product/${slug}`}>
          <Image
            src={image || "/placeholder-image.jpg"}
            alt={title}
            width={80}
            height={80}
            className="object-cover rounded"
          />
        </Link>
      </td>
      <td>
        <Link href={`/product/${slug}`} className="link link-primary">
          {title}
        </Link>
      </td>
      <td>
        <span className={`badge ${isInStock ? 'badge-success' : 'badge-error'}`}>
          {isInStock ? 'In Stock' : 'Out of Stock'}
        </span>
      </td>
      <td>
        <div className="flex gap-2">
          <Link href={`/product/${slug}`} className="btn btn-sm btn-primary">
            View Product
          </Link>
          {isInStock && (
            <button className="btn btn-sm btn-secondary">
              Add to Cart
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default WishItem;
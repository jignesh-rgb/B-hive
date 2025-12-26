"use client";
import { DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import { convertCategoryNameToURLFriendly as convertSlugToURLFriendly } from "@/utils/categoryFormating";
import { sanitizeFormData } from "@/lib/form-sanitize";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AddNewProduct = () => {
  const [product, setProduct] = useState<{
    merchantId?: string;
    title: string;
    price: number;
    manufacturer: string;
    inStock: number;
    mainImage: string;
    description: string;
    slug: string;
    categoryId: string;
  }>({
    merchantId: "",
    title: "",
    price: 0,
    manufacturer: "",
    inStock: 1,
    mainImage: "",
    description: "",
    slug: "",
    categoryId: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const addProduct = async () => {
    console.log("Validation check - Current product state:", product);
    console.log("Validation check - Selected file:", selectedFile);

    if (
      !product.merchantId ||
      product.title === "" ||
      product.manufacturer === "" ||
      product.description === "" ||
      product.slug === "" ||
      !product.categoryId ||
      (!selectedFile && !product.mainImage) ||
      product.price <= 0
    ) {
      console.log("Validation failed - missing fields:");
      console.log("- merchantId:", product.merchantId);
      console.log("- title:", product.title);
      console.log("- manufacturer:", product.manufacturer);
      console.log("- description:", product.description);
      console.log("- slug:", product.slug);
      console.log("- categoryId:", product.categoryId);
      console.log("- price:", product.price);
      console.log("- selectedFile:", selectedFile);
      console.log("- mainImage:", product.mainImage);
      toast.error("Please enter values in input fields");
      return;
    }

    try {
      let imageUrl = product.mainImage;

      // Upload file if one is selected
      if (selectedFile) {
        console.log('Uploading file:', selectedFile.name, 'Size:', selectedFile.size);
        const formData = new FormData();
        formData.append("uploadedFile", selectedFile);

        const uploadResponse = await apiClient.post("/api/main-image", formData);
        const uploadData = uploadResponse.data;
        imageUrl = uploadData.imageUrl;
        toast.success("Image uploaded successfully");
      }

      // Sanitize form data before sending to API
      const productData = {
        ...product,
        mainImage: imageUrl
      };
      const sanitizedProduct = sanitizeFormData(productData);

      console.log("Sending product data:", sanitizedProduct);
      console.log("merchantId type:", typeof sanitizedProduct.merchantId, "value:", sanitizedProduct.merchantId);
      console.log("categoryId type:", typeof sanitizedProduct.categoryId, "value:", sanitizedProduct.categoryId);

      // Correct usage of apiClient.post
      await apiClient.post(`/api/products`, sanitizedProduct);

      console.log("Product created successfully");
      toast.success("Product added successfully");
      setProduct({
        merchantId: "",
        title: "",
        price: 0,
        manufacturer: "",
        inStock: 1,
        mainImage: "",
        description: "",
        slug: "",
        categoryId: categories[0]?.id || "",
      });
      setSelectedFile(null); // Clear selected file
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast.error(error.response?.data?.error || "Network error. Please try again.");
    }
  };

  const fetchMerchants = async () => {
    try {
      const response = await apiClient.get("/api/merchants");
      console.log("Fetched merchants:", response.data);
      setMerchants(response.data || []);
      // Only set default merchant if none is selected and we have merchants
      if (!product.merchantId && response.data && response.data.length > 0) {
        console.log("Setting default merchant:", response.data[0].id);
        setProduct((prev) => ({
          ...prev,
          merchantId: response.data[0].id,
        }));
      }
    } catch (e) {
      console.error("Error fetching merchants:", e);
      toast.error("Failed to load merchants");
    }
  };



  const fetchCategories = async () => {
    apiClient
      .get(`/api/categories`)
      .then((response) => {
        console.log("Fetched categories:", response.data);
        setCategories(response.data || []);
        // Only set categoryId if it's not already set and we have categories
        if (!product.categoryId && response.data && response.data.length > 0) {
          console.log("Setting default category:", response.data[0].id);
          setProduct((prev) => ({
            ...prev,
            categoryId: response.data[0].id,
          }));
        }
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  };

  useEffect(() => {
    fetchCategories();
    fetchMerchants();
  }, []);

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />
      <div className="flex flex-col gap-y-7 xl:ml-5 max-xl:px-5 w-full">
        <h1 className="text-3xl font-semibold">Add new product</h1>
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Merchant Info:</span>
            </div>
            <select
              className="select select-bordered"
              value={product?.merchantId || ""}
              onChange={(e) =>
                setProduct({ ...product, merchantId: e.target.value })
              }
            >
              <option value="">Select a merchant</option>
              {merchants.map((merchant) => (
                <option key={merchant.id} value={merchant.id}>
                  {merchant.name}
                </option>
              ))}
            </select>
            {merchants.length === 0 && (
              <span className="text-xs text-red-500 mt-1">
                Please create a merchant first.
              </span>
            )}
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product name:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.title}
              onChange={(e) =>
                setProduct({ ...product, title: e.target.value })
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product slug:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.slug}
              onChange={(e) => {
                const slugValue = convertSlugToURLFriendly(e.target.value);
                setProduct({
                  ...product,
                  slug: slugValue,
                });
              }}
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Category:</span>
            </div>
            <select
              className="select select-bordered"
              value={product?.categoryId || ""}
              onChange={(e) =>
                setProduct({ ...product, categoryId: e.target.value })
              }
            >
              <option value="">Select a category</option>
              {categories &&
                categories.map((category: any) => (
                  <option key={category?.id} value={category?.id}>
                    {category?.name}
                  </option>
                ))}
            </select>
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product price:</span>
            </div>
            <input
              type="number"
              className="input input-bordered w-full max-w-xs"
              value={product?.price || ""}
              onChange={(e) => {
                const value = e.target.value;
                setProduct({ ...product, price: value === "" ? 0 : Number(value) });
              }}
            />
          </label>
        </div>
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Manufacturer:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.manufacturer}
              onChange={(e) =>
                setProduct({ ...product, manufacturer: e.target.value })
              }
            />
          </label>
        </div>
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Is product in stock?</span>
            </div>
            <select
              className="select select-bordered"
              value={product?.inStock}
              onChange={(e) =>
                setProduct({ ...product, inStock: Number(e.target.value) })
              }
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </label>
        </div>
        <div>
          <input
            type="file"
            className="file-input file-input-bordered file-input-lg w-full max-w-sm"
            onChange={(e: any) => {
              const file = e.target.files[0];
              if (file) {
                setSelectedFile(file);
                // Don't upload immediately, just store the file
              }
            }}
          />
          {selectedFile && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Selected file: {selectedFile.name}</p>
              <Image
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="w-auto h-auto max-w-32 max-h-32 object-contain"
                width={100}
                height={100}
              />
            </div>
          )}
          {product?.mainImage && !selectedFile && (
            <Image
              src={product?.mainImage}
              alt={product?.title}
              className="w-auto h-auto"
              width={100}
              height={100}
            />
          )}
        </div>
        <div>
          <label className="form-control">
            <div className="label">
              <span className="label-text">Product description:</span>
            </div>
            <textarea
              className="textarea textarea-bordered h-24"
              value={product?.description}
              onChange={(e) =>
                setProduct({ ...product, description: e.target.value })
              }
            ></textarea>
          </label>
        </div>
        <div className="flex gap-x-2">
          <button
            onClick={addProduct}
            type="button"
            className="uppercase bg-blue-500 px-10 py-5 text-lg border border-black border-gray-300 font-bold text-white shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2"
          >
            Add product
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewProduct;

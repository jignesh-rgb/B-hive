"use client";
import { SectionTitle } from "@/components";
import { useProductStore } from "../_zustand/store";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";

declare global {
    interface Window {
        Razorpay: any;
    }
}

const CheckoutPage = () => {
    const { data: session } = useSession();
    const [checkoutForm, setCheckoutForm] = useState({
        name: "",
        lastname: "",
        phone: "",
        email: "",
        company: "",
        adress: "",
        apartment: "",
        city: "",
        country: "",
        postalCode: "",
        orderNotice: "",
        paymentMethod: "cod", // Default to COD
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { products, total, clearCart } = useProductStore();
    const router = useRouter();

    // Add validation functions that match server requirements
    const validateForm = () => {
        const errors: string[] = [];

        // Name validation
        if (!checkoutForm.name.trim() || checkoutForm.name.trim().length < 2) {
            errors.push("Name must be at least 2 characters");
        }

        // Lastname validation
        if (!checkoutForm.lastname.trim() || checkoutForm.lastname.trim().length < 2) {
            errors.push("Lastname must be at least 2 characters");
        }

        // Email validation
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!checkoutForm.email.trim() || !emailRegex.test(checkoutForm.email.trim())) {
            errors.push("Please enter a valid email address");
        }

        // Phone validation (must be at least 10 digits)
        const phoneDigits = checkoutForm.phone.replace(/[^0-9]/g, '');
        if (!checkoutForm.phone.trim() || phoneDigits.length < 10) {
            errors.push("Phone number must be at least 10 digits");
        }

        // Company validation
        if (!checkoutForm.company.trim() || checkoutForm.company.trim().length < 5) {
            errors.push("Company must be at least 5 characters");
        }

        // Address validation
        if (!checkoutForm.adress.trim() || checkoutForm.adress.trim().length < 5) {
            errors.push("Address must be at least 5 characters");
        }

        // Apartment validation (updated to 1 character minimum)
        if (!checkoutForm.apartment.trim() || checkoutForm.apartment.trim().length < 1) {
            errors.push("Apartment is required");
        }

        // City validation
        if (!checkoutForm.city.trim() || checkoutForm.city.trim().length < 5) {
            errors.push("City must be at least 5 characters");
        }

        // Country validation
        if (!checkoutForm.country.trim() || checkoutForm.country.trim().length < 5) {
            errors.push("Country must be at least 5 characters");
        }

        // Postal code validation
        if (!checkoutForm.postalCode.trim() || checkoutForm.postalCode.trim().length < 3) {
            errors.push("Postal code must be at least 3 characters");
        }

        return errors;
    };

    const makePurchase = async () => {
        // Client-side validation first
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            validationErrors.forEach(error => {
                toast.error(error);
            });
            return;
        }

        // Basic client-side checks for required fields (UX only)
        const requiredFields = [
            'name', 'lastname', 'phone', 'email', 'company',
            'adress', 'apartment', 'city', 'country', 'postalCode'
        ];

        const missingFields = requiredFields.filter(field =>
            !checkoutForm[field as keyof typeof checkoutForm]?.trim()
        );

        if (missingFields.length > 0) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (products.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        if (total <= 0) {
            toast.error("Invalid order total");
            return;
        }

        setIsSubmitting(true);

        try {
            console.log("🚀 Starting order creation...");

            // Get user ID if logged in
            let userId = null;
            if (session?.user?.email) {
                try {
                    console.log("🔍 Getting user ID for logged-in user:", session.user.email);
                    const userResponse = await apiClient.get(`/api/users/email/${session.user.email}`);
                    const userData = userResponse.data;
                    userId = userData.id;
                    console.log("✅ Found user ID:", userId);
                } catch (userError) {
                    console.log("⚠️  Error getting user ID:", userError);
                }
            }

            // Prepare the order data
            const orderData = {
                name: checkoutForm.name.trim(),
                lastname: checkoutForm.lastname.trim(),
                phone: checkoutForm.phone.trim(),
                email: checkoutForm.email.trim().toLowerCase(),
                company: checkoutForm.company.trim(),
                adress: checkoutForm.adress.trim(),
                apartment: checkoutForm.apartment.trim(),
                postalCode: checkoutForm.postalCode.trim(),
                status: "pending",
                total: total,
                city: checkoutForm.city.trim(),
                country: checkoutForm.country.trim(),
                orderNotice: checkoutForm.orderNotice.trim(),
                paymentMethod: checkoutForm.paymentMethod,
                userId: userId // Add user ID for notifications
            };

            console.log("📋 Order data being sent:", orderData);

            // Send order data to server for validation and processing
            const response = await apiClient.post("/api/orders", orderData);

            const data = response.data;
            console.log("✅ Parsed response data:", data);

            const orderId: string = data.id;
            console.log("🆔 Extracted order ID:", orderId);

            if (!orderId) {
                console.error("❌ Order ID is missing or falsy!");
                console.error("Full response data:", JSON.stringify(data, null, 2));
                throw new Error("Order ID not received from server");
            }

            console.log("✅ Order ID validation passed, proceeding with product addition...");

            // Add products to order
            for (let i = 0; i < products.length; i++) {
                console.log(`🛍️ Adding product ${i + 1}/${products.length}:`, {
                    orderId,
                    productId: products[i].id,
                    quantity: products[i].amount
                });

                await addOrderProduct(orderId, products[i].id, products[i].amount);
                console.log(`✅ Product ${i + 1} added successfully`);
            }

            console.log(" All products added successfully!");

            // Handle payment based on method
            if (checkoutForm.paymentMethod === 'online') {
                console.log("💳 Initiating online payment...");
                await initiateRazorpayPayment(orderId, total);
            } else {
                // COD - proceed as before
                console.log("💵 COD order - proceeding with success...");
                await handleOrderSuccess();
            }
        } catch (error: any) {
            console.error("💥 Error in makePurchase:", error);

            // Handle server validation errors
            if (error.response?.status === 400) {
                console.log(" Handling 400 error...");
                try {
                    const errorData = error.response.data;
                    console.log("Error data:", errorData);
                    if (errorData.details && Array.isArray(errorData.details)) {
                        // Show specific validation errors
                        errorData.details.forEach((detail: any) => {
                            toast.error(`${detail.field}: ${detail.message}`);
                        });
                    } else {
                        toast.error(errorData.error || "Validation failed");
                    }
                } catch (parseError) {
                    console.error("Failed to parse error response:", parseError);
                    toast.error("Validation failed");
                }
            } else if (error.response?.status === 409) {
                toast.error("Duplicate order detected. Please wait before creating another order.");
            } else {
                console.log("🔍 Handling generic error...");
                toast.error("Failed to create order. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const addOrderProduct = async (
        orderId: string,
        productId: string,
        productQuantity: number
    ) => {
        try {
            console.log("️ Adding product to order:", {
                customerOrderId: orderId,
                productId,
                quantity: productQuantity
            });

            const response = await apiClient.post("/api/order-product", {
                customerOrderId: orderId,
                productId: productId,
                quantity: productQuantity,
            });

            const data = response.data;
            console.log("✅ Product order successful:", data);

        } catch (error) {
            console.error("💥 Error creating product order:", error);
            throw error;
        }
    };

    const initiateRazorpayPayment = async (orderId: string, amount: number) => {
        try {
            console.log("🔄 Creating Razorpay order...");

            // Check if Razorpay is loaded
            if (!window.Razorpay) {
                throw new Error("Razorpay SDK not loaded. Please refresh the page and try again.");
            }

            // Create Razorpay order
            const response = await apiClient.post("/api/payments/create-order", {
                amount,
                orderId
            });

            const orderData = response.data;
            console.log("✅ Razorpay order created:", orderData);

            // Initialize Razorpay checkout
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'B-hive',
                description: 'Order Payment',
                order_id: orderData.id,
                handler: async function (response: any) {
                    console.log("💳 Payment successful:", response);

                    try {
                        // Verify payment on backend
                        await apiClient.post("/api/payments/verify-payment", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId
                        });

                        console.log("✅ Payment verified successfully");
                        await handleOrderSuccess();
                    } catch (verifyError: any) {
                        console.error("❌ Payment verification failed:", verifyError);
                        toast.error(verifyError.response?.data?.message || "Payment verification failed. Please contact support.");
                        setIsSubmitting(false);
                    }
                },
                prefill: {
                    name: checkoutForm.name,
                    email: checkoutForm.email,
                    contact: checkoutForm.phone,
                },
                theme: {
                    color: '#2563eb',
                },
                modal: {
                    ondismiss: function () {
                        console.log("💳 Payment cancelled by user");
                        toast.error("Payment was cancelled.");
                        setIsSubmitting(false);
                    },
                    escape: true,
                    animation: true,
                },
                retry: {
                    enabled: false,
                },
                timeout: 300, // 5 minutes
                remember_customer: true,
            };

            const rzp = new (window as any).Razorpay(options);

            // Handle payment failure
            rzp.on('payment.failed', function (response: any) {
                console.error("💳 Payment failed:", response);
                toast.error("Payment failed. Please try again or choose a different payment method.");
                setIsSubmitting(false);
            });

            rzp.open();

        } catch (error: any) {
            console.error("❌ Error initiating Razorpay payment:", error);
            toast.error(error.message || "Failed to initiate payment. Please try again.");
            setIsSubmitting(false);
        }
    };

    const handleOrderSuccess = async () => {
        // Clear form and cart
        setCheckoutForm({
            name: "",
            lastname: "",
            phone: "",
            email: "",
            company: "",
            adress: "",
            apartment: "",
            city: "",
            country: "",
            postalCode: "",
            orderNotice: "",
            paymentMethod: "cod",
        });
        clearCart();

        // Refresh notification count if user is logged in
        try {
            // This will trigger a refresh of notifications in the background
            window.dispatchEvent(new CustomEvent('orderCompleted'));
        } catch (error) {
            console.log('Note: Could not trigger notification refresh');
        }

        toast.success("Order placed successfully!");
        setTimeout(() => {
            router.push("/");
        }, 1000);
    };

    useEffect(() => {
        if (products.length === 0) {
            toast.error("You don't have items in your cart");
            router.push("/cart");
        }
    }, []);

    return (
        <div className="bg-white">
            <SectionTitle title="Checkout" path="Home | Cart | Checkout" />

            <div className="hidden h-full w-1/2 bg-white lg:block" aria-hidden="true" />
            <div className="hidden h-full w-1/2 bg-gray-50 lg:block" aria-hidden="true" />

            <main className="relative mx-auto grid max-w-screen-2xl grid-cols-1 gap-x-16 lg:grid-cols-2 lg:px-8 xl:gap-x-48">
                <h1 className="sr-only">Order information</h1>

                {/* Order Summary */}
                <section
                    aria-labelledby="summary-heading"
                    className="bg-gray-50 px-4 pb-10 pt-16 sm:px-6 lg:col-start-2 lg:row-start-1 lg:bg-transparent lg:px-0 lg:pb-16"
                >
                    <div className="mx-auto max-w-lg lg:max-w-none">
                        <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
                            Order summary
                        </h2>

                        <ul
                            role="list"
                            className="divide-y divide-gray-200 text-sm font-medium text-gray-900"
                        >
                            {products.map((product) => (
                                <li key={product?.id} className="flex items-start space-x-4 py-6">
                                    <Image
                                        src={product?.image ? `/${product?.image}` : "/product_placeholder.jpg"}
                                        alt={product?.title}
                                        width={80}
                                        height={80}
                                        className="h-20 w-20 flex-none rounded-md object-cover object-center"
                                    />
                                    <div className="flex-auto space-y-1">
                                        <h3>{product?.title}</h3>
                                        <p className="text-gray-500">x{product?.amount}</p>
                                    </div>
                                    <p className="flex-none text-base font-medium">
                                        ${product?.price}
                                    </p>
                                </li>
                            ))}
                        </ul>

                        <dl className="hidden space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-gray-900 lg:block">
                            <div className="flex items-center justify-between">
                                <dt className="text-gray-600">Subtotal</dt>
                                <dd>${total}</dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt className="text-gray-600">Shipping</dt>
                                <dd>$5</dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt className="text-gray-600">Taxes</dt>
                                <dd>${total / 5}</dd>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                                <dt className="text-base">Total</dt>
                                <dd className="text-base">
                                    ${total === 0 ? 0 : Math.round(total + total / 5 + 5)}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </section>

                <form className="px-4 pt-16 sm:px-6 lg:col-start-1 lg:row-start-1 lg:px-0">
                    <div className="mx-auto max-w-lg lg:max-w-none">
                        {/* Contact Information */}
                        <section aria-labelledby="contact-info-heading">
                            <h2
                                id="contact-info-heading"
                                className="text-lg font-medium text-gray-900"
                            >
                                Contact information
                            </h2>

                            <div className="mt-6">
                                <label
                                    htmlFor="name-input"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Name * (min 2 characters)
                                </label>
                                <div className="mt-1">
                                    <input
                                        value={checkoutForm.name}
                                        onChange={(e) =>
                                            setCheckoutForm({
                                                ...checkoutForm,
                                                name: e.target.value,
                                            })
                                        }
                                        type="text"
                                        id="name-input"
                                        name="name-input"
                                        autoComplete="given-name"
                                        required
                                        disabled={isSubmitting}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <label
                                    htmlFor="lastname-input"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Lastname * (min 2 characters)
                                </label>
                                <div className="mt-1">
                                    <input
                                        value={checkoutForm.lastname}
                                        onChange={(e) =>
                                            setCheckoutForm({
                                                ...checkoutForm,
                                                lastname: e.target.value,
                                            })
                                        }
                                        type="text"
                                        id="lastname-input"
                                        name="lastname-input"
                                        autoComplete="family-name"
                                        required
                                        disabled={isSubmitting}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <label
                                    htmlFor="phone-input"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Phone number * (min 10 digits)
                                </label>
                                <div className="mt-1">
                                    <input
                                        value={checkoutForm.phone}
                                        onChange={(e) =>
                                            setCheckoutForm({
                                                ...checkoutForm,
                                                phone: e.target.value,
                                            })
                                        }
                                        type="tel"
                                        id="phone-input"
                                        name="phone-input"
                                        autoComplete="tel"
                                        required
                                        disabled={isSubmitting}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <label
                                    htmlFor="email-address"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Email address *
                                </label>
                                <div className="mt-1">
                                    <input
                                        value={checkoutForm.email}
                                        onChange={(e) =>
                                            setCheckoutForm({
                                                ...checkoutForm,
                                                email: e.target.value,
                                            })
                                        }
                                        type="email"
                                        id="email-address"
                                        name="email-address"
                                        autoComplete="email"
                                        required
                                        disabled={isSubmitting}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Payment Notice */}
                        <section className="mt-10">
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">
                                            Payment Information
                                        </h3>
                                        <div className="mt-2 text-sm text-blue-700">
                                            <p>Choose your payment method below. Online payments are processed securely via Razorpay. COD orders will be paid upon delivery.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Payment Method Selection */}
                        <section aria-labelledby="payment-method-heading" className="mt-10">
                            <h2
                                id="payment-method-heading"
                                className="text-lg font-medium text-gray-900"
                            >
                                Payment Method *
                            </h2>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center">
                                    <input
                                        id="cod"
                                        name="payment-method"
                                        type="radio"
                                        value="cod"
                                        checked={checkoutForm.paymentMethod === "cod"}
                                        onChange={(e) =>
                                            setCheckoutForm({
                                                ...checkoutForm,
                                                paymentMethod: e.target.value,
                                            })
                                        }
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                                        Cash on Delivery (COD)
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="online"
                                        name="payment-method"
                                        type="radio"
                                        value="online"
                                        checked={checkoutForm.paymentMethod === "online"}
                                        onChange={(e) =>
                                            setCheckoutForm({
                                                ...checkoutForm,
                                                paymentMethod: e.target.value,
                                            })
                                        }
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <label htmlFor="online" className="ml-3 block text-sm font-medium text-gray-700">
                                        Online Payment (Razorpay)
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* Shipping Address */}
                        <section aria-labelledby="shipping-heading" className="mt-10">
                            <h2
                                id="shipping-heading"
                                className="text-lg font-medium text-gray-900"
                            >
                                Shipping address
                            </h2>

                            <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                                <div className="sm:col-span-3">
                                    <label
                                        htmlFor="company"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Company *
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            id="company"
                                            name="company"
                                            required
                                            disabled={isSubmitting}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={checkoutForm.company}
                                            onChange={(e) =>
                                                setCheckoutForm({
                                                    ...checkoutForm,
                                                    company: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label
                                        htmlFor="address"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Address *
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            id="address"
                                            name="address"
                                            autoComplete="street-address"
                                            required
                                            disabled={isSubmitting}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={checkoutForm.adress}
                                            onChange={(e) =>
                                                setCheckoutForm({
                                                    ...checkoutForm,
                                                    adress: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label
                                        htmlFor="apartment"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Apartment, suite, etc. * (required)
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            id="apartment"
                                            name="apartment"
                                            required
                                            disabled={isSubmitting}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={checkoutForm.apartment}
                                            onChange={(e) =>
                                                setCheckoutForm({
                                                    ...checkoutForm,
                                                    apartment: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="city"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        City *
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            autoComplete="address-level2"
                                            required
                                            disabled={isSubmitting}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={checkoutForm.city}
                                            onChange={(e) =>
                                                setCheckoutForm({
                                                    ...checkoutForm,
                                                    city: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="region"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Country *
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            id="region"
                                            name="region"
                                            autoComplete="address-level1"
                                            required
                                            disabled={isSubmitting}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={checkoutForm.country}
                                            onChange={(e) =>
                                                setCheckoutForm({
                                                    ...checkoutForm,
                                                    country: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="postal-code"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Postal code *
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            id="postal-code"
                                            name="postal-code"
                                            autoComplete="postal-code"
                                            required
                                            disabled={isSubmitting}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={checkoutForm.postalCode}
                                            onChange={(e) =>
                                                setCheckoutForm({
                                                    ...checkoutForm,
                                                    postalCode: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label
                                        htmlFor="order-notice"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Order notice
                                    </label>
                                    <div className="mt-1">
                                        <textarea
                                            className="textarea textarea-bordered textarea-lg w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            id="order-notice"
                                            name="order-notice"
                                            autoComplete="order-notice"
                                            disabled={isSubmitting}
                                            value={checkoutForm.orderNotice}
                                            onChange={(e) =>
                                                setCheckoutForm({
                                                    ...checkoutForm,
                                                    orderNotice: e.target.value,
                                                })
                                            }
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="mt-10 border-t border-gray-200 pt-6 ml-0">
                            <button
                                type="button"
                                onClick={makePurchase}
                                disabled={isSubmitting}
                                className="w-full rounded-md border border-transparent bg-blue-500 px-20 py-2 text-lg font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-gray-50 sm:order-last disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Processing Order..." : "Place Order"}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CheckoutPage;

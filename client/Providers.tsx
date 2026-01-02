"use client";
import { Toaster } from "react-hot-toast";
import { useProductStore } from "@/app/_zustand/store";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const { initializeAuth, setAuthenticated } = useProductStore();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Initialize auth on app load
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Handle session changes
    if (status === "authenticated") {
      setAuthenticated(true);
    } else if (status === "unauthenticated") {
      setAuthenticated(false);
    }
  }, [status, setAuthenticated]);

  return (
    <>
      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "17px",
          },
        }}
      />
      {children}
    </>
  );
};

export default Providers;
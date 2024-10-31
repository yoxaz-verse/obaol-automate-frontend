"use client";

import { useContext, useEffect } from "react";
import AuthContext from "@/context/AuthContext"; // Adjust the import path as necessary
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import Template from "../template";
import PrivateRoute from "@/components/Login/private-route";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { authRoutes } from "@/core/api/apiRoutes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  // Example: Fetch data based on user role
  // Replace 'YOUR_API_ENDPOINT' with the actual endpoint
  // const {
  //   data: roleData,
  //   isLoading: roleDataLoading,
  //   error: roleDataError,
  // } = useQuery(
  //   ["roleData", user?.role],
  //   () => {
  //     if (user?.role) {
  //       // Define your API endpoint based on the role
  //       const endpoint = authRoutes.getRoleSpecificData(user.role);
  //       return getData(endpoint);
  //     }
  //     return Promise.resolve(null);
  //   }
  //   // {
  //   //   enabled: !!user?.role, // Only run if user.role is available
  //   // }
  // );

  return (
    <section className="w-full h-full flex">
      <PrivateRoute>
        <div className="w-1/6 h-screen hidden lg:block">
          <Sidebar />
        </div>
        <div className="w-full lg:w-4/5 lg:h-screen ">
          <div>
            {/* Check if user data is available before rendering TopBar */}
            {user && (
              <TopBar
                username={user.email} // Assuming user.email exists
                role={user.role} // Assuming user.role is a string
              />
            )}

            <div className="h-full w-full">
              {/* Optionally, handle role-specific loading or error */}
              {/* {roleDataLoading && <p>Loading role-specific data...</p>} */}
              {/* {roleDataError && <p>Error loading role-specific data</p>} */}

              <Template>{children}</Template>
            </div>
          </div>
        </div>
      </PrivateRoute>
    </section>
  );
}

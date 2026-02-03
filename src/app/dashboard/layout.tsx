"use client";

import { useContext } from "react";
import AuthContext from "@/context/AuthContext"; // Adjust the import path as necessary
import TopBar from "@/components/dashboard/TopBar";
import Template from "../template";
import PrivateRoute from "@/components/Login/private-route";
import { usePathname } from "next/navigation";
import { Spacer } from "@nextui-org/react";
import { getAllowedRoles } from "@/utils/roleHelpers";

// export const routeRoles: { [key: string]: string[] } = {
//   "/dashboard": [
//     "Admin",
//     "Customer",
//     "ActivityManager",
//     "ProjectManager",
//     "Worker",
//   ],
//   "/dashboard/projects": [
//     "Admin",
//     "Customer",
//     "ActivityManager",
//     "ProjectManager",
//     "Worker",
//   ],
//   "/dashboard/essentials": ["Admin"],
//   "/dashboard/activity": [],
//   "/dashboard/users": ["Admin"],
// };
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Gets the current URL pathname

  const allowedRoles = getAllowedRoles(pathname); // Dynamically determine allowed roles

  const { user } = useContext(AuthContext);

  return (
    <section className="w-full h-full flex overflow-hidden bg-content1">
      {/* <GoogleTagManager />÷ */}

      <PrivateRoute allowedRoles={allowedRoles}>
        {/* <div className="w-1/6 h-screen hidden xl:block">
          <Sidebar />
        </div> */}
        <div className="w-full  lg:h-screen overflow-hidden  ">
          <div>
            {/* Check if user data is available before rendering TopBar */}
            {user && (
              <TopBar
                username={user.email} // Assuming user.email exists
                role={user.role} // Assuming user.role is a string
              />
            )}
            <Spacer y={2} />
            <div className="max-h-[84vh] w-full overflow-y-auto ">
              {/* Optionally, handle role-specific loading or error */}
              {/* {roleDataLoading && <p>Loading role-specific data...</p>} */}
              {/* {roleDataError && <p>Error loading role-specific data</p>} */}

              <Template>
                {children}
              </Template>
            </div>
          </div>
        </div>
      </PrivateRoute>
    </section>
  );
}

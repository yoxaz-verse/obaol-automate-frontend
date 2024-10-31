import { deleteData } from "@/core/api/apiHandler";
import { ReactNode } from "react";

export interface authenticationProps {
  isAuthenticated?: boolean;
}
export interface adminLogin {
  url: string;
}

export interface ToastMessage {
  type: string;
  message: string;
  position?: string;
}
export interface TopbarProps {
  username: string;
  role: string;
}
export interface DashboardTileProps {
  heading?: string;
  data?: string;
  type: string;
  stats?: string;
}
export interface sidebarProps {
  tabChange: (tabname: string) => void;
}
export interface TableDataInterface {
  createdAt?: string;
  _id?: string;
  name?: string;
  Role?: {
    roleName?: string;
  };
  avatar?: string;
  email?: string;
  team?: string;
  age?: string;
  status?: string;
  actions?: string;
}
export interface TableProps {
  TableData: any[]; // Array of data to be displayed in the table
  columns: Column[]; // Array of column configurations
  viewProjectDetails?: (data: any) => void; // Optional handler for viewing project details
  verifyActivity?: (data: any) => void; // Optional handler for verifying activity
  deleteModal?: (data: any) => ReactNode; // Optional ReactNode for delete modal
  viewModal?: (data: any) => ReactNode; // Optional ReactNode for view modal
  redirect?: (data: any) => void; // Optional handler for redirecting
  isLoading?: boolean; // Optional flag for loading state
  deleteData?: {
    endpoint: string; // API endpoint to call for deleting data
    key: any[]; // Keys associated with the delete action
    type: string; // Type of item being deleted (for display purposes)
  };
}
export interface Column {
  name: string;
  uid: string;
}
export interface ProjectDetailProps {
  id: string;
  role: string;
  setProjectDetail: (data: any) => void;
}
export interface ProjectDetailProgressProps {
  heading: string;
  subheading: string;
  progress: number;
}
export interface ProjectDetailCardProps {
  data: {
    projectName: string;
    projectManager: {
      name: string;
      role: string;
      avatar: string;
    };
    description: string;
    statusOptions: statusOptions[];
  };
}
export interface ActivityDetailCardProps {
  data: {
    projectName: string;
    projectManager: {
      name: string;
      role: string;
      avatar: string;
    };
    actualdate: string;
    forecastdate: string;
    targetdate: string;
    description: string;
    statusOptions: statusOptions[];
  };
}
export interface statusOptions {
  key: string;
  text: string;
  color: string;
}

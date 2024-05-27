export interface authenticationProps {
  isAuthenticated?: boolean;
}
export interface adminLogin {
  url: string
}

export interface ToastMessage {
  type: string;
  message: string;
  position?: string;
}
export interface TopbarProps {
  username: string,
  role: string,
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
  id: number;
  name: string;
  role?: string;
  avatar: string;
  email: string;
  team?: string;
  age?: string;
  status: string;
  actions?: string;
}
export interface TableProps {
  TableData: TableDataInterface[];
  columns: Column[];
  viewProjectDetails?: (data: any) => void;
  verifyActivity?: (data: any) => void;
}
export interface Column {
  name: string;
  uid: string;
}
export interface ProjectDetailProps {
  data: {
    id: string;
  }
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
      name: string,
      role: string,
      avatar: string,
    }
    description: string;
    statusOptions: statusOptions[]
  }
}
export interface ActivityDetailCardProps {
  data: {
    projectName: string;
    projectManager: {
      name: string,
      role: string,
      avatar: string,
    }
    actualdate: string,
    forecastdate: string,
    targetdate: string,
    description: string;
    statusOptions: statusOptions[]
  }
}
export interface statusOptions {
  key: string;
  text: string;
  color: string
}
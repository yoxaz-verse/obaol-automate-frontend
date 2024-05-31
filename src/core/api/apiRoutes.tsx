export const accountRoutes = {
   superadminlogin: '/superadmin/login',
   adminlogin: '/admin/login',
   managerlogin: '/manager/login',
   customerlogin: '/customer/login',
   serviceslogin: '/services/login',
   workerlogin: '/worker/login',
}

const user = "/user";
const role = "/role";
const location = "/location";
const status = "/status";
const project = "/project";
const subStatus = "/subStatus";

export const authRoutes = {
   login: `${user}/login`,
   checkUser: `/check-user`,
}

export const userRoutes = {
   getByRole: `${user}/role/`,
   getAll: `${user}`,
   delete: `${user}/isDeleted/`,
}

export const roleRoutes = {
   getAll: `${role}`,
}

export const locationRoutes = {
   getAll: `${location}`,
   delete: `${location}/isDeleted/`,
}

export const statusRoutes = {
   getAll: `${status}`,
}

export const subStatusRoutes = {
   getAll: `${subStatus}`,
}

export const projectRoutes = {
   getAll: `${project}`,
   create: `${project}/create`,
   delete: `${project}/isDeleted/`,
}
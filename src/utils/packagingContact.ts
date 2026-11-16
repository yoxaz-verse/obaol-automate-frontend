import { postData } from "@/core/api/apiHandler"; import { packagingRoutes } from "@/core/api/apiRoutes";
export const trackPackagingContact=(id:string,channel:"PHONE"|"EMAIL"|"WHATSAPP"|"WEBSITE")=>{void postData(packagingRoutes.contact(id),{channel}).catch(()=>undefined)};

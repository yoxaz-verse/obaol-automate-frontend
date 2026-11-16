import { postData } from "@/core/api/apiHandler"; import { inlandTransportationRoutes } from "@/core/api/apiRoutes";
export const trackTransportContact=(id:string,channel:"PHONE"|"EMAIL"|"WHATSAPP"|"WEBSITE")=>{void postData(inlandTransportationRoutes.directoryContact(id),{channel}).catch(()=>undefined)};

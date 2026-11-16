"use client";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
const icon=L.divIcon({className:"freight-forwarder-icon",html:'<div style="width:24px;height:24px;border-radius:50%;background:#1b2632;border:3px solid #ff9f58;box-shadow:0 4px 12px #0006"></div>',iconSize:[24,24],iconAnchor:[12,12]});
function Fit({markers}:{markers:any[]}){const map=useMap();useEffect(()=>{const points=markers.map(x=>[Number(x.latitude),Number(x.longitude)] as [number,number]);if(points.length===1)map.setView(points[0],8);else if(points.length>1)map.fitBounds(points,{padding:[32,32],maxZoom:8})},[map,markers]);return null}
export default function FreightForwardersMap({markers,onOpen}:{markers:any[];onOpen:(id:string)=>void}){const safe=markers.filter(x=>Number.isFinite(Number(x.latitude))&&Number.isFinite(Number(x.longitude)));return <MapContainer className="themed-leaflet-map" center={[20.5937,78.9629]} zoom={4} style={{height:"100%",width:"100%"}} attributionControl={false}><Fit markers={safe}/><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{safe.map(x=><Marker key={`${x.profileId}-${x.latitude}-${x.longitude}`} position={[Number(x.latitude),Number(x.longitude)]} icon={icon}><Popup><div className="space-y-2"><b>{x.displayName}</b><p className="text-xs">{x.label}</p><button className="font-bold text-primary" onClick={()=>onOpen(x.profileId)}>View profile</button></div></Popup></Marker>)}</MapContainer>}

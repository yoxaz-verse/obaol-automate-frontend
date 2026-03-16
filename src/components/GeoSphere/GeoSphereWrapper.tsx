"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { MarkerData } from "@/components/GeoSphere/GeoSphere";
import { Spinner } from "@nextui-org/react";
import { LuGlobe } from "react-icons/lu";

const GeoSphere = dynamic(() => import("@/components/GeoSphere/GeoSphere"), {
  ssr: false,
});

interface GeoSphereWrapperProps {
  mappingValue: MarkerData[];
}

export default function GeoSphereWrapper({
  mappingValue,
}: GeoSphereWrapperProps) {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Show a small delay to simulate processing and ensure the map component 
    // is ready to receive markers without flickering
    if (mappingValue) {
      setIsReady(false);
      const timer = setTimeout(() => {
        setMarkers(mappingValue);
        setIsReady(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [mappingValue]);

  return (
    <div className="h-[82vh] w-full relative group">
      <GeoSphere markers={markers} />

      {!isReady && (
        <div className="absolute inset-0 z-[100] rounded-xl bg-content1/40 backdrop-blur-[2px] transition-all duration-500 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-content1/90 p-8 rounded-3xl shadow-2xl border border-default-200/50 flex flex-col items-center gap-5 max-w-sm w-full animate-in fade-in zoom-in duration-300">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-warning-500/10 flex items-center justify-center border-2 border-warning-400/20 shadow-inner">
                <LuGlobe className="text-warning-500 animate-spin-slow" size={36} />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-warning-500/30 animate-ping opacity-20" />
              <span className="absolute -right-1 -top-1">
                <Spinner size="sm" color="warning" />
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black tracking-tight text-foreground">
                Synchronizing Geo-Data
              </h3>
              <p className="text-xs text-default-500 font-medium px-4">
                Populating global UnLoCode coordinates. This ensures real-time tracking accuracy across the network.
              </p>
            </div>

            {/* Progress bar simulation for UX */}
            <div className="w-full space-y-2 pt-2">
              <div className="w-full h-1.5 rounded-full bg-default-100 overflow-hidden relative border border-default-200/30">
                <div
                  className="absolute inset-y-0 bg-gradient-to-r from-warning-400 to-warning-600 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"
                  style={{ width: '40%' }}
                />
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest">Optimizing View</span>
                <span className="text-[10px] icon-spinner animate-spin text-warning-500" />
              </div>
            </div>
          </div>

          <style>{`
            @keyframes loading {
              0% { left: -40%; width: 40%; }
              50% { width: 60%; }
              100% { left: 100%; width: 40%; }
            }
            .animate-spin-slow {
              animation: spin 3s linear infinite;
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

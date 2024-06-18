"use client";
import React, { useState } from "react";

export default function ActivityIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [viewactivity, setNewActivity] = useState(false);
  const [verifyactivity, setVerifyActivity] = useState(false);
  const [activitydata, setActivityData] = useState();
  function verifyActivity(data: any) {
    console.log(data)
    setVerifyActivity(true)
  }

  return (
    <>
      {children}
    </>
  )
}

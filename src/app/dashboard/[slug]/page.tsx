"use client";
import TopBar from '@/components/dashboard/TopBar';
import { getData } from '@/core/api/apiHandler';
import { authRoutes } from '@/core/api/apiRoutes';
import { tabUtil } from '@/utils/utils'
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react'

function Page({ params }: { params: { slug: string } }) {
  const userData = useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      return await getData(authRoutes.checkUser, {})
    }
  })
  const [currentTab, setCurrentTab] = useState('Dashboard');
  function TabChange(tabName: string) {
    setCurrentTab(tabName);
  }
  return (
    <div>
      <TopBar username={
        userData.data?.data?.data?.user?.name
      }
        role={userData.data?.data?.data?.user?.role?.roleName}
      />

      <div className="h-full w-full">
        {tabUtil(currentTab, params.slug)}
      </div>
    </div>
  )
}

export default Page
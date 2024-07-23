"use client"
import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

function Template({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence>
      <motion.div
        key={usePathname()}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      >{children}</motion.div>
    </AnimatePresence>
  )
}

export default Template

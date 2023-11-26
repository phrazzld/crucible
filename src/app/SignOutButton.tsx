"use client"

import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import React from 'react'
import { useRouter } from "next/navigation";

export const SignOutButton = () => {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error: any) {
      console.error(error)
    }
  }

  if (!auth.currentUser) return null

  return (
    <div className="flex flex-row items-center justify-center"
    >
      <p className="text-sm font-semibold text-gray-400 mr-4">
        {auth.currentUser.uid}
      </p>
      <p className="text-sm font-semibold text-gray-800 mr-4">
        {auth.currentUser.email}
      </p>
      <button
        onClick={handleSignOut}
        className="text-sm font-semibold text-red-800"
      >
        Sign Out
      </button>
    </div>
  )
}

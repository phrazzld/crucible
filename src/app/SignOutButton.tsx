"use client"

import { useAuthContext } from '@/context/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import React from 'react'
import { useRouter } from "next/navigation";

export const SignOutButton = () => {
  const { user } = useAuthContext()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (error: any) {
      console.error(error)
    }
  }

  if (!user) return <></>
  if (!auth.currentUser) return <></>

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

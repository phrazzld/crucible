"use client";

import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSignup = async (e: any) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-20">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-800 space-y-8">
          <h1 className="text-3xl font-semibold">Sign Up</h1>
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm font-semibold text-left p-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-100 text-blue-600 font-semibold py-2 px-4 rounded-md"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="password" className="text-sm font-semibold text-left p-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-100 text-blue-600 font-semibold py-2 px-4 rounded-md"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-md w-full hover:bg-blue-700"
            >
              Sign Up
            </button>
          </form>
          {errorMessage && <p className="text-red-400 mt-4">{errorMessage}</p>}
        </div>
      </div>
      <div className="text-white mt-4 flex flex-row">
        Already have an account?{" "}
        <Link href="/login">
          <p className="text-blue-300 hover:text-blue-500 px-2">Log In</p>
        </Link>
      </div>
    </div>
  );
}

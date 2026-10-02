"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, X, Loader2 } from "lucide-react";
import { handleCustomAuth, redirectToGoogle } from "@/app/actions/auth";
import Navbar from "./Navbar";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(handleCustomAuth, null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    (() => {
      if (state?.error) {
        setIsVisible(true);
      }
    })();
  }, [state]);

  return (
    <>
      <Navbar />

      <section className="flex items-center justify-center font-sans">
        <div className="w-full max-w-md mx-auto p-8 sm:p-10 z-10">
          {/* Header */}
          <h1 className="text-4xl font-bold mb-6 text-center">Welcome back!</h1>

          {/* Invalid input warning */}
          {state?.error && isVisible && (
            <div className="flex text-red-600 text-sm mb-4 bg-red-200 px-3 py-4 rounded-sm justify-between items-center transition-all">
              <span className="text-base font-semibold">{state.error}</span>
              <X
                className="h-5 w-5 cursor-pointer"
                onClick={() => setIsVisible(false)}
              />
            </div>
          )}

          <form action={formAction} className="space-y-4">
            {/* Email input */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-base ml-0.5 font-semibold">
                Email
              </Label>
              <Input type="email" id="email" placeholder="Enter your email" />
            </div>

            {/* Password input */}
            <div className="space-y-1.5 relative">
              <Label
                htmlFor="password"
                className="text-base ml-0.5 font-semibold"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black cursor-pointer"
                >
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 text-xl py-6 font-semibold"
            >
              {isPending ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Separator */}
          <div className="or-separator max-w-sm mx-auto mt-8 mb-6">
            <span className="text-xl text-gray-500 px-3">OR</span>
          </div>

          {/* Google Auth Button */}
          <Button
            variant="outline"
            onClick={() => {
              setIsLoading(true);
              redirectToGoogle();
            }}
            disabled={isLoading}
            className="w-full py-6.5 font-mediumtext-base"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png"
                alt="Google"
                width={20}
                height={20}
                unoptimized
                className="w-5 h-5 mr-4"
              />
            )}
            Continue with Google
          </Button>
        </div>
      </section>
    </>
  );
}

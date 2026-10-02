"use client";

import { Dices, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User } from "@/app/actions/profile";

interface NavbarProps {
  homePage: boolean
  user?: User;
}

export default function Navbar({ homePage, user }: NavbarProps) {
  const { setTheme } = useTheme();

  return (
    <nav className="bg-primary flex items-center justify-between px-6 py-2 lg:px-8 w-full border-b-4 border-t-[1.5px] mb-4">
      {/* Logo */}
      <div className="shrink-0 flex items-center space-x-2">
        <Dices size={32} strokeWidth={2.5} className="text-black" />
        <span className="text-[34px] dark:text-black font-bold font-mono tracking-[0.075em] md:tracking-widest">
          IMAGO
        </span>
      </div>

      <div className="shrink-0 flex items-center space-x-5">
        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User image */}
        {homePage && user && (
          <Avatar>
            <AvatarImage
              src={user.profileImage}
              alt={user.firstName + user.lastName}
            />
            <AvatarFallback>
              {user.firstName[0] + user.lastName[0]}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </nav>
  );
}

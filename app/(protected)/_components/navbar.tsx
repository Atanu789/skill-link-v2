"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/auth/user-button";
import SearchBar from "../search/components/search-bar";

export const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    // Add logic here to handle search functionality
  };

  return (
    <nav className="bg-secondary flex justify-between items-center p-4 rounded-xl w-full shadow-sm">
     
      <div className="flex items-center justify-between w-full space-x-4">
        {/* Use your SearchBar component here */}
        <SearchBar/>
        
        {/* Use your UserButton component here */}
        <div className="flex items-center justify-center gap-10">
        
         <Button className="border-neutral-200 dark:border-slate-800 transform transition-transform duration-300 hover:scale-95 px-3 py-1">
              <Link href="/posts" className="text-white rounded-full font-bold">Create Post</Link>
            </Button>
<UserButton />
            </div>
      </div>
    </nav>
  );
};

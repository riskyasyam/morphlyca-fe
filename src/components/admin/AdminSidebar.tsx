"use client";
import { useState } from "react";
import { Search, Compass, Library, LogOut, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SearchModal from "./SearchModal";

export default function AdminSidebar() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  const menuItems = [
    { icon: Home, label: "Dashoard", href: "/admin/dashboard" },
    { icon: Compass, label: "Explore", href: "/admin/explore" },
    { icon: Library, label: "My Media", href: "/admin/library" },
  ];

  return (
    <div className="w-60 bg-black h-screen fixed left-0 top-0 z-50 border-r border-gray-800">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">S</span>
          </div>
          <span className="text-white font-semibold text-lg">Swaplify</span>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative cursor-pointer" onClick={() => setIsSearchModalOpen(true)}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-gray-600 cursor-pointer"
            readOnly
          />
        </div>
      </div>

      {/* Menu Items */}
      <nav className="px-4 space-y-2">
        {menuItems.map((item, index) => (
          <Link key={index} href={item.href}>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 left-4 right-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
      
      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
      />
    </div>
  );
}

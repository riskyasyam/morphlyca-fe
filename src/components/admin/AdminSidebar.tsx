"use client";
import { useState, useEffect } from "react";
import { Search, Compass, Library, LogOut, Home, User, Podcast, Notebook, Cpu, Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { handleLogout as authLogout } from "@/lib/auth";
import SearchModal from "./SearchModal";
import Image from "next/image";
import { fetchMe } from "@/lib/me";
import type { User as UserType } from "@/types/user";

export default function AdminSidebar() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/admin/dashboard" },
    { icon: User, label: "User", href: "/admin/user" },
    { icon: Notebook, label: "Plan", href: "/admin/plan" },
    { icon: Crown, label: "Entitlements", href: "/admin/entitlements" },
    { icon: Cpu, label: "Feature", href: "/admin/feature" },
    { icon: Podcast, label: "Subscription", href: "/admin/subscription" },
    { icon: Compass, label: "Explore", href: "/admin/explore" },
    { icon: Library, label: "My Media", href: "/admin/library" },
  ];

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await fetchMe();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    const isConfirmed = window.confirm("Are you sure you want to logout?");
    if (!isConfirmed) return;
    
    try {
      await authLogout(); // This will clear tokens and cookies
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails, redirect to login page
      router.push("/");
    }
  };

  // Check if user is admin (not USER role)
  const isAdmin = user?.role && user.role !== "USER";

  return (
    <div className="w-60 bg-black h-screen fixed left-0 top-0 z-50 border-r border-gray-800">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center">
          <div>
            <Image src="/logo/logo.svg" alt="Morpylica" width={150} height={60} />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative cursor-pointer" onClick={() => setIsSearchModalOpen(true)}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search..." className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-gray-600 cursor-pointer" readOnly />
        </div>
      </div>

      {/* Menu Items */}
      <nav className="px-4 space-y-2">
        <div>
          {menuItems
            .filter((item) =>
              ["Dashboard"].includes(item.label)
            )
            .map((item, index) => (
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
        </div>

        {/* Admin Management - Only show for non-USER roles */}
        {!loading && isAdmin && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Admin Management
            </p>
            {menuItems
              .filter((item) =>
                ["User", "Subscription", "Plan", "Entitlements", "Feature"].includes(item.label)
              )
              .map((item, index) => (
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
          </div>
        )}

        {/* Generate AI */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Generate AI
          </p>
          {menuItems
            .filter((item) =>
              ["Explore", "My Media"].includes(item.label)
            )
            .map((item, index) => (
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
        </div>
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 left-4 right-4">
        <Button 
          variant="ghost" 
          onClick={handleLogout} 
          className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 mr-3" /> 
          Logout
        </Button>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </div>
  );
}
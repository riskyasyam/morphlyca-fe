"use client";
import { Bell, Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePathname, useRouter } from "next/navigation";
import { handleLogout as authLogout } from "@/lib/auth";
import { useState } from "react";




export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await authLogout(); // This will clear tokens and cookies
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails, redirect to login page
      router.push("/");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  // Mapping pathname ke judul
  const pageTitles: Record<string, string> = {
    "/admin/dashboard": "Dashboard",
    "/admin/user": "User",
    "/admin/subscription": "Subscription",
    "/admin/plan": "Plan",
    "/admin/feature": "Feature",
    "/admin/explore": "Explore",
    "/admin/library": "My Media",
    "/admin/entitlements": "Entitlements",
  };

  // Ambil judul sesuai path, fallback ke "Dashboard"
  const title = pageTitles[pathname] || "Dashboard";

  return (
    <nav className="h-16 bg-black border-b border-gray-800 fixed top-0 right-0 left-60 z-40">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left side - Title/Breadcrumb */}
        <div className="flex items-center space-x-2">
          <h1 className="text-white text-lg font-semibold">{title}</h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
            <Bell className="w-5 h-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback className="bg-white text-black">
                    U
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-black border-gray-800" align="end" forceMount>
              <DropdownMenuLabel className="text-gray-200">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 hover:text-white">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 hover:text-white">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem 
                onClick={() => setShowLogoutDialog(true)}
                className="text-red-400 hover:bg-gray-800 hover:text-red-300 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-red-400" />
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogoutConfirm}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoggingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Yes, Logout
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { X } from "lucide-react";
import type { User } from "@/types/user";
import { fetchUsers } from "@/lib/user";

const getRoleBadgeVariant = (role: string) => (role === "ADMIN" ? "default" : "secondary");

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.trim().toLowerCase();
    return users.filter((u) =>
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  }, [users, query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-black border border-gray-800 rounded-lg overflow-hidden">
      {/* Header + Search */}
      <div className="p-6 border-b border-gray-800 flex items-center justify-between gap-4 relative z-[60] pointer-events-auto">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white truncate">
            Users ({filtered.length}{users.length !== filtered.length ? ` / ${users.length}` : ""})
          </h3>
          <p className="text-sm text-gray-400 mt-1">Manage system users and their roles</p>
        </div>

        <div className="relative">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, role, or user id…"
            className="bg-gray-900 border-gray-700 text-white w-72 pr-8"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable table (no pagination) */}
      <div className="overflow-auto max-h-[70vh]">
        <Table className="min-w-full">
          <TableHeader className="sticky top-0 z-10 bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/60">
            <TableRow className="border-gray-800">
              <TableHead className="text-gray-300 font-medium pl-6">Name</TableHead>
              <TableHead className="text-gray-300 font-medium">User ID</TableHead>
              <TableHead className="text-gray-300 font-medium">Email</TableHead>
              <TableHead className="text-gray-300 font-medium">Role</TableHead>
              <TableHead className="text-gray-300 font-medium">Created At</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((user) => (
              <TableRow
                key={user.id}
                className="border-gray-800 hover:bg-gray-900/30 transition-colors"
              >
                <TableCell className="font-medium text-white pl-6">
                  {user.displayName}
                </TableCell>
                <TableCell className="text-gray-500 font-mono text-xs">
                  {user.id}
                </TableCell>
                <TableCell className="text-gray-300">
                  {user.email}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={getRoleBadgeVariant(user.role)}
                    className={
                      user.role === "ADMIN"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-600 hover:bg-gray-700 text-gray-100"
                    }
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-400">
                  {formatDate(user.createdAt)}
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                  {query ? "No users match your search." : "No users found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

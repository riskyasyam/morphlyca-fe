"use client";
import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { fetchUsers } from "@/lib/user";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const UserTable = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoading(true); const userData = await fetchUsers();
                setUsers(userData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load users');
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const getRoleBadgeVariant = (role: string) => {
        return role === 'ADMIN' ? 'default' : 'secondary';
    };

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
                <p>Error: {error}</p> </div>);
    } return (
        <div className="bg-black border border-gray-800 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-white">Users ({users.length})</h3>
                <p className="text-sm text-gray-400 mt-1">Manage system users and their roles</p>
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-gray-800 hover:bg-gray-900/50">
                            <TableHead className="text-gray-300 font-medium pl-6">Name</TableHead>
                            <TableHead className="text-gray-300 font-medium pl-6">Email</TableHead>
                            <TableHead className="text-gray-300 font-medium pl-6">Role</TableHead>
                            <TableHead className="text-gray-300 font-medium pl-6">Created At</TableHead>
                            <TableHead className="text-gray-300 font-medium pl-6">User ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="border-gray-800 hover:bg-gray-900/30 transition-colors" >
                                <TableCell className="font-medium text-white pl-6">
                                    {user.displayName}
                                </TableCell>
                                <TableCell className="text-gray-300 pl-6">
                                    {user.email}
                                </TableCell>
                                <TableCell className="pl-6">
                                    <Badge
                                        variant={getRoleBadgeVariant(user.role)}
                                        className={
                                            user.role === 'ADMIN'
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                : 'bg-gray-600 hover:bg-gray-700 text-gray-100'
                                        }
                                    >
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-400 pl-6">
                                    {formatDate(user.createdAt)}
                                </TableCell>
                                <TableCell className="text-gray-500 font-mono text-xs pl-6">
                                    {user.id.slice(0, 8)}...
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {users.length === 0 && (
                <div className="flex items-center justify-center h-32 text-gray-400">
                    <p>No users found</p>
                </div>
            )}
        </div>
    );
};
export default UserTable;
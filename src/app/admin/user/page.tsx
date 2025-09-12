import UserTable from "@/components/admin/UserTable";

export default function AdminUser() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
                <p className="text-gray-400">Manage system users and their permissions</p>
            </div>
            
            <UserTable />
        </div>
    );
}
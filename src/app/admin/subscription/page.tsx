import SubscriptionTable from "@/components/admin/subscription/SubscriptionTable";

export default function AdminSubscription() {
    return (
         <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Subscription Management</h1>
                <p className="text-gray-400">Manage subscription and their details</p>
            </div>
            <SubscriptionTable />
        </div>
    );
}
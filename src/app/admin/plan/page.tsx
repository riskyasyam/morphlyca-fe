import PlanTable from "@/components/admin/PlanTable";

export default function AdminPlan() {
    return (
         <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Plan Management</h1>
                <p className="text-gray-400">Manage subscription plans and their details</p>
            </div>
            
            <PlanTable />
        </div>
    );
}
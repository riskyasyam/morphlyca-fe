import FeatureTable from "@/components/admin/feature/FeatureTable";

export default function AdminFeature() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Feature Management</h1>
                <p className="text-gray-400">Manage application features and settings</p>
            </div>

            <FeatureTable />
        </div>
    );
}
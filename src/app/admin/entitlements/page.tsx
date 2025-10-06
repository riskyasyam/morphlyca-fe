"use client";

import { useState } from "react";
import EntitlementsTable from "@/components/admin/entitlements/EntitlementsTable";

export default function EntitlementsPage() {
  return (
         <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Plan Entitlements</h1>
                <p className="text-gray-400">Manage subscription plan entitlements and limits</p>
            </div>
            
            <EntitlementsTable />
        </div>
    );
}

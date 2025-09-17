"use client";

import { useState } from "react";
import EntitlementsTable from "@/components/admin/entitlements/EntitlementsTable";

export default function EntitlementsPage() {
  return (
    <div className="relative z-[60] pointer-events-auto text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Plan Entitlements</h1>
        <p className="text-slate-400">
          Manage subscription plan entitlements and limits
        </p>
      </div>

      <EntitlementsTable />
    </div>
  );
}

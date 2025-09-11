import React from "react";

export default function AdminHome() {
  return (
    <div className="text-white">
      <h2 className="text-3xl font-bold mb-6">Welcome to Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-white">1,234</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Media Files</h3>
          <p className="text-3xl font-bold text-white">567</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Active Sessions</h3>
          <p className="text-3xl font-bold text-white">89</p>
        </div>
      </div>
    </div>
  );
}

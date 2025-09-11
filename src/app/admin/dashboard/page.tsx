export default function AdminDashboard() {
  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Plan</h3>
          <p className="text-2xl font-bold text-white">Pro</p>
          <a href="#" className="text-sm text-cyan-400 mt-1">Upgrade your plan here</a>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Jobs This Months</h3>
          <p className="text-2xl font-bold text-white">26</p>
          <p className="text-sm text-gray-400 mt-1">+5 today</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Daily Weight Quota</h3>
          <p className="text-2xl font-bold text-white">51</p>
          <p className="text-sm text-gray-400 mt-1">-9 today</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Max Resolution</h3>
          <p className="text-2xl font-bold text-white">1080p</p>
          <p className="text-sm text-gray-400 mt-1">Max Resolution You Can Input</p>
        </div>
      </div>
    </div>
  );
}

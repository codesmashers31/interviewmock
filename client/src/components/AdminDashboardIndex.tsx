// src/pages/admin/Index.tsx
export default function AdminDashboardIndex() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 bg-white shadow rounded-xl text-center">
        <h3 className="text-gray-600">📊 Total Experts</h3>
        <p className="text-3xl font-bold mt-2">152</p>
      </div>
      <div className="p-6 bg-white shadow rounded-xl text-center">
        <h3 className="text-gray-600">👥 Total Users</h3>
        <p className="text-3xl font-bold mt-2">4,389</p>
      </div>
      <div className="p-6 bg-white shadow rounded-xl text-center">
        <h3 className="text-gray-600">📅 Sessions Booked</h3>
        <p className="text-3xl font-bold mt-2">12,782</p>
      </div>
    </div>
  );
}

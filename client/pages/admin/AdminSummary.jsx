import React from "react";

// Mock Data
const mockData = {
  centre_id: 1,
  summary: [
    {
      blood_group_id: 1,
      blood_group_name: "A+",
      components: [
        { component: "WholeBlood", units_available: 27, last_updated: "2025-09-15T07:38:55.609Z" },
        { component: "RBC", units_available: 50, last_updated: "2025-09-15T07:38:55.609Z" },
        { component: "Plasma", units_available: 12, last_updated: "2025-09-15T07:38:55.609Z" },
        { component: "Platelets", units_available: 15, last_updated: "2025-09-15T07:38:55.609Z" }
      ]
    },
    {
      blood_group_id: 7,
      blood_group_name: "AB+",
      components: [
        { component: "WholeBlood", units_available: 43, last_updated: "2025-09-15T07:38:55.609Z" },
        { component: "RBC", units_available: 10, last_updated: "2025-09-15T07:38:55.609Z" },
        { component: "Plasma", units_available: 44, last_updated: "2025-09-15T07:38:55.609Z" },
        { component: "Platelets", units_available: 9, last_updated: "2025-09-15T07:38:55.609Z" }
      ]
    },
    {
      blood_group_id: 3,
      blood_group_name: "B+",
      components: [
        { component: "WholeBlood", units_available: 5, last_updated: "2025-09-15T07:38:55.609Z" },
        { component: "RBC", units_available: 40, last_updated: "2025-09-15T07:38:55.609Z" },
        { component: "Plasma", units_available: 7, last_updated: "2025-09-15T07:38:55.609Z" },
        { component: "Platelets", units_available: 46, last_updated: "2025-09-15T07:38:55.609Z" }
      ]
    },
    {
      blood_group_id: 5,
      blood_group_name: "O+",
      components: [
        { component: "WholeBlood", units_available: 48, last_updated: "2025-09-15T07:38:55.609Z" },
        { component: "RBC", units_available: 31, last_updated: "2025-09-15T07:38:55.609Z" },
        { component: "Plasma", units_available: 15, last_updated: "2025-09-15T07:38:55.609Z" },
        { component: "Platelets", units_available: 34, last_updated: "2025-09-15T07:38:55.609Z" }
      ]
    }
  ]
};

export default function AdminSummary() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-red-600 mb-6"> Blood Bank Summary</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockData.summary.map((group) => (
          <div
            key={group.blood_group_id}
            className="bg-black shadow-md rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-red-600">{group.blood_group_name}</h2>

            <table className="w-full text-sm mt-3">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-1">Component</th>
                  <th className="pb-1">Units</th>
                </tr>
              </thead>
              <tbody>
                {group.components.map((c, idx) => (
                  <tr key={idx} className="border-b last:border-none">
                    <td className="py-1">{c.component}</td>
                    <td className="py-1 font-medium">{c.units_available}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-xs text-gray-500 mt-3">
              Last updated: {new Date(group.components[0].last_updated).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

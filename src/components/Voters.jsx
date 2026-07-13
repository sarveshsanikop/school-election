import { useState } from "react";

export default function Voters() {
  const [tab, setTab] = useState("students");

  return (
    <div>

      <div className="flex gap-3 mb-6">

        <button
          onClick={() => setTab("students")}
          className={`px-5 py-2 rounded-xl ${
            tab === "students"
              ? "bg-blue-600 text-white"
              : "bg-white border"
          }`}
        >
          Students
        </button>

        <button
          onClick={() => setTab("staff")}
          className={`px-5 py-2 rounded-xl ${
            tab === "staff"
              ? "bg-blue-600 text-white"
              : "bg-white border"
          }`}
        >
          Staff
        </button>

      </div>

      {tab === "students" && (

        <div className="bg-white rounded-2xl shadow p-6">

          <h2 className="text-2xl font-bold mb-6">
            Add Student
          </h2>

          <div className="grid grid-cols-2 gap-5">

            <input
              className="border rounded-xl p-3"
              placeholder="Student Name"
            />

            <select className="border rounded-xl p-3">
              <option>Class</option>
              {[...Array(10)].map((_, i) => (
                <option key={i}>{i + 1}</option>
              ))}
            </select>

            <select className="border rounded-xl p-3">
              <option>Division</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
            </select>

            <input
              className="border rounded-xl p-3"
              placeholder="Roll Number"
            />

          </div>

          <button className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl">
            Add Student
          </button>

        </div>

      )}

      {tab === "staff" && (

        <div className="bg-white rounded-2xl shadow p-6">

          <h2 className="text-2xl font-bold mb-6">
            Add Staff
          </h2>

          <div className="grid grid-cols-2 gap-5">

            <input
              className="border rounded-xl p-3"
              placeholder="Teacher Name"
            />

            <input
              className="border rounded-xl p-3"
              placeholder="Staff Number"
            />

          </div>

          <button className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl">
            Add Staff
          </button>

        </div>

      )}

      <div className="bg-white rounded-2xl shadow p-6 mt-8">

        <div className="flex justify-between items-center mb-5">

          <h2 className="text-2xl font-bold">
            Voters List
          </h2>

          <input
            className="border rounded-xl p-3 w-80"
            placeholder="Search..."
          />

        </div>

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Class</th>
              <th className="text-left p-3">Division</th>
              <th className="text-left p-3">Status</th>

            </tr>

          </thead>

          <tbody>

            <tr>

              <td className="p-3">No voters added</td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );
}
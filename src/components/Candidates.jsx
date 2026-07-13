import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";

export default function Candidates() {

  const [candidates] = useState([]);

  return (
    <div>

      <div className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-2xl font-bold mb-6">
          Add Candidate
        </h2>

        <div className="grid grid-cols-2 gap-5">

          <input
            className="border rounded-xl p-3"
            placeholder="Candidate Name"
          />

          <select className="border rounded-xl p-3">

            <option>Select Position</option>

            <option>Head Boy</option>

            <option>Head Girl</option>

            <option>Deputy Head Boy</option>

            <option>Deputy Head Girl</option>

          </select>

          <input
            className="border rounded-xl p-3"
            placeholder="Class"
          />

          <input
            type="file"
            className="border rounded-xl p-3"
          />

        </div>

        <button className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700">
          Add Candidate
        </button>

      </div>

      <div className="mt-10">

        <h2 className="text-2xl font-bold mb-5">
          Candidates
        </h2>

        {candidates.length === 0 ? (

          <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">

            No Candidates Added

          </div>

        ) : (

          <div className="grid grid-cols-4 gap-6">

            {candidates.map((c) => (

              <div
                key={c.id}
                className="bg-white rounded-2xl shadow hover:shadow-xl transition p-6"
              >

                <div className="flex justify-center">

                  {c.photo ? (

                    <img
                      src={c.photo}
                      alt=""
                      className="w-28 h-28 rounded-full object-cover"
                    />

                  ) : (

                    <FaUserCircle className="text-8xl text-gray-400" />

                  )}

                </div>

                <h3 className="text-xl font-bold mt-4 text-center">

                  {c.name}

                </h3>

                <p className="text-center text-gray-500">

                  {c.position}

                </p>

                <p className="text-center mt-1">

                  Class {c.class}

                </p>

                <div className="flex gap-3 mt-5">

                  <button className="flex-1 bg-yellow-500 text-white rounded-lg py-2">

                    Edit

                  </button>

                  <button className="flex-1 bg-red-600 text-white rounded-lg py-2">

                    Delete

                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );

}
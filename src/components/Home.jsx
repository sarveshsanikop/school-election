export default function Home() {
  return (
    <div>

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white rounded-2xl shadow-md p-6">
          <p className="text-gray-500">Total Voters</p>
          <h1 className="text-4xl font-bold mt-3">0</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <p className="text-gray-500">Candidates</p>
          <h1 className="text-4xl font-bold mt-3">0</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <p className="text-gray-500">Votes Cast</p>
          <h1 className="text-4xl font-bold mt-3">0</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <p className="text-gray-500">Turnout</p>
          <h1 className="text-4xl font-bold mt-3">0%</h1>
        </div>

      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-md p-8">

        <h2 className="text-2xl font-bold mb-4">
          Election Status
        </h2>

        <div className="flex items-center gap-4">

          <div className="w-4 h-4 rounded-full bg-green-500"></div>

          <p className="text-lg">
            Election Active
          </p>

        </div>

      </div>

    </div>
  );
}
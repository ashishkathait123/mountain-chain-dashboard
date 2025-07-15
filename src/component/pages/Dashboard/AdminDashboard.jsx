import React, { useState } from "react";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [currency, setCurrency] = useState("INR");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  const stats = [
    { name: "Revenue", value: 0 },
    { name: "Leads", value: 0 },
    { name: "Quotes", value: 0 },
    { name: "Conversion", value: 0 }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    console.log("Uploading file:", selectedFile);
    alert("File uploaded successfully!");
  };

  const handleCancel = () => {
    setSelectedFile(null);
  };

  return (
    <div className="bg-gray-100 font-sans">
      {/* Navigation */}
      <div className="bg-blue-800 text-white px-6 py-4 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-md ${activeTab === "dashboard" ? "bg-blue-700" : "hover:bg-blue-700"}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-2 rounded-md ${activeTab === "upload" ? "bg-blue-700" : "hover:bg-blue-700"}`}
            >
              Upload Data
            </button>
          </div>
        </div>
      </div>

      {activeTab === "dashboard" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md border border-gray-200 m-4"
        >
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Trip Sales Stats</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {stats.map((stat) => (
                <div key={stat.name} className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-semibold mb-3 text-gray-700">Payments</h2>
                  {['Due Incoming', 'Due Outgoing'].map((type) => (
                    <div key={type} className="mb-3">
                      <h3 className="font-medium text-gray-700 flex items-center">
                        <span>{type}</span>
                        <span className="ml-auto text-blue-500">→</span>
                      </h3>
                      <ul className="mt-1 space-y-1">
                        {['Today', 'Yesterday'].map((time) => (
                          <li key={time} className="flex justify-between items-center">
                            <span className="text-gray-600">{time}</span>
                            <span className="text-blue-500 text-sm">=</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-700">Live Trips with Due Payments</h2>
                  <p className="text-gray-600">Trips with Due Payments</p>
                </div>
              </div>

              {/* Middle Column */}
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-semibold mb-3 text-gray-700">Pending Follow-ups</h2>
                  <ul className="space-y-2">
                    {['Today', 'Yesterday', 'Next 7 Days'].map((item) => (
                      <li key={item} className="flex justify-between items-center">
                        <span className="text-gray-600">{item}</span>
                        <span className="text-blue-500 text-sm">=</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-semibold mb-3 text-gray-700">Trip Starting and Endings</h2>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {['Today', 'Yesterday', 'Next 7 Days'].map((period) => (
                      <div key={period}>
                        <div className="text-sm font-medium text-gray-500">{period}</div>
                        <div className="text-xl font-semibold">0</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                  <h2 className="text-lg font-semibold text-gray-700">All caught up!</h2>
                  <button className="text-blue-500 font-medium text-sm hover:text-blue-600">
                    View All →
                  </button>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
                    <span>Trip Ending</span>
                    <span className="ml-auto text-blue-500">→</span>
                  </h2>
                  <ul className="space-y-2">
                    {['Today', 'Tomorrow', 'Prior 7 Days'].map((item) => (
                      <li key={item} className="flex justify-between items-center">
                        <span className="text-gray-600">{item}</span>
                        <span className="text-blue-500 text-sm">=</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    <span className="font-medium text-gray-700">Live</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Ended Yesterday</div>
                    <div>Start in 7 Days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md border border-gray-200 m-4"
        >
          <div className="p-4">
            <h2 className="text-xl font-medium text-gray-800 mb-4 border-b border-blue-200 pb-2">
              Upload Transportation Prices
            </h2>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3 border-b border-gray-200 pb-1">
                Trip Destinations
              </h3>
              <input
                type="text"
                placeholder="Search destinations..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency:</label>
                <div className="flex items-center text-sm">
                  <span className="mr-2 text-blue-800 font-medium">{currency}</span>
                  <span className="text-gray-600">(Prices saved in "{currency}")</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3 border-b border-gray-200 pb-1">
                Upload CSV
              </h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center">
                  <svg
                    className="w-10 h-10 text-gray-400 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mb-1 text-sm text-gray-600">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mb-3">CSV files only (Max. 5MB)</p>
                  <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors">
                    Choose File
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {selectedFile && (
                  <p className="mt-3 text-sm text-gray-700">
                    Selected: <span className="font-medium text-blue-600">{selectedFile.name}</span>
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={!selectedFile}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile}
                  className={`px-3 py-1 text-sm rounded-lg text-white ${
                    selectedFile
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-300 cursor-not-allowed"
                  } transition-colors`}
                >
                  Upload
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3 border-b border-gray-200 pb-1">
                CSV File Format
              </h3>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg mb-3">
                <p className="text-sm text-gray-600">
                  Follow this format exactly. Contact support if unsure about any column.
                </p>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      {[
                        "Duty Code",
                        "A",
                        "B",
                        "Service",
                        "Distance",
                        "Start Time",
                        "Duration",
                        "Day Schedule",
                        "Season 1 (ops)",
                        "Season 1",
                        "Season 2",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-3 py-2 text-left font-medium text-gray-700"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-3 py-2 text-gray-500"></td>
                      <td className="px-3 py-2 text-gray-500"></td>
                      <td className="px-3 py-2 text-gray-500"></td>
                      <td className="px-3 py-2 text-gray-500"></td>
                      <td className="px-3 py-2 text-gray-500"></td>
                      <td className="px-3 py-2 text-gray-500"></td>
                      <td className="px-3 py-2 text-gray-500"></td>
                      <td className="px-3 py-2 text-gray-500">
                        <div>1 Jul 2025 - 30 Sep 2025</div>
                        <div>24 Dec 2025 - 4 Jan 2026</div>
                      </td>
                      <td className="px-3 py-2 text-gray-500">
                        <div>1 Jul 2025 - 30 Sep 2025</div>
                        <div>24 Dec 2025 - 4 Jan 2026</div>
                      </td>
                      <td className="px-3 py-2 text-gray-500">
                        <div>13 Oct 2025 - 24 Oct 2025</div>
                        <div>5 Jan 2026 - 31 Mar 2026</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-gray-500"></td>
                      <td className="px-3 py-2 text-gray-500"></td>
                      <td className="px-3 py-2 text-gray-500"></td>
                      <td className="px-3 py-2 text-gray-500"></td>
                      <td className="px-3 py-2 text-gray-500"></td>
                      <td className="px-3 py-2 text-gray-500"></td>
                      <td className="px-3 py-2 text-gray-500"></td>
                      <td className="px-3 py-2 text-gray-500">Wagon R</td>
                      <td className="px-3 py-2 text-gray-500">Innovar/Xylo</td>
                      <td className="px-3 py-2 text-gray-500">Wagon R [WIRC]</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-3 py-2 font-medium text-blue-700">101</td>
                      <td className="px-3 py-2 text-gray-700">Bagdogra Airport</td>
                      <td className="px-3 py-2 text-gray-700">Gangtok (GTK)</td>
                      <td className="px-3 py-2 text-gray-700">Pickup</td>
                      <td className="px-3 py-2 text-gray-700">90</td>
                      <td className="px-3 py-2 text-gray-700">08:30</td>
                      <td className="px-3 py-2 text-gray-700">210</td>
                      <td className="px-3 py-2 text-gray-700">Upon arrival at NJP</td>
                      <td className="px-3 py-2 text-gray-700">2000</td>
                      <td className="px-3 py-2 text-gray-700">3000</td>
                      <td className="px-3 py-2 text-gray-700">
                        <div>2500</div>
                        <div>3500</div>
                        <div>3000</div>
                        <div>4000</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="border-t border-gray-200 text-xs text-gray-500 p-4">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <span>© 2019-2025 Semiback. All rights reserved.</span>
          <span>•</span>
          <span>v15b@dreamsleague</span>
          <span>•</span>
          <span>Tz: Asia/Calucina (DMT+05:30)</span>
          <span>•</span>
          <span>♂</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
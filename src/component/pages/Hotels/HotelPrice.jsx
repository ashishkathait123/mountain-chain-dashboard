import React, { useState, useEffect } from "react";
import axios from "axios";

const REQUIRED_COLUMNS = [
  "Start Date",
  "End Date",
  "Hotel",
  "Meal Plan",
  "Room Type",
  "Base Price",
  "Persons",
  "A.W.E.B.",
  "C.W.E.B.",
  "C.Wo.E.B"
];

const CsvUploader = () => {
  const [csvData, setCsvData] = useState([]);
  const [file, setFile] = useState(null);
  const [showLiveData, setShowLiveData] = useState(true);

  const fetchUploadedData = async () => {
    try {
      const res = await axios.get("https://mountain-chain.onrender.com/mountainchain/api/upload/data");
      setCsvData(res.data.data);
    } catch (err) {
      console.error("Error fetching uploaded data:", err);
    }
  };

  useEffect(() => {
    fetchUploadedData();
  }, []);

  const formatValue = (value) => {
    if (typeof value === "object" && value !== null) {
      const flatten = (obj, prefix = "") =>
        Object.keys(obj).flatMap((k) =>
          typeof obj[k] === "object"
            ? flatten(obj[k], prefix + k + ".")
            : [[prefix + k, obj[k]]]
        );
      const flat = Object.fromEntries(flatten(value));
      return Object.entries(flat)
        .map(([k, v]) => `${k.replace(/\.$/, "")}: ${v}`)
        .join(", ");
    }
    return value;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a CSV file first.");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("https://mountain-chain.onrender.com/mountainchain/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setCsvData(res.data.data);
      setShowLiveData(false);
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Upload Hotel CSV</h1>

      <form onSubmit={handleUpload} className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
          className="text-sm"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => {
              setShowLiveData(true);
              fetchUploadedData();
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            Load Saved Data
          </button>
        </div>
      </form>

      {csvData.length > 0 ? (
        <div className="overflow-x-auto">
          <p className="text-sm mb-2 text-gray-600">
            Showing: {showLiveData ? "Saved CSV from Database" : "Recently Uploaded CSV"}
          </p>
          <table className="min-w-full table-auto border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                {REQUIRED_COLUMNS.map((key) => (
                  <th key={key} className="border px-2 py-1 text-left whitespace-nowrap">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {REQUIRED_COLUMNS.map((key, colIndex) => (
                    <td key={colIndex} className="border px-2 py-1 text-gray-700 whitespace-nowrap">
                      {formatValue(row[key] || "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No data to display.</p>
      )}
    </div>
  );
};

export default CsvUploader;

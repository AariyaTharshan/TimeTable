import React, { useEffect, useState } from "react";
import Select from "react-select";

const SHEET_ID = import.meta.env.VITE_SHEET_ID;
const API_KEY = import.meta.env.VITE_API_KEY;
const SHEET_NAME = import.meta.env.VITE_SHEET_NAME;

const App = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [filters, setFilters] = useState({
    department: [],
    year: [],
    semester: [],
    section: [],
    day: [],
    faculty: [],
    facultyCode: [],
    subject: [],
    subjectCode: [],
    venue: [],
    session: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
    try {
      const response = await fetch(url);
      const result = await response.json();
      const rows = result.values;

      if (!rows || rows.length < 5) {
        console.error("No valid data found in the sheet.");
        return;
      }

      setHeaders(rows[4]); // Row 5 contains headers
      const formattedData = rows.slice(5).map(row => row.map(cell => (cell ? cell.trim() : "")));
      setData(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleFilterChange = (selectedOptions, field) => {
    setFilters({ ...filters, [field]: selectedOptions.map(option => option.value) });
  };

  const createOptions = (columnIndex) => {
    return Array.from(new Set(data.map(row => row[columnIndex])))
      .filter(val => val)
      .map(val => ({ value: val, label: val }));
  };

  const columnMapping = {
    department: 0,
    year: 1,
    semester: 2,
    section: 3,
    day: 4,
    faculty: 8,
    facultyCode: 9,
    subject: 7,
    subjectCode: 5,
    venue: 11,
    session: 6,
  };

  // Improved Filtering Logic
  const filteredData = data.filter((row) => {
    return Object.keys(filters).every((key) => {
      const columnIndex = columnMapping[key];
      // If no filters are selected for this key, return true
      if (filters[key].length === 0) return true;
      // Check if the row value for this key is included in the selected filters
      return filters[key].includes(row[columnIndex]);
    });
  });

  // Check which filters are active
  const isFacultyFilterActive = filters.faculty.length > 0 || filters.facultyCode.length > 0;
  const isVenueFilterActive = filters.venue.length > 0;
  const isSubjectFilterActive = filters.subject.length > 0 || filters.subjectCode.length > 0;
  const isDayFilterActive = filters.day.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Timetable Manager</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Object.keys(columnMapping).map((key) => (
            <Select
              key={key}
              isMulti
              options={createOptions(columnMapping[key])}
              placeholder={`Select ${key.charAt(0).toUpperCase() + key.slice(1)}`}
              onChange={(selected) => handleFilterChange(selected, key)}
              className="w-full text-gray-700"
            />
          ))}
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-lg shadow-md">
          {isFacultyFilterActive ? (
            // Faculty-specific view
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-gray-700 font-semibold">Faculty</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">Faculty Code</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">Department</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">Year</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">Semester</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">Section</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">Subject</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">Subject Code</th>
                  {isDayFilterActive && <th className="px-4 py-3 text-gray-700 font-semibold">Day</th>}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={index} className="border-t hover:bg-gray-100">
                    <td className="px-4 py-2 text-gray-800">{row[columnMapping.faculty]}</td>
                    <td className="px-4 py-2 text-gray-800">{row[columnMapping.facultyCode]}</td>
                    <td className="px-4 py-2 text-gray-800">{row[columnMapping.department]}</td>
                    <td className="px-4 py-2 text-gray-800">{row[columnMapping.year]}</td>
                    <td className="px-4 py-2 text-gray-800">{row[columnMapping.semester]}</td>
                    <td className="px-4 py-2 text-gray-800">{row[columnMapping.section]}</td>
                    <td className="px-4 py-2 text-gray-800">{row[columnMapping.subject]}</td>
                    <td className="px-4 py-2 text-gray-800">{row[columnMapping.subjectCode]}</td>
                    {isDayFilterActive && <td className="px-4 py-2 text-gray-800">{row[columnMapping.day]}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : isVenueFilterActive ? (
            // Venue-based view
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-gray-700 font-semibold">Venue</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">Faculty</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">Subject</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">Subject Code</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">Day</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={index} className="border-t hover:bg-gray-100">
                    <td className="px-4 py-2 text-gray-800">{row[columnMapping.venue]}</td>
                    <td className="px-4 py-2 text-gray-800">{row[columnMapping.faculty]}</td>
                    <td className="px-4 py-2 text-gray-800">{row[columnMapping.subject]}</td>
                    <td className="px-4 py-2 text-gray-800">{row[columnMapping.subjectCode]}</td>
                    <td className="px-4 py-2 text-gray-800">{row[columnMapping.day]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            // Default table (Always visible)
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  {headers.map((header, index) => (
                    <th key={index} className="px-4 py-3 text-gray-700 font-semibold whitespace-nowrap">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length} className="text-center py-4 text-gray-500">No results found.</td>
                  </tr>
                ) : (
                  filteredData.map((row, index) => (
                    <tr key={index} className="border-t hover:bg-gray-100">
                      {row.map((cell, i) => (
                        <td key={i} className="px-4 py-2 text-gray-800">{cell}</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

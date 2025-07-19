import React, { useEffect, useState } from "react";
import axios from "axios";

const CityDropdowns = ({ value, onSelect }) => {
  const [cities, setCities] = useState([]);
  const [query, setQuery] = useState(value || "");
  const [filteredCities, setFilteredCities] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await axios.get(
          "https://mountain-chain.onrender.com/mountainchain/api/city/list"
        );
        if (res.data.success) {
          setCities(res.data.cities);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const filtered = cities.filter((city) =>
      city.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCities(filtered);
  }, [query, cities]);

  const handleSelect = (cityName) => {
    setQuery(cityName);
    onSelect(cityName); // send selected city to parent
    setShowDropdown(false);
  };

  const handleAddNewCity = async (name) => {
    try {
      const res = await axios.post(
        "https://mountain-chain.onrender.com/mountainchain/api/city/add",
        { name }
      );
      if (res.data.success) {
        const newCity = { name };
        setCities([...cities, newCity]);
        handleSelect(name);
      }
    } catch (error) {
      console.error("Error adding city:", error);
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder="Type to search or add"
        className="w-full border border-blue-400 rounded-md p-2 focus:outline-none"
        required
      />

      {showDropdown && (
        <ul className="absolute z-10 w-full bg-white border mt-1 rounded-md shadow max-h-40 overflow-y-auto">
          {filteredCities.length > 0 ? (
            filteredCities.map((city, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(city.name)}
              >
                {city.name}
              </li>
            ))
          ) : (
            query && (
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleAddNewCity(query)}
              >
                ➕ Add "{query}"
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
};

export default CityDropdowns;

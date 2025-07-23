import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HotelQuotation = () => {
  const [hotelEntries, setHotelEntries] = useState([
    {
      id: 1,
      stayNights: [],
      selectedHotel: null,
      mealPlan: '',
      roomType: '',
      paxPerRoom: 2,
      numRooms: 0,
      aweb: 0,
      cweb: 0,
      cnb: 0,
    },
  ]);
  const [hotels, setHotels] = useState([]);
  const [tripDates, setTripDates] = useState([]);

  useEffect(() => {
  // Fetch hotel data from the API
  axios
    .get('https://mountain-chain.onrender.com/mountainchain/api/hotel/gethotels')
    .then((response) => {
      setHotels(response.data.hotels || []);
    })
    .catch((error) => {
      console.error('Error fetching hotel data:', error);
    });

  // Mock trip dates (fetching from params as mentioned in the prompt)
  const startDate = new Date('2025-10-01');
  const numberOfNights = 5;
  const dates = Array.from({ length: numberOfNights }).map((_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });
  setTripDates(dates);
}, []);


  const handleAddHotel = () => {
    setHotelEntries([
      ...hotelEntries,
      {
        id: hotelEntries.length + 1,
        stayNights: [],
        selectedHotel: null,
        mealPlan: '',
        roomType: '',
        paxPerRoom: 2,
        numRooms: 0,
        aweb: 0,
        cweb: 0,
        cnb: 0,
      },
    ]);
  };

  const handleInputChange = (id, field, value) => {
    const updatedEntries = hotelEntries.map((entry) => {
      if (entry.id === id) {
        const newEntry = { ...entry, [field]: value };
        // Reset dependent fields if hotel changes
        if (field === 'selectedHotel') {
          newEntry.mealPlan = '';
          newEntry.roomType = '';
        }
        return newEntry;
      }
      return entry;
    });
    setHotelEntries(updatedEntries);
  };

  const handleStayNightsChange = (id, night) => {
    const updatedEntries = hotelEntries.map((entry) => {
      if (entry.id === id) {
        const newStayNights = entry.stayNights.includes(night)
          ? entry.stayNights.filter((n) => n !== night)
          : [...entry.stayNights, night];
        return { ...entry, stayNights: newStayNights.sort() };
      }
      return entry;
    });
    setHotelEntries(updatedEntries);
  };

  const handleDuplicate = (id) => {
    const entryToDuplicate = hotelEntries.find((entry) => entry.id === id);
    if (entryToDuplicate) {
      setHotelEntries([
        ...hotelEntries,
        { ...entryToDuplicate, id: hotelEntries.length + 1 },
      ]);
    }
  };

  const handleRemove = (id) => {
    setHotelEntries(hotelEntries.filter((entry) => entry.id !== id));
  };

  return (
    <div className="bg-gray-100 p-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-2 text-blue-600">Hotels</h2>
        <p className="text-gray-600 mb-4">
          Please add hotels details (if included in package) with services provided for each hotels and the selling cost price.
        </p>
        <p className="text-gray-500 mb-6 text-sm">
          💡 Tip: To speed up the process of adding multiple hotels, use{' '}
          <span className="font-semibold">Next Night</span> or{' '}
          <span className="font-semibold">Duplicate</span> actions.
        </p>

        {hotelEntries.map((entry, index) => (
          <div key={entry.id} className="mb-8 border-b pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stay Nights</label>
                    <div className="border rounded-md p-2 bg-white">
                      {tripDates.map((date, i) => (
                        <div key={i} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`night-${entry.id}-${i}`}
                            checked={entry.stayNights.includes(i)}
                            onChange={() => handleStayNightsChange(entry.id, i)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`night-${entry.id}-${i}`} className="ml-2 text-sm text-gray-700">
                            {`${i + 1}${['st', 'nd', 'rd'][i] || 'th'} N (${date.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })})`}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hotel</label>
                    <select
                      value={entry.selectedHotel ? entry.selectedHotel.name : ''}
                      onChange={(e) => {
                        const selected = hotels.find(h => h.name === e.target.value);
                        handleInputChange(entry.id, 'selectedHotel', selected);
                      }}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="">Type to search...</option>
                      {hotels.map(hotel => (
                        <option key={hotel._id} value={hotel.name}>{hotel.name}</option>
                      ))}
                    </select>
                    {!entry.selectedHotel && <p className="text-red-500 text-xs mt-1">Hotel field is required</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meal Plan</label>
                    <select
                      value={entry.mealPlan}
                      onChange={(e) => handleInputChange(entry.id, 'mealPlan', e.target.value)}
                      className="w-full border rounded-md p-2"
                      disabled={!entry.selectedHotel}
                    >
                      <option value="">Type to search...</option>
                      {entry.selectedHotel?.meals.map(meal => (
                        <option key={meal} value={meal}>{meal}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                    <select
                      value={entry.roomType}
                      onChange={(e) => handleInputChange(entry.id, 'roomType', e.target.value)}
                      className="w-full border rounded-md p-2"
                      disabled={!entry.selectedHotel}
                    >
                       <option value="">Type to search...</option>
                      {entry.selectedHotel?.rooms.flatMap(room => room.roomTypes).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pax/room</label>
                    <input
                      type="number"
                      value={entry.paxPerRoom}
                      onChange={(e) => handleInputChange(entry.id, 'paxPerRoom', e.target.value)}
                      className="w-full border rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. of rooms</label>
                    <input
                      type="number"
                      value={entry.numRooms}
                      onChange={(e) => handleInputChange(entry.id, 'numRooms', e.target.value)}
                      className="w-full border rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">AWEB</label>
                    <input
                      type="number"
                      value={entry.aweb}
                      onChange={(e) => handleInputChange(entry.id, 'aweb', e.target.value)}
                      className="w-full border rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CWEB</label>
                    <input
                      type="number"
                      value={entry.cweb}
                      onChange={(e) => handleInputChange(entry.id, 'cweb', e.target.value)}
                      className="w-full border rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CNB</label>
                    <input
                      type="number"
                      value={entry.cnb}
                      onChange={(e) => handleInputChange(entry.id, 'cnb', e.target.value)}
                      className="w-full border rounded-md p-2"
                    />
                  </div>
                </div>
              </div>
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold mb-2">Prices</h3>
                {entry.stayNights.length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-center text-sm font-bold text-gray-600 mb-2">
                      <span>Date</span>
                      <span>Rate N/A</span>
                      <span>Given N/A</span>
                    </div>
                    {entry.stayNights.map(nightIndex => (
                       <div key={nightIndex} className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-semibold">{tripDates[nightIndex].toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</p>
                          <p className="text-xs text-gray-500">{tripDates[nightIndex].toLocaleDateString('en-US', { weekday: 'long' })}</p>
                        </div>
                        <span className="text-orange-500 font-semibold">INR N/A</span>
                        <div className="relative">
                           <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">INR</span>
                           <input type="number" defaultValue="0" className="bg-yellow-400 text-black font-bold rounded-md p-2 w-24 text-right" />
                        </div>
                       </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-md">
                    Please fill all required details
                  </div>
                )}
                 <div className="flex items-center space-x-4 mt-4">
                  {index === hotelEntries.length -1 && (
                     <button
                      onClick={() => handleAddHotel(entry.id)}
                      className="text-blue-600 font-semibold"
                     >
                       + Next Night
                     </button>
                  )}
                  <button onClick={() => handleDuplicate(entry.id)} className="text-blue-600 font-semibold">Duplicate</button>
                  {hotelEntries.length > 1 && (
                    <button onClick={() => handleRemove(entry.id)} className="text-red-500 font-semibold">Remove</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={handleAddHotel}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700"
        >
          + Add Hotel
        </button>
      </div>
    </div>
  );
};

export default HotelQuotation;
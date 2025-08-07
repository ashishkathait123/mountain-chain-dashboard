import React, { useState } from 'react';
import { FiMoreVertical, FiEdit, FiMail } from 'react-icons/fi';

// --- Helper Functions ---
const formatCurrency = (amount) => new Intl.NumberFormat('en-IN').format(amount);
const timeAgo = (date) => {
    // This is a simplified version for demonstration
    if (!date) return 'just now';
    return '4 hours ago'; 
};
const formatDate = (date) => {
    if(!date) return '';
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}


const ServicesBookingsTab = ({ query, quote }) => {
    const [activeService, setActiveService] = useState('Hotels');

    if (!quote) {
        return <div className="p-10 text-center text-slate-500">This trip has not been converted yet.</div>;
    }

    // Data for the side navigation
    const services = [
        { name: 'Hotels', data: quote.hotelDetails?.entries || [] },
        { name: 'Operational', data: [] }, // Placeholder for operational services
        { name: 'Flights', data: quote.flights || [] },
    ];

    const renderContent = () => {
        switch (activeService) {
            case 'Hotels':
                return <HotelBookings quote={quote} />;
            case 'Operational':
                return <OperationalServices />;
            case 'Flights':
                return <FlightBookings quote={quote} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex min-h-[600px]">
            {/* Left Side Navigation */}
            <aside className="w-48 border-r border-slate-200 p-2">
                <nav className="flex flex-col space-y-1">
                    {services.map(service => (
                        <button
                            key={service.name}
                            onClick={() => setActiveService(service.name)}
                            className={`px-4 py-2 text-left text-sm font-semibold rounded-md transition-colors ${
                                activeService === service.name
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {service.name}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Right Side Content */}
            <main className="flex-1 p-6">
                {renderContent()}
            </main>
        </div>
    );
};


// --- Sub-components for each service type ---

const HotelBookings = ({ quote }) => {
    const hotels = quote.hotelDetails?.entries || [];
    const specialInclusions = quote.hotelDetails?.specialInclusions || [];
console.log("hotels", hotels);
    if (hotels.length === 0) {
        return <div className="text-slate-500">No hotel services provided in the quote.</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Hotel Bookings</h2>
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                    <FiMoreVertical />
                </button>
            </div>
            
            {/* Table */}
            <div className="border rounded-lg">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 bg-slate-50 p-3 font-semibold text-slate-600 text-sm">
                    <div className="col-span-3">Hotel</div>
                    <div className="col-span-3">Stay and Services</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Tag/Comments</div>
                    <div className="col-span-2 text-right">Price</div>
                </div>

                {/* Body */}
                <div>
                    {hotels.map((hotel, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 p-3 border-t text-sm">
                            <div className="col-span-3">
                                <a href="#" className="font-semibold text-blue-600 hover:underline">{hotel.hotelId?.name}</a>
                                <p className="text-slate-500 text-xs">{hotel.hotelId?.city} • {hotel.roomConfig}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <button className="p-1 text-slate-500 hover:text-blue-600"><FiEdit size={14}/></button>
                                    <button className="p-1 text-slate-500 hover:text-blue-600"><FiMail size={14}/></button>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <p className="font-semibold">{formatDate(quote.startDate)} - 1st N</p>
                                <p className="text-slate-500">{hotel.mealPlan} • {hotel.numRooms} {hotel.roomConfig}</p>
                                
                                {specialInclusions.length > 0 && index === 1 && ( // Example logic to attach inclusion to a hotel
                                    <div className="mt-2">
                                        <p className="font-bold text-xs">Extras</p>
                                        {specialInclusions.map((inc, i) => (
                                            <p key={i} className="text-slate-500">{inc.service}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="col-span-2">
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">Initialized</span>
                                    <button className="p-1 text-slate-400 hover:text-blue-600"><FiEdit size={14}/></button>
                                </div>
                                <p className="text-slate-500 text-xs">by Ravikant • {timeAgo()}</p>
                            </div>
                            <div className="col-span-2">
                                {/* Empty for now */}
                            </div>
                            <div className="col-span-2 text-right">
                                <p className="font-bold">
                                    Booking: <span className="text-xs font-normal text-slate-500 mr-1">INR</span>{formatCurrency(hotel.sellingPrice)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const OperationalServices = () => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Operational Services</h2>
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                    <FiMoreVertical />
                </button>
            </div>
            <p className="text-slate-500">No Operational Services for this Trip.</p>
        </div>
    );
};

const FlightBookings = ({ quote }) => {
    const flights = quote.flights || [];

    return (
        <div>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Flight Bookings</h2>
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                    <FiMoreVertical />
                </button>
            </div>
            {flights.length > 0 ? (
                // Add flight booking table here later
                <div className="text-slate-500">Flight booking UI to be built.</div>
            ) : (
                <p className="text-slate-500">Flights not provided.</p>
            )}
        </div>
    );
};


export default ServicesBookingsTab;
// src/components/NewQuoteTab.js

import React from 'react';
import { FiSearch } from 'react-icons/fi';

// A sub-component for the suggestion card
const QuoteSuggestionCard = ({ quote, onUse }) => (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col">
        <div className="p-4 flex justify-between items-start">
            <div>
                <h4 className="font-semibold text-slate-800">#{quote.queryId?.queryId || '...'} • {quote.queryId?.guestName}</h4>
            </div>
            <div className="text-right">
                <p className="font-semibold text-slate-700">{quote.queryId?.destination?.name}</p>
                <p className="text-xs text-slate-500">{quote.duration.split(', ')[0]}</p>
            </div>
        </div>
        <div className="px-4 pb-4 border-b">
            {/* Tabs inside the card */}
            <div className="flex">
                <button className="px-3 py-1.5 text-sm font-semibold border-b-2 border-transparent text-slate-500">Itinerary</button>
                <button className="px-3 py-1.5 text-sm font-semibold border-b-2 border-transparent text-slate-500">Hotels</button>
                <button className="px-3 py-1.5 text-sm font-semibold border-b-2 border-blue-600 text-blue-600">Details</button>
            </div>
        </div>
        <div className="p-4 flex-grow">
            <div className="text-sm flex justify-between"><span className="text-slate-500">Duration:</span> <span className="font-semibold">{quote.duration.split(', ')[1]}</span></div>
            <div className="text-sm flex justify-between mt-1"><span className="text-slate-500">Travelers:</span> <span className="font-semibold">{quote.pax} Adults, {quote.queryId?.childrenAges?.length || 0} Child(ren)</span></div>
        </div>
        <div className="p-4 bg-slate-50 rounded-b-lg mt-auto">
            <button onClick={() => onUse(quote._id)} className="w-full bg-blue-100 text-blue-800 font-bold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                Use this Quote
            </button>
        </div>
    </div>
);


const NewQuoteTab = ({ quotations, onNavigateToCreate }) => {
    const handleUseQuote = (quoteId) => {
        // Here you would implement the logic to copy this quote's data
        // For now, it can just navigate to the create page
        onNavigateToCreate();
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h2 className="text-lg font-semibold text-slate-700 mb-2">To Create Quote you can start with below suggestions.</h2>
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search by trip id or guest name" className="w-full pl-10 pr-4 py-2 border rounded-md text-sm" />
                </div>
            </div>
            {quotations && quotations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quotations.map(q => (
                        <QuoteSuggestionCard key={q._id} quote={q} onUse={handleUseQuote} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 text-slate-500">
                    <p>No existing quotes to use as suggestions.</p>
                </div>
            )}
            <div className="text-center mt-8">
                <button onClick={onNavigateToCreate} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                    Create Custom Quotation
                </button>
            </div>
        </div>
    );
};

export default NewQuoteTab;
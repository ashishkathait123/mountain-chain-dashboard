// src/components/AllQuotesTab.js

import React from 'react';
import { useState } from 'react';
import QuotationDetails from './QuoteBasicDetailsPage';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const formatCurrency = (amount) => `INR ${amount?.toLocaleString('en-IN') || 0}`;
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const AllQuotesTab = ({ quotations }) => {
    const [openQuoteId, setOpenQuoteId] = useState(quotations[0]?._id || null);

    const toggleQuote = (id) => {
        setOpenQuoteId(openQuoteId === id ? null : id);
    };

    if (!quotations || quotations.length === 0) {
        return (
            <div className="p-10 text-center text-slate-500">
                <h3 className="font-semibold text-lg">No quotes have been created for this trip yet.</h3>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {quotations.map((quote, index) => (
                <div key={quote._id} className="bg-white rounded-lg shadow-sm border border-slate-200">
                    <button
                        onClick={() => toggleQuote(quote._id)}
                        className="w-full p-4 flex justify-between items-center text-left hover:bg-slate-50"
                    >
                        <div className="flex items-center gap-6">
                            <div className="text-left">
                                <p className="font-bold text-xl text-slate-800">{formatCurrency(quote.summary.totalSellingPrice)}</p>
                                <p className="text-xs text-slate-500">Created {new Date(quote.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="border-l pl-6">
                                <p className="font-semibold text-slate-700">{formatDate(quote.startDate)}</p>
                                <p className="text-xs text-slate-500">{quote.duration} • {quote.pax} Adults, {quote.queryId?.childrenAges?.length || 0} Child(ren)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {index === 0 && <span className="text-xs font-semibold text-green-800 bg-green-100 px-3 py-1 rounded-full">Latest Quote</span>}
                            {openQuoteId === quote._id ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                        </div>
                    </button>
                    {openQuoteId === quote._id && (
                        <div className="p-4 border-t border-slate-200">
                            {/* Reuse the detailed component */}
                            <QuotationDetails quote={quote} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AllQuotesTab;
import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN').format(amount);
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// A reusable component for the info tables
const InfoTable = ({ title, data }) => (
    <div className="mb-4">
        <h4 className="font-bold text-sm mb-1">{title}</h4>
        <table className="w-full border-collapse border border-slate-400 text-xs">
            <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className={`border border-slate-300 p-1.5 ${cell.isHeader ? 'font-bold bg-slate-100' : ''}`} colSpan={cell.colSpan || 1}>
                                {cell.label}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ProfitReportView = ({ query, quote }) => {
    const packageAmount = quote.summary?.totalSellingPrice || 0;
    const bookingsCost = quote.summary?.totalNetCost || 0;
    const tax = packageAmount * (quote.summary.gst?.value / 100 || 0.05);
    const profitSoFar = packageAmount - tax; // As per the image calculation
    const profitPercent = packageAmount ? ((packageAmount - bookingsCost - tax) / packageAmount) * 100 : 0;

    // --- Prepare data for InfoTables ---
    const tripDetailsData = [
        [{label: 'Trip ID', isHeader: true}, {label: 'Destinations', isHeader: true}, {label: 'Start Date', isHeader: true}, {label: 'End Date', isHeader: true}, {label: 'Duration', isHeader: true}, {label: 'Adults', isHeader: true}, {label: 'Children', isHeader: true}],
        [{label: query.queryId}, {label: query.destination?.name}, {label: formatDate(query.startDate)}, {label: formatDate(query.endDate)}, {label: query.duration}, {label: query.noOfAdults}, {label: query.childrenAges?.length || 0}]
    ];
    
    const sourceGuestData = [
        [{label: 'Source Name', isHeader: true}, {label: 'Source Contact', isHeader: true}, {label: 'Ref ID', isHeader: true}, {label: 'Guest Name', isHeader: true}, {label: 'Guest Contact', isHeader: true}],
        [{label: query.querySource?.companyName}, {label: query.querySource?.contactName}, {label: query.referenceId}, {label: query.guestName}, {label: query.phoneNumbers?.[0]}]
    ];

     const quoteDetailsData = [
        [{label: 'Rounding: 10', isHeader: true, colSpan: 6}],
        [{label: 'Total', isHeader: true}, {label: 'Cost (INR)', isHeader: true}, {label: 'Markup (0)', isHeader: true}, {label: 'GST (5%)', isHeader: true}, {label: 'Total (INR)', isHeader: true}, {label: 'Total (INR)', isHeader: true}],
        [{label: 'Total'}, {label: formatCurrency(quote.summary.totalNetCost)}, {label: '0'}, {label: formatCurrency(tax)}, {label: formatCurrency(quote.summary.totalSellingPrice - tax)}, {label: formatCurrency(quote.summary.totalSellingPrice)}]
    ];

    return (
        <div className="p-6">
            {/* Top Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm border grid grid-cols-5 gap-4 text-center">
                <div>
                    <p className="text-sm text-slate-500">Package Amount</p>
                    <p className="text-2xl font-bold">{formatCurrency(packageAmount)}</p>
                </div>
                 <div>
                    <p className="text-sm text-slate-500">Bookings</p>
                    <p className="text-2xl font-bold text-slate-400">N/A</p>
                    <p className="text-xs text-orange-500">Some bookings are still pending.</p>
                </div>
                 <div>
                    <p className="text-sm text-slate-500">Tax (5%)</p>
                    <p className="text-2xl font-bold">{formatCurrency(tax)}</p>
                </div>
                 <div>
                    <p className="text-sm text-slate-500">Profit So-Far</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(profitSoFar)}</p>
                </div>
                 <div>
                    <p className="text-sm text-slate-500">Profit %</p>
                    <p className="text-2xl font-bold text-green-600">{profitPercent.toFixed(2)}%</p>
                </div>
            </div>

            {/* Alert */}
            <div className="mt-6 p-3 bg-yellow-100 border border-yellow-200 text-yellow-800 rounded-md flex items-center gap-2">
                <FiAlertTriangle/>
                There are pending bookings (2 not booked) for this Trip.
            </div>

            {/* Info Tables */}
            <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
                <InfoTable title="Trip Details" data={tripDetailsData} />
                <InfoTable title="Source and Guest Details" data={sourceGuestData} />
                <InfoTable title="Latest Quote Details" data={quoteDetailsData} />
                {/* Add other tables here following the same pattern */}
            </div>
        </div>
    );
};

export default ProfitReportView;
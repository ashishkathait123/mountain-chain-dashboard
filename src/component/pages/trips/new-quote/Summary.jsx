import React, { useState, useMemo } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
};

const Summary = ({ queryData, hotelData, transportData, flightData, onSave, isSaving }) => {
    // State for this component remains the same
    const [markup, setMarkup] = useState({ type: '%', value: 0 });
    const [gst, setGst] = useState({ included: true, value: 5 });
    const [rounding, setRounding] = useState(10);
    const [internalRemarks, setInternalRemarks] = useState('');
    const [customerRemarks, setCustomerRemarks] = useState('');

const totals = useMemo(() => {
  const totalSelling =
    (hotelData?.selling || 0) +
    (transportData?.selling || 0) +
    (flightData?.selling || 0);

  const markupValue = Number(markup.value) || 0;

  const priceAfterMarkup =
    markup.type === '%'
      ? totalSelling * (1 + markupValue / 100)
      : totalSelling + markupValue;

  const gstValue = Number(gst.value) || 0;

  // ✅ CORRECTED GST LOGIC
  const gstAmount = gst.included
    ? priceAfterMarkup * (gstValue / 100)
    : 0;

  const priceWithGst = priceAfterMarkup + gstAmount;

  const finalPrice = Math.round(priceWithGst / rounding) * rounding;

  return {
    totalSelling,
    priceAfterMarkup,
    gstAmount,
    priceWithGst,
    finalPrice,
  };
}, [hotelData, transportData, flightData, markup, gst, rounding]);




     const handleSaveClick = () => {
    const summaryDetails = {
        markup,
        gst,
        rounding,
        totalSellingPrice: totals.finalPrice,

       
        subtotalWithMarkup: totals.priceAfterMarkup,

        totalNetCost: (hotelData?.net || 0) + (transportData?.net || 0) + (flightData?.net || 0),
        
        internalRemarks,
        customerRemarks
    };
    onSave(summaryDetails);
};

    const misconfigurationWarnings = useMemo(() => {
        const warnings = [];
        const totalNet = (hotelData?.net || 0) + (transportData?.net || 0) + (flightData?.net || 0);
        
        if (totals.totalSelling < totalNet) { 
            warnings.push("Total selling price is less than the total net cost."); 
        }

        // CRITICAL FIX: Check that hotelData and hotelData.entries exist and are arrays before looping
        if (hotelData?.entries && Array.isArray(hotelData.entries)) {
            hotelData.entries.forEach(entry => { 
                if (entry.sellingPrice === 0 && entry.stayNights?.length > 0) { 
                    warnings.push(`Missing given price for ${entry.selectedHotel?.name || 'a selected hotel'}.`); 
                }
            });
        }
        
        return warnings;
    }, [totals, hotelData, transportData, flightData]);

    return (
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-sm border border-slate-200 font-sans space-y-8">
            <h1 className="text-2xl font-bold text-slate-800">Summary</h1>
            
            {/* --- Summary Tables (No changes here) --- */}
                     <div className="border rounded-lg">
                <div className="bg-blue-50 px-4 py-2 border-b"><h2 className="font-bold text-slate-700">Accommodation</h2></div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-xs text-slate-500">
                            <th className="p-2">Night</th>
                            <th className="p-2">Hotel</th>
                            <th className="p-2">Meal</th>
                            <th className="p-2">Rooms</th>
                            <th className="p-2 text-right">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 
                            CRITICAL FIX: 
                            Ensure hotelData and hotelData.entries are valid arrays before mapping.
                            This prevents crashes during the initial render cycle.
                        */}
                        {hotelData?.entries && Array.isArray(hotelData.entries) ? (
                            hotelData.entries.map(h => (
                               <tr key={h.id} className="border-t">
                                   <td className="p-2">{h.stayNights?.map(n => `N${n+1}`).join(', ')}</td>
                                   <td className="p-2">{h.selectedHotel?.name || h.hotelName || 'N/A'}</td>
                                   <td className="p-2">{h.mealPlan}</td>
                                   <td className="p-2">{h.numRooms} Room(s)</td>
                                   <td className="p-2 text-right">{formatCurrency(h.sellingPrice * (h.stayNights?.length || 1))}</td>
                               </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-4 text-center text-slate-400 text-xs">No hotel entries added.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                 
                 {/* 
                    CRITICAL FIX:
                    Ensure hotelData and its nested arrays (inclusions, entries) are valid before rendering.
                 */}
                 {hotelData?.inclusions && Array.isArray(hotelData.inclusions) && hotelData.inclusions.length > 0 && (
                    <div className="border-t">
                        <div className="bg-slate-50 px-4 py-1"><h3 className="font-semibold text-xs text-slate-600">Hotel Special Inclusions</h3></div>
                        <table className="w-full text-sm">
                            <tbody>
                               {hotelData.inclusions.map(inc => {
                                   // Safely find the hotel name
                                   const hotelName = hotelData.entries?.find(h => h.id === inc.hotelEntryId)?.selectedHotel?.name || 'N/A';
                                   return (
                                       <tr key={inc.id} className="border-t">
                                           <td className="p-2">{hotelName}</td>
                                           <td className="p-2">{inc.service}</td>
                                           <td className="p-2 text-right">{formatCurrency(inc.price)}</td>
                                       </tr>
                                   );
                               })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="bg-slate-100 p-2 font-bold text-right text-sm">
                    Total: {formatCurrency(hotelData?.selling || 0)}
                </div>
            </div>

            {misconfigurationWarnings.length > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                    <div className="flex items-center"><FaExclamationTriangle className="text-amber-500 mr-3"/><h3 className="font-bold text-slate-800">Misconfiguration in Services.</h3></div>
                    <ul className="list-disc pl-8 mt-2 text-sm text-slate-600">{misconfigurationWarnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul>
                    <p className="text-xs text-slate-500 mt-3">You can skip these warnings if everything is as expected.</p>
                </div>
            )}
            
            {/* Calculation & Remarks sections are unchanged */}
            <div className="border rounded-lg p-4 space-y-4">
                 <table className="w-full text-sm">
                   <tbody>
  <tr className="font-bold">
    <td className="py-2">Total Selling</td>
    <td className="py-2 text-right" colSpan="3">{formatCurrency(totals.totalSelling)}</td>
  </tr>

  <tr>
    <td className="py-2">Markup</td>
    <td className="py-2">
      <input
        type="number"
        value={markup.value}
        onChange={e => setMarkup(m => ({ ...m, value: e.target.value }))}
        className="w-20 text-sm border-slate-300 rounded-md p-1"
      />
    </td>
    <td className="py-2">
      <select
        value={markup.type}
        onChange={e => setMarkup(m => ({ ...m, type: e.target.value }))}
        className="text-sm border-slate-300 rounded-md p-1"
      >
        <option value="%">%</option>
        <option value="INR">INR</option>
      </select>
    </td>
    <td className="py-2 text-right">
      {formatCurrency(totals.priceAfterMarkup - totals.totalSelling)}
    </td>
  </tr>

  <tr>
    <td className="py-2">
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={gst.included}
          onChange={e => setGst(g => ({ ...g, included: e.target.checked }))}
          className="mr-2"
        />
        GST
      </label>
    </td>
    <td className="py-2">
      <input
        type="number"
        value={gst.value}
        onChange={e => setGst(g => ({ ...g, value: e.target.value }))}
        className="w-20 text-sm border-slate-300 rounded-md p-1"
      /> %
    </td>
    <td></td>
    <td className="py-2 text-right">{formatCurrency(totals.gstAmount)}</td>
  </tr>

  <tr className="font-bold border-t">
    <td className="py-2">Subtotal (with Markup)</td>
    <td></td>
    <td></td>
    <td className="py-2 text-right">{formatCurrency(totals.priceAfterMarkup)}</td>
  </tr>

  {gst.included && (
    <tr className="font-bold">
      <td className="py-2">+ GST</td>
      <td></td>
      <td></td>
      <td className="py-2 text-right">{formatCurrency(totals.gstAmount)}</td>
    </tr>
  )}

 <tr className="font-bold text-blue-900 border-t">
  <td className="py-2">Grand Total</td>
  <td></td>
  <td></td>
  <td className="py-2 text-right">
    {formatCurrency(totals.priceWithGst)}
  </td>
</tr>


  <tr>
    <td className="py-2">Round Off</td>
    <td></td>
    <td></td>
    <td className="py-2 text-right">
      <select
        value={rounding}
        onChange={e => setRounding(Number(e.target.value))}
        className="text-sm border-slate-300 rounded-md p-1"
      >
        <option value="1">None</option>
        <option value="10">Nearest 10</option>
        <option value="100">Nearest 100</option>
      </select>
    </td>
  </tr>

  <tr className="font-bold text-blue-800">
    <td className="py-2">Final Rounded Price</td>
    <td></td>
    <td></td>
    <td className="py-2 text-right">{formatCurrency(totals.finalPrice)}</td>
  </tr>
</tbody>

                 </table>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div><label className="block text-sm font-semibold text-slate-600 mb-1">Any internal comments regarding selling price (optional)</label><textarea value={internalRemarks} onChange={e => setInternalRemarks(e.target.value)} rows="3" className="w-full text-sm border-slate-300 rounded-md"></textarea></div>
                 <div><label className="block text-sm font-semibold text-slate-600 mb-1">Remarks for Agent/Customer (optional)</label><textarea value={customerRemarks} onChange={e => setCustomerRemarks(e.target.value)} rows="3" className="w-full text-sm border-slate-300 rounded-md"></textarea></div>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg text-center">
                <h3 className="text-sm font-bold text-blue-800">Preview Final Package Price</h3>
               <p className="text-5xl font-bold text-blue-900 my-2">
  {formatCurrency(totals.finalPrice)}
</p>
                <p className="text-xs text-slate-500">GST: {gst.included ? 'Included' : `Excluded`} ({gst.value}%)</p>
            </div>

            {/* --- UPDATED: Actions with onClick handler and disabled state --- */}
            <div className="flex justify-end space-x-4">
                <button className="bg-slate-100 text-slate-700 font-bold py-2 px-6 rounded-lg hover:bg-slate-200">Cancel</button>
                <button 
                    onClick={handleSaveClick} 
                    disabled={isSaving}
                    className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Save Quote'}
                </button>
            </div>
        </div>
    );
};

export default Summary;
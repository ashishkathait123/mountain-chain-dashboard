import React from 'react';
import { FiMessageSquare, FiMoreHorizontal } from 'react-icons/fi';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN').format(amount);
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// A more complex dueText function for better accuracy
const dueText = (date) => {
    if (!date) return { text: 'No due date', color: 'slate' };
    const diff = new Date(date) - new Date();
    const hours = Math.ceil(diff / (1000 * 60 * 60));
    
    if (hours < -24) return { text: `Due ${Math.floor(Math.abs(hours) / 24)} days ago`, color: 'red' };
    if (hours < 0) return { text: `Due yesterday`, color: 'red' };
    if (hours === 0) return { text: 'Due today', color: 'yellow' };
    if (hours <= 24) return { text: `Due in ${hours} hours`, color: 'yellow' };
    return { text: `Due in ${Math.floor(hours/24)} days`, color: 'slate' };
};

const getStatusColor = (status) => {
    const colors = {
        yellow: 'bg-yellow-100 text-yellow-800',
        red: 'bg-red-100 text-red-800',
        slate: 'bg-slate-100 text-slate-800',
    };
    return colors[status] || colors.slate;
};


const PaymentsView = ({ query, quote }) => {
    const totalDue = quote.summary?.totalSellingPrice || 0;
    const totalPaid = 0; // This would be calculated from actual payment records later

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Payments from customer</h2>

            <div className="bg-white p-6 rounded-lg shadow-sm border flex items-start gap-10">
                {/* Left Summary */}
                <div className="flex-shrink-0">
                    <p className="text-sm text-slate-500">INR</p>
                    <div className="text-3xl font-light">
                        <span className="font-bold text-green-600">+{formatCurrency(totalPaid)}</span> / {formatCurrency(totalDue)}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Created by Ravikant, 4 hours ago</p>
                </div>

                {/* Right Table */}
                <div className="flex-grow">
                    <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-slate-500 px-4">
                        <div className="col-span-3">Amount (INR)</div>
                        <div className="col-span-3">Due Date</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-4">Comments</div>
                    </div>

                    {query.instalments.map((inst, index) => {
                        const status = dueText(inst.dueDate);
                        return (
                            <div key={index} className="grid grid-cols-12 gap-4 items-center px-4 py-3 mt-2 border rounded-md">
                                <div className="col-span-3 font-bold text-lg">{formatCurrency(inst.amount)}</div>
                                <div className="col-span-3">{formatDate(inst.dueDate)}</div>
                                <div className="col-span-2">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status.color)}`}>
                                        {status.text}
                                    </span>
                                </div>
                                <div className="col-span-2 flex items-center gap-2 text-slate-500 hover:text-blue-600 cursor-pointer">
                                    <FiMessageSquare size={14}/> Add
                                </div>
                                <div className="col-span-2 flex justify-end items-center gap-2">
                                    <button className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700">Log Payment</button>
                                    <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"><FiMoreHorizontal/></button>
                                </div>
                            </div>
                        )
                    })}
                    
                    <button className="mt-4 w-full py-2 text-center text-sm font-semibold text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                        Update Payment / Instalments
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentsView;
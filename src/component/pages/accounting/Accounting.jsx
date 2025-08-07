import React, { useState } from 'react';
import ProfitReportView from './Reports';
import PaymentsView from './Payments';
const AccountingTab = ({ query, quote }) => {
    const [activeSubTab, setActiveSubTab] = useState('Profit Report');

    if (!query || !quote) {
        return <div className="p-10 text-center text-slate-500">This trip has not been converted yet.</div>;
    }

    const navItems = ['Payments', 'Proforma Invoice', 'Profit Report'];

    const renderContent = () => {
        switch (activeSubTab) {
            case 'Payments':
                return <PaymentsView query={query} quote={quote} />;
            case 'Profit Report':
                return <ProfitReportView query={query} quote={quote} />;
            case 'Proforma Invoice':
                 return <div className="p-10 text-center text-slate-500">Proforma Invoice view to be built.</div>;
            default:
                return null;
        }
    };

    return (
        <div className="flex min-h-[600px]">
            {/* Left Side Navigation */}
            <aside className="w-56 border-r border-slate-200 p-4">
                <nav className="flex flex-col space-y-1">
                    {navItems.map(item => (
                        <button
                            key={item}
                            onClick={() => setActiveSubTab(item)}
                            className={`w-full text-left px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                                activeSubTab === item
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Right Side Content */}
            <main className="flex-1 bg-slate-50">
                {renderContent()}
            </main>
        </div>
    );
};

export default AccountingTab;
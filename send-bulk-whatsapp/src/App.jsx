import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Send, Coffee } from 'lucide-react';
import Dashboard from './features/dashboard/Dashboard';
import ContactManager from './features/contacts/ContactManager';
import CampaignEditor from './features/campaign/CampaignEditor';
import Warmer from './features/warmer/Warmer';

function App() {
    const location = useLocation();

    const NavItem = ({ to, icon: Icon, label }) => {
        const active = location.pathname === to;
        return (
            <Link
                to={to}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${active
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'hover:bg-white/5 text-slate-400 hover:text-white'
                    }`}
            >
                <Icon size={20} /> <span>{label}</span>
            </Link>
        );
    };

    return (
        <div className="flex h-screen w-full font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-950 border-r border-slate-800 text-white p-4 hidden md:flex flex-col z-20 shadow-2xl">
                <div className="flex items-center gap-3 mb-10 px-2 mt-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-lg shadow-lg shadow-emerald-500/20"></div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">WaBulk</span>
                </div>

                {/* Dashboard Mode Trigger */}
                <button
                    onClick={() => window.chrome?.tabs?.create({ url: 'index.html' })}
                    className="mb-4 flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all"
                >
                    <LayoutDashboard size={14} /> Open Full Dashboard
                </button>

                <nav className="flex flex-col gap-2">
                    <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem to="/contacts" icon={Users} label="Contacts" />
                    <NavItem to="/campaign" icon={Send} label="Campaign" />
                    <NavItem to="/warmer" icon={Coffee} label="Account Warmer" />
                </nav>

                <div className="mt-auto p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide font-bold">Status</p>
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        System Ready
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-hidden flex flex-col">
                {/* Background Gradients */}
                <div className="absolute inset-0 bg-slate-900 z-0"></div>
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

                <div className="relative z-10 flex-1 overflow-auto custom-scrollbar">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/contacts" element={<ContactManager />} />
                        <Route path="/campaign" element={<CampaignEditor />} />
                        <Route path="/warmer" element={<Warmer />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}

export default App;

import React, { useEffect, useState } from 'react';
import { Users, Send, Coffee, Shield } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { getContacts } from '../../utils/storage';

export default function Dashboard() {
    const [stats, setStats] = useState({ contacts: 0, campaigns: 0 });

    useEffect(() => {
        const contacts = getContacts();
        setStats({ contacts: contacts.length, campaigns: 0 });
    }, []);

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <Card className="flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-opacity-20 ${color} bg-white`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            <div>
                <p className="text-slate-400 text-sm">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </Card>
    );

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center gap-2">
                    Dashboard
                    <span className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded-full border border-slate-700">v{__APP_VERSION__}</span>
                </h1>
                <p className="text-slate-400 mt-2">Overview of your activity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} label="Total Contacts" value={stats.contacts} color="text-blue-400" />
                <StatCard icon={Send} label="Messages Sent" value="0" color="text-emerald-400" />
                <StatCard icon={Shield} label="Protection Level" value="High" color="text-purple-400" />
                <StatCard icon={Coffee} label="Account Status" value="Good" color="text-orange-400" />
            </div>

            <Card className="h-64 flex flex-col justify-center items-center text-slate-500">
                <p>Recent activity chart will appear here...</p>
            </Card>
        </div>
    );
}

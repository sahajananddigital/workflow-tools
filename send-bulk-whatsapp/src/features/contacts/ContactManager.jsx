import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, Trash2, FileSpreadsheet, UserPlus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { saveContacts, getContacts, clearContacts } from '../../utils/storage';

export default function ContactManager() {
    const [contacts, setContacts] = useState([]);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        setContacts(getContacts());
    }, []);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file extension
        if (file.name.endsWith('.csv')) {
            Papa.parse(file, {
                header: true,
                complete: (results) => {
                    const validContacts = results.data.filter(row => row.Phone || row.phone);
                    const normalized = validContacts.map(c => ({
                        ...c,
                        name: c.Name || c.name || '',
                        phone: c.Phone || c.phone || ''
                    }));
                    updateContacts([...contacts, ...normalized]);
                }
            });
        } else if (file.name.endsWith('.xlsx')) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                const normalized = data.map(c => ({
                    ...c,
                    name: c.Name || c.name || '',
                    phone: c.Phone || c.phone || ''
                }));
                updateContacts([...contacts, ...normalized]);
            };
            reader.readAsBinaryString(file);
        }
    };

    const updateContacts = (newContacts) => {
        setContacts(newContacts);
        saveContacts(newContacts);
    };

    const handleClear = () => {
        if (confirm('Are you sure you want to delete all contacts?')) {
            clearContacts();
            setContacts([]);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                        Contact Management
                    </h1>
                    <p className="text-slate-400 mt-2">Manage your target audience efficiently.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="danger" onClick={handleClear} disabled={contacts.length === 0}>
                        <Trash2 size={18} className="inline mr-2" /> Clear All
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 space-y-4 h-fit">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Upload size={20} className="text-emerald-400" /> Import Contacts
                    </h2>
                    <p className="text-sm text-slate-400">
                        Upload CSV or Excel files. Must contain "Name" and "Phone" columns.
                    </p>

                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileSpreadsheet className="w-8 h-8 mb-3 text-slate-400" />
                            <p className="text-sm text-slate-400">Click to upload or drag and drop</p>
                        </div>
                        <input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileUpload} />
                    </label>
                </Card>

                <Card className="md:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Contact List ({contacts.length})</h2>
                    </div>

                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto rounded-lg border border-slate-700">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="text-xs uppercase bg-slate-800/80 sticky top-0 backdrop-blur-sm text-slate-400">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Phone</th>
                                    <th className="px-6 py-3">Additional Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contacts.map((contact, index) => (
                                    <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{contact.name || 'N/A'}</td>
                                        <td className="px-6 py-4 font-mono text-emerald-400">{contact.phone}</td>
                                        <td className="px-6 py-4 text-xs text-slate-500">
                                            {Object.keys(contact)
                                                .filter(k => k !== 'name' && k !== 'phone')
                                                .map(k => `${k}: ${contact[k]}`)
                                                .join(', ') || '-'}
                                        </td>
                                    </tr>
                                ))}
                                {contacts.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-slate-500">
                                            No contacts found. Upload a file to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}

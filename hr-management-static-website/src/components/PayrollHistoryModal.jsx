import React, { useEffect, useState } from 'react';
import { DBService } from '../utils/dbService';
import { X, Trash2 } from 'lucide-react';

export default function PayrollHistoryModal({ employee, onClose }) {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (employee) {
            const data = DBService.getPayrollHistory(employee.ID);
            setHistory(data);
        }
    }, [employee]);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            // We need a delete method in DBService for history
            // For now, let's assume one exists or add it
            // DBService.deletePayrollHistory(id); 
            // setHistory(history.filter(h => h.id !== id));
            alert("Delete not implemented yet in DBService");
        }
    };

    if (!employee) return null;

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                        Payroll History - {employee.Name}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Basic</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">HRA</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Special</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Net Pay</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Generated</th>
                                {/* <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th> */}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-3 py-4 text-center text-sm text-gray-500">No payroll history found.</td>
                                </tr>
                            ) : (
                                history.map((record) => (
                                    <tr key={record.id}>
                                        <td className="px-3 py-2 text-sm text-gray-900">{record.month}</td>
                                        <td className="px-3 py-2 text-sm text-gray-500">{record.basic}</td>
                                        <td className="px-3 py-2 text-sm text-gray-500">{record.hra}</td>
                                        <td className="px-3 py-2 text-sm text-gray-500">{record.special}</td>
                                        <td className="px-3 py-2 text-sm text-gray-500 text-red-600">
                                            -{(record.pf + record.pt + record.tds).toFixed(2)}
                                        </td>
                                        <td className="px-3 py-2 text-sm font-medium text-green-600">{record.net_pay}</td>
                                        <td className="px-3 py-2 text-xs text-gray-400">
                                            {new Date(record.generated_at.replace(' ', 'T')).toLocaleString()}
                                        </td>
                                        {/* 
                                        <td className="px-3 py-2 text-right text-sm font-medium">
                                            <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-900">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td> 
                                        */}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import EmployeeTable from './components/EmployeeTable';
import EmployeeForm from './components/EmployeeForm';
import Settings from './components/Settings';
import { DatabaseService } from './db/database';
import { DBService } from './utils/dbService';
import { parseCSV } from './utils/csvParser';
import { Users, FileText, Banknote, Save, Database, Download, Plus, Settings as SettingsIcon, Upload, FileDown } from 'lucide-react';

function App() {
    const [activeTab, setActiveTab] = useState('employees');
    const [employees, setEmployees] = useState([]);
    const [dbStatus, setDbStatus] = useState('disconnected'); // disconnected, connected
    const [dbName, setDbName] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    useEffect(() => {
        if (dbStatus === 'connected') {
            refreshData();
        }
    }, [dbStatus]);

    const refreshData = () => {
        const data = DBService.getEmployees();
        setEmployees(data);
    };

    const handleOpenDB = async () => {
        try {
            const result = await DatabaseService.openDatabase();
            if (result.success) {
                setDbStatus('connected');
                setDbName(result.name);
            }
        } catch (e) {
            alert('Failed to open database: ' + e.message);
        }
    };

    const handleCreateDB = async () => {
        try {
            const result = await DatabaseService.createDatabase();
            if (result.success) {
                setDbStatus('connected');
                setDbName(result.name);
            }
        } catch (e) {
            alert('Failed to create database');
        }
    };

    const handleSaveDB = async () => {
        const result = await DatabaseService.saveDatabase();
        if (result.success) {
            alert('Database saved successfully!');
        } else {
            alert(result.message || 'Failed to save');
        }
    };

    const handleBackup = () => {
        DatabaseService.downloadDatabase();
    };



    const handleSaveEmployee = (empData) => {
        if (editingEmployee) {
            DBService.updateEmployee(empData);
        } else {
            DBService.addEmployee(empData);
        }
        setShowAddForm(false);
        setEditingEmployee(null);
        refreshData();
    };

    const handleEditEmployee = (emp) => {
        setEditingEmployee(emp);
        setShowAddForm(true);
    };

    const handleDeleteEmployee = (id) => {
        if (window.confirm("Are you sure you want to delete this employee?")) {
            DBService.deleteEmployee(id);
            refreshData();
        }
    };

    const handleCsvImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const employees = await parseCSV(file);
            const { successCount, errors } = DBService.importEmployees(employees);

            let msg = `Successfully imported ${successCount} employees.`;
            if (errors.length > 0) {
                msg += `\n\nFailed to import ${errors.length} rows:\n` + errors.map(e => `${e.name}: ${e.error}`).join('\n');
            }
            alert(msg);
            refreshData();
        } catch (error) {
            alert('Error parsing CSV: ' + error.message);
        }
        e.target.value = ''; // Reset input
    };

    const handleDownloadSample = () => {
        const headers = [
            "Employee ID", "Name", "Email", "Type", "Which", "Phone",
            "Start Date", "Payment Amount", "Amount In Text",
            "Account Number", "IFSC", "Branch Name",
            "PAN", "UAN", "Bank Name"
        ];
        const sampleRow = [
            "EMP001", "John Doe", "john@example.com", "Full Time", "Engineering", "1234567890",
            "2024-01-01", "50000", "Fifty Thousand Only",
            "123456789012", "HDFC000123", "Mumbai Branch",
            "ABCDE1234F", "1009001234", "HDFC Bank"
        ];

        const csvContent = "data:text/csv;charset=utf-8," +
            [headers.join(','), sampleRow.join(',')].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "employee_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Render Landing Page if no DB connected
    if (dbStatus === 'disconnected') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
                <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8 text-center">
                    <Database className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">HR Management System</h1>
                    <p className="text-gray-500 mb-8">Secure, offline-first employee management powered by SQLite.</p>

                    <div className="space-y-4">
                        <button
                            onClick={handleOpenDB}
                            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                        >
                            <Database className="w-5 h-5 mr-2" /> Open Existing Database (.sqlite)
                        </button>
                        <button
                            onClick={handleCreateDB}
                            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" /> Create New Database
                        </button>
                    </div>
                    <p className="mt-6 text-xs text-gray-400">
                        Note: This browser must support the File System Access API for direct saving. <br />
                        Otherwise, you'll need to download backups manually.
                    </p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'employees', label: 'Employees', icon: Users },
        { id: 'payroll', label: 'Payroll', icon: Banknote },
        { id: 'offers', label: 'Offer Letters', icon: FileText },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold text-indigo-600">HR System</span>
                                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{dbName}</span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`${activeTab === tab.id
                                                ? 'border-indigo-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                        >
                                            <Icon className="w-4 h-4 mr-2" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleSaveDB}
                                className="flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                title="Save Database"
                            >
                                <Save className="w-4 h-4 mr-1" /> Save
                            </button>
                            <button
                                onClick={handleBackup}
                                className="flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                title="Download Backup"
                            >
                                <Download className="w-4 h-4 mr-1" /> Backup
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

                {activeTab === 'employees' && (
                    <>
                        <div className="flex justify-between items-center px-4 sm:px-0 mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Employee Directory</h2>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleDownloadSample}
                                    className="bg-white border text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 flex items-center text-sm"
                                    title="Download CSV Template"
                                >
                                    <FileDown className="w-4 h-4 mr-1" /> Template
                                </button>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleCsvImport}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        title="Upload CSV"
                                    />
                                    <button
                                        className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 flex items-center text-sm"
                                    >
                                        <Upload className="w-4 h-4 mr-1" /> Import CSV
                                    </button>
                                </div>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center text-sm"
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Add Employee
                                </button>
                            </div>
                        </div>
                        <EmployeeTable employees={employees} onEdit={handleEditEmployee} onDelete={handleDeleteEmployee} />
                    </>
                )}

                {/* Placeholder for now - logic needs update for Client Side */}
                {activeTab === 'payroll' && (
                    <div className="text-center py-10">
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 max-w-2xl mx-auto mt-4 text-left">
                            <p className="text-yellow-700">
                                <strong>Note:</strong> Email sending is disabled in Offline Mode.
                                Running payroll will now mark payment as done locally (feature in development).
                            </p>
                        </div>
                        <EmployeeTable employees={employees} mode="payroll" />
                    </div>
                )}
                {activeTab === 'offers' && (
                    <div className="text-center py-10">
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 max-w-2xl mx-auto mt-4 text-left">
                            <p className="text-blue-700">
                                <strong>Note:</strong> Offer letters will be generated as downloadable files.
                            </p>
                        </div>
                        <EmployeeTable employees={employees} mode="offer" />
                    </div>
                )}

                {activeTab === 'settings' && <Settings />}
            </main>

            {showAddForm && (
                <EmployeeForm
                    onClose={() => { setShowAddForm(false); setEditingEmployee(null); }}
                    onSave={handleSaveEmployee}
                    initialData={editingEmployee}
                />
            )}
        </div>
    );
}

export default App;

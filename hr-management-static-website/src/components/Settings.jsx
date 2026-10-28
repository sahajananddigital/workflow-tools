import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../db/database';
import { Save } from 'lucide-react';

export default function Settings() {
    const [settings, setSettings] = useState({
        companyName: '',
        companyAddress: '',
        logoBase64: '',
        emailService: 'mailto', // mailto or gmail_api
        gmailToken: '',
        offerTemplate: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = () => {
        try {
            const companyName = DatabaseService.getSetting('companyName') || '';
            const companyAddress = DatabaseService.getSetting('companyAddress') || '';
            const logoBase64 = DatabaseService.getSetting('logoBase64') || '';
            const emailService = DatabaseService.getSetting('emailService') || 'mailto';
            const gmailToken = DatabaseService.getSetting('gmailToken') || '';
            const offerTemplate = DatabaseService.getSetting('offerTemplate') || `Date: {{Date}}

To,
{{Name}}

Subject: Offer of Employment - {{Role}}

Dear {{Name}},

We are pleased to offer you the position of **{{Role}}** at **{{CompanyName}}**. We were impressed with your qualifications and believe you will be a valuable asset to our team.

**Position Details:**
- Designation: **{{Role}}**
- Employment Type: **{{Type}}**
- Start Date: **{{StartDate}}**
- CTC (Annual): **{{Salary}}** ({{AmountInWords}})

You will be expected to carry out the duties and responsibilities as described in the job description.

We look forward to welcoming you to **{{CompanyName}}**.

Sincerely,

Authorized Signatory
{{CompanyName}}`;

            setSettings({ companyName, companyAddress, logoBase64, emailService, gmailToken, offerTemplate });
        } catch (err) {
            console.error("Failed to load settings:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings({ ...settings, logoBase64: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        try {
            DatabaseService.saveSetting('companyName', settings.companyName);
            DatabaseService.saveSetting('companyAddress', settings.companyAddress);
            DatabaseService.saveSetting('logoBase64', settings.logoBase64);
            DatabaseService.saveSetting('emailService', settings.emailService);
            DatabaseService.saveSetting('gmailToken', settings.gmailToken);
            DatabaseService.saveSetting('offerTemplate', settings.offerTemplate);

            // Auto-save the DB file if possible
            DatabaseService.saveDatabase().then(() => {
                alert('Settings saved successfully!');
            }).catch(err => {
                alert('Settings saved to memory, but database file update failed: ' + err.message);
            });
        } catch (err) {
            alert('Failed to save settings: ' + err.message);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center p-10">
            <div className="text-gray-500">Loading settings...</div>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 m-4">
            <h2 className="text-red-800 font-bold mb-2">Error Loading Settings</h2>
            <p className="text-red-600">{error}</p>
            <button 
                onClick={loadSettings}
                className="mt-4 bg-red-100 text-red-800 px-4 py-2 rounded hover:bg-red-200"
            >
                Retry
            </button>
        </div>
    );

    return (
        <div className="bg-white shadow rounded-lg p-6 max-w-4xl mx-auto my-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Company Details */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-indigo-600">Company Details</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <input
                            name="companyName"
                            value={settings.companyName || ''}
                            onChange={handleChange}
                            className="w-full border rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Ex: Acme Corp"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                            name="companyAddress"
                            value={settings.companyAddress || ''}
                            onChange={handleChange}
                            className="w-full border rounded-md p-2 h-24 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="123 Business Rd, Tech City..."
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        {settings.logoBase64 && (
                            <div className="mt-2 border p-2 rounded w-fit">
                                <img src={settings.logoBase64} alt="Company Logo" className="h-20 object-contain" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Email Settings */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-indigo-600">Email Configuration</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Service</label>
                        <select
                            name="emailService"
                            value={settings.emailService || 'mailto'}
                            onChange={handleChange}
                            className="w-full border rounded-md p-2 bg-white"
                        >
                            <option value="mailto">Desktop Email Client (mailto:)</option>
                            <option value="gmail_api">Gmail API (Advanced)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            'mailto' opens your default email app. 'Gmail API' requires a valid access token.
                        </p>
                    </div>

                    {settings.emailService === 'gmail_api' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gmail Access Token</label>
                            <input
                                name="gmailToken"
                                type="password"
                                value={settings.gmailToken || ''}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="OAuth2 Access Token"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Offer Letter Template */}
            <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 text-indigo-600">Offer Letter Template</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Template Content (Use **text** for bold, - for bullets. Use placeholders like {{Name}}, {{Role}}, etc.)
                    </label>
                    <textarea
                        name="offerTemplate"
                        value={settings.offerTemplate || ''}
                        onChange={handleChange}
                        className="w-full border rounded-md p-4 h-64 font-mono text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter offer letter template..."
                    />
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSave}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 flex items-center shadow"
                >
                    <Save className="w-5 h-5 mr-2" /> Save Configuration
                </button>
            </div>
        </div>
    );
}

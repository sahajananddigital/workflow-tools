import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileSpreadsheet, Send, Download, Settings, RefreshCw, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import * as XLSX from 'xlsx';

// Utility for class names
import { cn } from './lib/utils';

// --- Components ---

const Card = ({ children, className }) => (
  <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden", className)}>
    {children}
  </div>
);

const Button = ({ children, onClick, disabled, variant = 'primary', className, icon: Icon }) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg",
    secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-md",
    success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md",
    ghost: "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variants[variant],
        className
      )}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder, className }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
    />
  </div>
);

const ProgressBar = ({ total, current }) => {
  const percentage = total === 0 ? 0 : Math.round((current / total) * 100);
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// --- API Logic ---

const sendSms = async (data, credentials, template, options = {}) => {
  const { username, password, url } = credentials;
  const { appLink, randomizeContent } = options;
  const auth = btoa(`${username}:${password}`);

  // In dev mode, use the proxy if the URL matches the target to avoid CORS
  // The proxy is set up in vite.config.js to forward /3rdparty -> https://api.sms-gate.app/3rdparty
  let apiUrl = url || 'https://api.sms-gate.app/3rdparty/v1/message';
  if (import.meta.env.DEV && apiUrl.includes('https://api.sms-gate.app')) {
    apiUrl = apiUrl.replace('https://api.sms-gate.app', '');
  }

  // Format phone number: Remove non-digits, ensure +91 prefix if missing but 10 digits
  let phone = String(data.mobile || data.phone || '').replace(/\D/g, '');
  if (phone.length === 10) phone = `91${phone}`;

  // Replace placeholders in template
  let message = template;
  // Basic replacements based on potential columns
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'gi');
    message = message.replace(regex, data[key]);
  });

  // Append App Link if provided
  if (appLink) {
    message += `\n\nDownload App: ${appLink}`;
  }

  // Append Random ID if enabled to prevent blocking
  if (randomizeContent) {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    message += `\n[ID: ${randomId}]`;
  }

  const payload = {
    message: message,
    phoneNumbers: [`+${phone}`], // API expects + prefix
  };

  // Add SIM Slot if specified (capcom6/android-sms-gateway support)
  if (options.simNumber) {
    payload.simNumber = parseInt(options.simNumber, 10);
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Attempt to parse JSON if possible, SMS Gate usually returns JSON
    try {
      const resData = await response.json();
      return { success: true, response: resData };
    } catch (e) {
      // Fallback for non-JSON responses
      return { success: true, response: 'OK' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// --- Main App ---

function App() {
  const [fileData, setFileData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    url: 'https://api.sms-gate.app/3rdparty/v1/message'
  });
  const [messageTemplate, setMessageTemplate] = useState(
    `🚀 Reminder: Youth Seminar 2.0 Today!

જય સ્વામિનારાયણ મિત્રો, આજે આપણા ભવ્ય યુથ સેમિનાર નું આયોજન છે. આપ સૌને સમયસર પહોંચવા માટે નમ્ર અપીલ છે.

🗓 તારીખ: આજે, 11 જાન્યુઆરી, 2026 🕘 સમય: સવારે 9:00 કલાકે 📍 સ્થળ: શ્રી સ્વામિનારાયણ ગુરુકુલ, નિકોલ, ગુરુકુલ સર્કલ.

મળીએ છીએ જલ્દી! આવવાનું ચૂકશો નહિ. 👍`
  );

  const [options, setOptions] = useState({
    randomizeDelay: false,
    randomizeContent: false,
    appLink: '',
    simNumber: ''
  });

  const [processedCount, setProcessedCount] = useState(0);
  const stopRef = useRef(false);

  // Load state from local storage on mount
  useEffect(() => {
    const savedCreds = localStorage.getItem('sms_creds');
    if (savedCreds) setCredentials(JSON.parse(savedCreds));

    const savedOptions = localStorage.getItem('sms_options');
    if (savedOptions) setOptions(JSON.parse(savedOptions));

    const savedData = localStorage.getItem('sms_data');
    if (savedData) setFileData(JSON.parse(savedData));
  }, []);

  // Save data to local storage on change
  useEffect(() => {
    localStorage.setItem('sms_creds', JSON.stringify(credentials));
  }, [credentials]);

  useEffect(() => {
    localStorage.setItem('sms_options', JSON.stringify(options));
  }, [options]);

  useEffect(() => {
    localStorage.setItem('sms_data', JSON.stringify(fileData));
  }, [fileData]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      // Initialize status
      const formattedData = data.map(row => ({
        ...row,
        __status: 'pending', // pending, success, error
        __log: ''
      }));

      setFileData(formattedData);
      setProcessedCount(0);
    };
    reader.readAsBinaryString(file);
  };

  const startSending = async () => {
    if (!credentials.username || !credentials.password) {
      alert("Please enter API credentials first.");
      return;
    }

    setIsProcessing(true);
    stopRef.current = false;
    let count = 0;

    // We only process 'pending' items to allow resuming
    const dataToProcess = fileData.map((item, index) => ({ item, index })).filter(x => x.item.__status !== 'success');

    for (const { item, index } of dataToProcess) {
      if (stopRef.current) break;

      // Update status to sending
      setFileData(prev => {
        const newData = [...prev];
        newData[index].__status = 'sending';
        return newData;
      });

      // Delay Logic
      let delay = 1000; // Default 1s
      if (options.randomizeDelay) {
        // Random delay between 2s and 10s to look human
        delay = Math.floor(Math.random() * (10000 - 2000 + 1) + 2000);
      }
      await new Promise(r => setTimeout(r, delay));

      const result = await sendSms(item, credentials, messageTemplate, options);

      setFileData(prev => {
        const newData = [...prev];
        newData[index].__status = result.success ? 'success' : 'error';
        newData[index].__log = result.success ? 'Sent' : result.error;
        return newData;
      });

      count++;
      setProcessedCount(prev => prev + 1);
    }

    setIsProcessing(false);
  };

  const stopSending = () => {
    stopRef.current = true;
    setIsProcessing(false);
  };

  const exportData = () => {
    const ws = XLSX.utils.json_to_sheet(fileData.map(({ __status, __log, ...rest }) => ({
      ...rest,
      Status: __status,
      Log: __log
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SMS Report");
    XLSX.writeFile(wb, "sms_dispatch_report.xlsx");
  };

  const clearData = () => {
    if (confirm("Are you sure you want to clear all data?")) {
      setFileData([]);
      setProcessedCount(0);
      localStorage.removeItem('sms_data');
    }
  };

  const exportSettings = () => {
    const settings = {
      credentials,
      messageTemplate,
      options,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    // Create blob and download
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "sms_sender_settings.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const settingsInputRef = useRef(null);

  const importSettings = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const settings = JSON.parse(evt.target.result);

        // Validate and apply
        if (settings.credentials) setCredentials(settings.credentials);
        if (settings.messageTemplate) setMessageTemplate(settings.messageTemplate);
        if (settings.options) setOptions(settings.options);

        alert("Settings imported successfully!");
      } catch (err) {
        alert("Failed to import settings: Invalid JSON file.");
      }
    };
    reader.readAsText(file);
    // Reset value so same file can be selected again
    e.target.value = '';
  };

  // Calculate stats
  const total = fileData.length;
  const success = fileData.filter(d => d.__status === 'success').length;
  const failed = fileData.filter(d => d.__status === 'error').length;
  const pending = total - success - failed;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Bulk SMS Dispatcher
            </h1>
            <p className="text-slate-500 mt-1">Manage and send SMS campaigns efficiently</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" icon={Download} onClick={exportData} disabled={total === 0}>
              Export Report
            </Button>
            <Button variant="danger" icon={RefreshCw} onClick={clearData} disabled={total === 0}>
              Clear Data
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Config */}
          <div className="space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="text-blue-600" size={20} />
                  Configuration
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={exportSettings}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded border border-gray-200"
                    title="Export Settings"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => settingsInputRef.current?.click()}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded border border-gray-200"
                    title="Import Settings"
                  >
                    Import
                  </button>
                  <input
                    type="file"
                    ref={settingsInputRef}
                    onChange={importSettings}
                    accept=".json"
                    className="hidden"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Input
                  label="API URL"
                  value={credentials.url}
                  onChange={e => setCredentials({ ...credentials, url: e.target.value })}
                  placeholder="https://api.sms-gate.app/3rdparty/v1/message"
                />
                <Input
                  label="API Username"
                  value={credentials.username}
                  onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                  placeholder="Enter API username"
                />
                <Input
                  label="API Password"
                  type="password"
                  value={credentials.password}
                  onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="Enter API password"
                />
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <FileSpreadsheet className="text-green-600" size={20} />
                Message Template
              </h2>
              <textarea
                className="w-full h-48 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono resize-none leading-relaxed"
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2">
                Use placeholder tags like <code>{'{Name}'}</code> to dynamically insert data from Excel columns.
              </p>
            </Card>

            <Card className="p-5">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Settings className="text-purple-600" size={20} />
                Advanced Options
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.randomizeDelay}
                    onChange={e => setOptions({ ...options, randomizeDelay: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Randomize Delay (2s - 10s)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.randomizeContent}
                    onChange={e => setOptions({ ...options, randomizeContent: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Randomize Content (Append unique ID)</span>
                </label>

                <Input
                  label="Android App Link (Optional)"
                  placeholder="e.g. https://play.google.com/store/apps/details?id=..."
                  value={options.appLink}
                  onChange={e => setOptions({ ...options, appLink: e.target.value })}
                  className="pt-2"
                />

                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">SIM Slot (Optional)</label>
                  <select
                    value={options.simNumber}
                    onChange={e => setOptions({ ...options, simNumber: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="">Default (Auto)</option>
                    <option value="1">SIM 1</option>
                    <option value="2">SIM 2</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">For dual-SIM devices using Android SMS Gateway.</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Data & Actions */}
          <div className="lg:col-span-2 space-y-6">

            {/* Upload Area */}
            {total === 0 && (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:border-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer group relative">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Upload Excel File</h3>
                <p className="text-gray-500 mt-2">Drag and drop or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">Supports .xlsx and .xls</p>
              </div>
            )}

            {/* Stats & Controls */}
            {total > 0 && (
              <Card className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-300" />
                      <span className="font-medium text-slate-600">Total: {total}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="font-medium text-slate-600">Sent: {success}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="font-medium text-slate-600">Failed: {failed}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {!isProcessing ? (
                      <Button onClick={startSending} icon={Send} disabled={pending === 0}>
                        {pending === 0 ? 'All Sent' : 'Start Sending'}
                      </Button>
                    ) : (
                      <Button onClick={stopSending} variant="danger" icon={XCircle}>
                        Stop
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold uppercase text-gray-400 tracking-wider">
                    <span>Progress</span>
                    <span>{Math.round((success + failed) / total * 100)}%</span>
                  </div>
                  <ProgressBar total={total} current={success + failed} />
                </div>
              </Card>
            )}

            {/* Data Table */}
            {total > 0 && (
              <Card className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="p-4 w-16">#</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Log</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {fileData.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-gray-400 text-sm">{i + 1}</td>
                        <td className="p-4 font-mono text-sm text-gray-700">
                          {row.mobile || row.phone || '-'}
                        </td>
                        <td className="p-4">
                          <StatusBadge status={row.__status} />
                        </td>
                        <td className="p-4 text-sm text-gray-500 truncate max-w-xs" title={row.__log}>
                          {row.__log || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-gray-100 text-gray-600",
    sending: "bg-blue-100 text-blue-600 animate-pulse",
    success: "bg-emerald-100 text-emerald-600",
    error: "bg-red-100 text-red-600"
  };

  const icons = {
    pending: Clock,
    sending: RefreshCw,
    success: CheckCircle,
    error: AlertCircle
  };

  const Icon = icons[status] || Clock;

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", styles[status])}>
      <Icon size={14} className={status === 'sending' ? 'animate-spin' : ''} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default App;

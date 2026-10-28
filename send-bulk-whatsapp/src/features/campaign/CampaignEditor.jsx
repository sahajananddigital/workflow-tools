import React, { useState, useEffect } from 'react';
import { Send, Clock, ShieldCheck, Play, Pause, RotateCcw } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getContacts, saveCampaignState, getCampaignState } from '../../utils/storage';
import { processMessage } from '../../utils/messageProcessor';

export default function CampaignEditor() {
    const [message, setMessage] = useState('');
    const [contacts, setContacts] = useState([]);
    const [sending, setSending] = useState(false);
    const [image, setImage] = useState(null); // New Image State
    const [progress, setProgress] = useState({ current: 0, total: 0, sent: 0, failed: 0 });
    const sendingRef = React.useRef(false); // Ref for async loop control

    const [config, setConfig] = useState({
        minDelay: 3,
        maxDelay: 8,
        appendRandomId: true,
        batchSize: 10
    });
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        setContacts(getContacts());
        const savedState = getCampaignState();
        if (savedState) {
            if (savedState.message) setMessage(savedState.message);
            if (savedState.config) setConfig(savedState.config);
            if (savedState.imageBase64) {
                // Restore image from base64 string
                fetch(savedState.imageBase64)
                    .then(res => res.blob())
                    .then(blob => {
                        const file = new File([blob], "restored_image.png", { type: "image/png" });
                        setImage(file);
                    })
                    .catch(err => console.error("Failed to restore image", err));
            }
        } else {
            setMessage('Hello {name}, how are you?');
        }
    }, []);

    // Auto-save state
    useEffect(() => {
        const save = async () => {
            let imageBase64 = null;
            if (image) {
                imageBase64 = await new Promise(r => {
                    const reader = new FileReader();
                    reader.onload = () => r(reader.result);
                    reader.readAsDataURL(image);
                });
            }
            saveCampaignState({ message, config, imageBase64 });
        };
        const timer = setTimeout(save, 1000); // Debounce save
        return () => clearTimeout(timer);
    }, [message, config, image]);

    const addToLog = (msg, type = 'info') => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 50));
    };

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    // Check if running as extension
    const isExtension = !!window.chrome && !!window.chrome.runtime && !!window.chrome.runtime.sendMessage;

    const startCampaign = async () => {
        if (sending || sendingRef.current) return;

        if (contacts.length === 0) {
            alert('No contacts found! Please import contacts first.');
            return;
        }

        setSending(true);
        sendingRef.current = true; // Set ref to true
        setProgress({ current: 0, total: contacts.length, sent: 0, failed: 0 });
        addToLog('Starting campaign (Extension Mode)...', 'success');

        // Get current tab to verify we are on WhatsApp (or open it)
        // Actually, for the popup, we can just query tabs.
        // However, simplicity: Let's assume user is on WhatsApp Web or we open it.

        for (let i = 0; i < contacts.length; i++) {
            if (!sendingRef.current) { // Check ref instead of state
                addToLog('Campaign stopped by user.', 'warning');
                break;
            }

            const contact = contacts[i];
            setProgress(prev => ({ ...prev, current: i + 1 }));

            try {
                const processedMsg = processMessage(message, contact, {
                    appendRandomId: config.appendRandomId
                });

                // Random Delay
                const delay = Math.floor(Math.random() * (config.maxDelay - config.minDelay + 1) + config.minDelay) * 1000;
                addToLog(`Sending to ${contact.name}...`);

                if (isExtension) {
                    // Send native message via Content Script
                    // 1. We need the tab ID of WhatsApp Web
                    // Since this is a popup, we can query tabs
                    const tabs = await new Promise(r => chrome.tabs.query({ url: "https://web.whatsapp.com/*" }, r));
                    let tabId;

                    if (tabs.length === 0) {
                        // Create tab
                        const tab = await new Promise(r => chrome.tabs.create({ url: "https://web.whatsapp.com" }, r));
                        tabId = tab.id;
                        addToLog('Opened WhatsApp Web. Please wait for load...');
                        await sleep(10000); // Initial load wait
                    } else {
                        tabId = tabs[0].id;
                        await new Promise(r => chrome.tabs.update(tabId, { active: true }, r));
                    }

                    // Send Command
                    // We need to convert image to base64 if it exists
                    let imageBase64 = null;
                    if (image) {
                        imageBase64 = await new Promise(r => {
                            const reader = new FileReader();
                            reader.onload = () => r(reader.result);
                            reader.readAsDataURL(image);
                        });
                    }

                    // Hybrid approach:
                    // 1. Update Tab URL to chat
                    // Note: We DO NOT include text here to avoid duplication (WhatsApp pre-fills + we type it).
                    // We only use URL to open the correct chat.

                    await new Promise(r => chrome.tabs.update(tabId, { url: `https://web.whatsapp.com/send?phone=${contact.phone}` }, r));

                    // 2. Wait for "Ready" (detected by content script or just time)
                    addToLog('Waiting for chat to load...');
                    await sleep(8000); // 8s load time safety

                    // 3. Send Message Command
                    await new Promise((resolve, reject) => {
                        chrome.tabs.sendMessage(tabId, {
                            action: "SEND_MESSAGE",
                            text: processedMsg,
                            image: imageBase64
                        }, (response) => {
                            if (chrome.runtime.lastError) {
                                reject(chrome.runtime.lastError.message);
                            } else if (response && response.status === 'error') {
                                reject(response.message);
                            } else {
                                resolve();
                            }
                        });
                    });

                    addToLog(`✅ Sent to ${contact.name}`);
                } else {
                    addToLog('❌ Extension not detected. Please install the extension.', 'error');
                    break;
                }

                addToLog(`Waiting ${delay / 1000}s...`);
                await sleep(delay);

            } catch (error) {
                console.error(error);
                addToLog(`Error sending to ${contact.phone}: ${error}`, 'error');
            }
        }

        setSending(false);
        sendingRef.current = false;
        addToLog('Campaign finished.', 'success');
    };

    const stopCampaign = () => {
        setSending(false);
        sendingRef.current = false; // Stop immediately
        addToLog('Stopping campaign...', 'warning');
    };

    return (
        <div className="p-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-2rem)]">

            {/* Left Column: Editor & Config */}
            <div className="space-y-6 overflow-y-auto pr-2">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                        Campaign Editor
                    </h1>
                    <p className="text-slate-400 mt-2">Compose and automate your outreach.</p>
                </div>

                <Card>
                    <h2 className="text-xl font-semibold mb-4">Message</h2>
                    <div className="mb-4 p-4 border-2 border-dashed border-slate-600 rounded-lg hover:bg-slate-800/50 transition-colors">
                        <label className="flex flex-col items-center justify-center cursor-pointer">
                            <span className="text-sm text-slate-400 mb-2">
                                {image ? `Selected: ${image.name}` : 'Click to attach an image (Copied to clipboard)'}
                            </span>
                            <input
                                type="file"
                                accept="image/png, image/jpeg"
                                className="hidden"
                                onChange={(e) => setImage(e.target.files[0])}
                            />
                            {image && (
                                <button
                                    onClick={(e) => { e.preventDefault(); setImage(null); }}
                                    className="text-xs text-red-400 hover:text-red-300 mt-2"
                                >
                                    Remove Image
                                </button>
                            )}
                        </label>
                    </div>
                    <textarea
                        className="w-full h-40 bg-slate-800/50 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none font-sans"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here... Use {name} for dynamic variables."
                    />
                    <div className="flex gap-2 mt-3 flex-wrap">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold self-center mr-2">Variables:</span>
                        {['name', 'phone'].map(v => (
                            <button
                                key={v}
                                onClick={() => setMessage(prev => prev + ` {${v}}`)}
                                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-emerald-400 font-mono transition-colors"
                            >
                                {`{${v}}`}
                            </button>
                        ))}
                        <button
                            onClick={() => setMessage(prev => prev + ` {Hello|Hi|Hey}`)}
                            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-purple-400 font-mono transition-colors"
                        >
                            Spintax
                        </button>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <ShieldCheck size={20} className="text-emerald-400" />
                        Protection & Settings
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                            <div className="flex flex-col">
                                <span className="font-medium">Information Granularity</span>
                                <span className="text-xs text-slate-400">Append random ID to avoid spam filters</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={config.appendRandomId} onChange={e => setConfig({ ...config, appendRandomId: e.target.checked })} />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <label className="block text-xs text-slate-400 mb-1">Min Delay (sec)</label>
                                <input type="number" value={config.minDelay} onChange={e => setConfig({ ...config, minDelay: Number(e.target.value) })} className="w-full bg-transparent border-b border-slate-600 focus:border-emerald-500 outline-none text-white font-mono" />
                            </div>
                            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <label className="block text-xs text-slate-400 mb-1">Max Delay (sec)</label>
                                <input type="number" value={config.maxDelay} onChange={e => setConfig({ ...config, maxDelay: Number(e.target.value) })} className="w-full bg-transparent border-b border-slate-600 focus:border-emerald-500 outline-none text-white font-mono" />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Right Column: Execution */}
            <div className="space-y-6 flex flex-col h-full">
                <Card className="flex-1 flex flex-col bg-slate-900/50">
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-right">
                            <div className="text-3xl font-mono font-bold text-white">{progress.current} <span className="text-lg text-slate-500">/ {progress.total}</span></div>
                            <div className="text-xs text-slate-400">Processed</div>
                        </div>
                        {!sending ? (
                            <Button onClick={startCampaign} className="px-8 py-4 text-lg shadow-emerald-500/20 shadow-xl">
                                <Play size={24} className="inline mr-2" /> Start Campaign
                            </Button>
                        ) : (
                            <Button onClick={stopCampaign} variant="danger" className="px-8 py-4 text-lg animate-pulse">
                                <Pause size={24} className="inline mr-2" /> Stop
                            </Button>
                        )}
                    </div>

                    {/* Live Terminal Log */}
                    <div className="flex-1 bg-black/80 rounded-lg p-4 font-mono text-sm overflow-y-auto border border-slate-800 custom-scrollbar">
                        {logs.length === 0 && <span className="text-slate-600">Ready to start...</span>}
                        {logs.map((log, i) => (
                            <div key={i} className={`mb-1 ${log.includes('error') ? 'text-red-400' : log.includes('success') ? 'text-emerald-400' : 'text-slate-300'}`}>
                                {log}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

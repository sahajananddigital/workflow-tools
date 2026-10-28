import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function Warmer() {
    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-400">
                    Account Warmer
                </h1>
                <p className="text-slate-400 mt-2">Build reputation by simulating natural conversations.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <h2 className="text-xl font-semibold mb-4">What is Warming?</h2>
                    <p className="text-slate-300 mb-4">
                        WhatsApp monitors account activity. Rapid spikes in messaging can trigger bans.
                        "Warming" involves gradually increasing activity and having two-way conversations with known contacts.
                    </p>
                    <ul className="list-disc list-inside text-slate-400 space-y-2">
                        <li>Start with 10-20 messages/day.</li>
                        <li>Engage in conversations (replies matter).</li>
                        <li>Increase volume by 10-20% daily.</li>
                    </ul>
                </Card>

                <Card>
                    <h2 className="text-xl font-semibold mb-4">Warmer Tool (Beta)</h2>
                    <p className="text-slate-400 mb-4">
                        This tool sends random friendly messages to your own "Safe List" of numbers to generate activity.
                    </p>
                    <Button className="w-full" disabled>
                        Start Warming (Coming Soon)
                    </Button>
                </Card>
            </div>
        </div>
    );
}

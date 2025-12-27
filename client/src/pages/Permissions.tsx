import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { MessageSquare, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export default function Permissions() {
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const handleSMSToggle = (value: boolean) => {
    setSmsEnabled(value);
    toast({
      title: value ? "SMS Access Enabled" : "SMS Access Disabled",
      description: value 
        ? "The app can now read your transaction SMS messages." 
        : "The app will not read your SMS messages.",
      duration: 2000,
    });
  };

  const handleEmailToggle = (value: boolean) => {
    setEmailEnabled(value);
    toast({
      title: value ? "Gmail Access Enabled" : "Gmail Access Disabled",
      description: value 
        ? "The app can now read your transaction emails from Gmail." 
        : "The app will not read your Gmail messages.",
      duration: 2000,
    });
  };

  return (
    <Layout>
      <div className="px-5 pt-6 pb-6">
        <h1 className="text-2xl font-bold mb-1">Permissions</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Choose which messages the app can read to explain your transactions.
        </p>

        {/* SMS Permission */}
        <Card className="mb-4 border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground flex-shrink-0 mt-0.5">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-base text-foreground">SMS Messages</h3>
                  <p className="text-xs text-muted-foreground mt-1">Bank alerts, UPI, card transactions</p>
                </div>
              </div>
              <Switch 
                checked={smsEnabled} 
                onCheckedChange={handleSMSToggle}
                className="ml-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Permission */}
        <Card className="mb-6 border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground flex-shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-base text-foreground">Gmail</h3>
                  <p className="text-xs text-muted-foreground mt-1">Transaction emails and receipts</p>
                </div>
              </div>
              <Switch 
                checked={emailEnabled} 
                onCheckedChange={handleEmailToggle}
                className="ml-2"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
          <p>✓ SMS reading requires Android permission</p>
          <p>✓ Gmail access is read-only (we never modify emails)</p>
          <p>✓ Messages are processed on your device only</p>
          <p>✓ We don't store full message content</p>
        </div>
      </div>
    </Layout>
  );
}

import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Shield, MessageSquare, Mail, Smartphone, Check, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

export default function Permissions() {
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const handleToggle = (type: 'sms' | 'email', value: boolean) => {
    if (type === 'sms') setSmsEnabled(value);
    if (type === 'email') setEmailEnabled(value);
    
    toast({
      title: value ? "Permission Granted" : "Permission Revoked",
      description: `${type.toUpperCase()} access has been ${value ? 'enabled' : 'disabled'}.`,
      duration: 2000,
    });
  };

  return (
    <Layout>
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold mb-2">Data & Privacy</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Control how ClearText accesses and processes your transaction messages.
        </p>

        {/* Privacy Promise Card */}
        <Card className="bg-primary text-primary-foreground border-none mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <CardHeader className="relative z-10 pb-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-lg">Zero-Knowledge Processing</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-primary-foreground/90 text-sm leading-relaxed">
              We process all messages locally on your device. Your financial data never leaves your phone and is never stored on our servers.
            </p>
          </CardContent>
        </Card>

        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Input Sources</h2>

        {/* SMS Permission */}
        <div className="bg-card rounded-xl border border-border p-4 mb-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">SMS Messages</h3>
                <p className="text-xs text-muted-foreground">Bank alerts & OTPs</p>
              </div>
            </div>
            <Switch 
              checked={smsEnabled} 
              onCheckedChange={(v) => handleToggle('sms', v)} 
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed pl-[3.25rem]">
            Allows the app to read incoming SMS to detect financial transactions automatically.
          </p>
        </div>

        {/* Email Permission */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Email Receipts</h3>
                <p className="text-xs text-muted-foreground">Invoices & Statements</p>
              </div>
            </div>
            <Switch 
              checked={emailEnabled} 
              onCheckedChange={(v) => handleToggle('email', v)} 
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed pl-[3.25rem]">
            Connect your Gmail account to parse transaction emails. Read-only access required.
          </p>
        </div>

        <div className="flex flex-col gap-3">
            <Button variant="outline" className="w-full justify-start h-12 text-muted-foreground font-normal">
                <Shield className="w-4 h-4 mr-2" />
                Read Privacy Policy
            </Button>
            <Button variant="outline" className="w-full justify-start h-12 text-muted-foreground font-normal">
                <Check className="w-4 h-4 mr-2" />
                Data Retention Settings
            </Button>
        </div>

      </div>
    </Layout>
  );
}

import React from 'react';
import { Layout } from '@/components/Layout';
import { AlertCircle, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Disclaimer() {
  return (
    <Layout>
      <div className="px-5 pt-6 pb-6">
        <h1 className="text-2xl font-bold mb-6">Privacy & Disclaimer</h1>

        {/* Main Disclaimer */}
        <Card className="mb-6 border-2 border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/30">
          <CardContent className="p-4">
            <div className="flex gap-3 items-start mb-3">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-900 dark:text-orange-100 text-sm mb-2">Important Disclaimer</p>
                <p className="text-xs text-orange-800 dark:text-orange-200 leading-relaxed">
                  <strong>This app only explains transaction messages you receive.</strong> It does not provide financial, investment, or legal advice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">How We Use Your Data</h2>

        <Card className="mb-4 border-none shadow-sm">
          <CardContent className="p-4 text-xs space-y-2 text-muted-foreground leading-relaxed">
            <p><strong>✓ What we do:</strong> Read transaction messages with your permission and explain them in simple language</p>
            <p><strong>✓ Where processing happens:</strong> All explanations are generated on your device (locally)</p>
            <p><strong>✓ Data we keep:</strong> Only the explanations you see. Raw messages are not stored.</p>
          </CardContent>
        </Card>

        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">What We Don't Do</h2>

        <Card className="mb-6 border-none shadow-sm">
          <CardContent className="p-4 text-xs space-y-2 text-muted-foreground leading-relaxed">
            <p><strong>✗ No investment advice</strong> – We don't suggest what to do with your money</p>
            <p><strong>✗ No portfolio analysis</strong> – We don't analyze your spending</p>
            <p><strong>✗ No budget tracking</strong> – We don't create budgets or plans</p>
            <p><strong>✗ No data sharing</strong> – We never sell or share your data</p>
            <p><strong>✗ No bank login</strong> – We don't access your bank accounts directly</p>
          </CardContent>
        </Card>

        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Your Control</h2>

        <Card className="border-none shadow-sm">
          <CardContent className="p-4 text-xs space-y-2 text-muted-foreground leading-relaxed">
            <p>• You can disable SMS reading or Gmail access anytime in Permissions</p>
            <p>• You can delete all stored explanations from your device</p>
            <p>• This app works offline—no internet required to explain messages</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

'use client';

import { useState } from 'react';
import {
  generatePersonalizedNotification,
  type GeneratePersonalizedNotificationInput,
} from '@/ai/flows/generate-personalized-notifications';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Copy } from 'lucide-react';
import type { Invoice, Client } from '@/lib/data';

interface NotificationGeneratorProps {
  invoice: Invoice;
  client: Client;
}

export function NotificationGenerator({ invoice, client }: NotificationGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    setNotification('');

    const input: GeneratePersonalizedNotificationInput = {
      clientName: client.name,
      paymentHistory: invoice.paymentHistory || 'No previous history.',
      originalAmount: invoice.originalAmount,
      currentAmount: invoice.currentAmount,
      dueDate: invoice.dueDate,
      paymentMethod: invoice.paymentMethod,
      status: invoice.status,
    };

    try {
      const result = await generatePersonalizedNotification(input);
      setNotification(result.notificationMessage);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error generating notification',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(notification);
    toast({
      title: 'Copied to clipboard!',
      description: 'The notification message has been copied.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Notification Generator</CardTitle>
        <CardDescription>
          Use AI to generate personalized reminders and notifications for this invoice.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate Notification
        </Button>
        <div className="relative">
          <Textarea
            placeholder="Generated notification will appear here..."
            value={notification}
            readOnly
            className="min-h-[200px] bg-secondary"
          />
          {notification && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-7 w-7"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Review the generated message for accuracy before sending.
        </p>
      </CardFooter>
    </Card>
  );
}

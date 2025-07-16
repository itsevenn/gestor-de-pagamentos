'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized invoice reminders and overdue notices.
 *
 * - generatePersonalizedNotification - A function that generates personalized invoice reminders and overdue notices based on client payment history.
 * - GeneratePersonalizedNotificationInput - The input type for the generatePersonalizedNotification function.
 * - GeneratePersonalizedNotificationOutput - The return type for the generatePersonalizedNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedNotificationInputSchema = z.object({
  clientName: z.string().describe('The name of the client.'),
  paymentHistory: z
    .string()
    .describe(
      'A summary of the client payment history, including invoice amounts, due dates, and payment dates.'
    ),
  originalAmount: z.number().describe('The original amount due.'),
  currentAmount: z.number().describe('The current amount due.'),
  dueDate: z.string().describe('The due date of the invoice (YYYY-MM-DD).'),
  paymentMethod: z.string().describe('The payment method used by the client.'),
  status: z
    .enum(['pending', 'paid', 'overdue', 'refunded'])
    .describe('The current status of the payment.'),
});

export type GeneratePersonalizedNotificationInput = z.infer<
  typeof GeneratePersonalizedNotificationInputSchema
>;

const GeneratePersonalizedNotificationOutputSchema = z.object({
  notificationMessage: z
    .string()
    .describe('The personalized notification message for the client.'),
});

export type GeneratePersonalizedNotificationOutput = z.infer<
  typeof GeneratePersonalizedNotificationOutputSchema
>;

export async function generatePersonalizedNotification(
  input: GeneratePersonalizedNotificationInput
): Promise<GeneratePersonalizedNotificationOutput> {
  return generatePersonalizedNotificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedNotificationPrompt',
  input: {schema: GeneratePersonalizedNotificationInputSchema},
  output: {schema: GeneratePersonalizedNotificationOutputSchema},
  prompt: `You are an AI assistant that generates personalized invoice reminders and overdue notices for clients.

  Based on the client's payment history and current invoice details, create a notification message that is both informative and encouraging.

  Here are the details:
  Client Name: {{{clientName}}}
  Payment History: {{{paymentHistory}}}
  Original Amount: {{{originalAmount}}}
  Current Amount: {{{currentAmount}}}
  Due Date: {{{dueDate}}}
  Payment Method: {{{paymentMethod}}}
  Status: {{{status}}}

  Compose a message that:
  - Reminds the client of the upcoming or overdue payment.
  - Provides the necessary payment details (amount, due date, payment method).
  - Encourages prompt payment while maintaining a professional and friendly tone.
  - If overdue, gently reminds of any late payment fees or consequences.
  - If paid, thanks the client for their payment.

  Notification Message:`,
});

const generatePersonalizedNotificationFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedNotificationFlow',
    inputSchema: GeneratePersonalizedNotificationInputSchema,
    outputSchema: GeneratePersonalizedNotificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

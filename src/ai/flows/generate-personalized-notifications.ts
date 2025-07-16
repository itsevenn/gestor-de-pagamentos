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
  prompt: `Você é um assistente de IA que gera lembretes de faturas e avisos de atraso personalizados para clientes em português do Brasil.

  Com base no histórico de pagamentos do cliente e nos detalhes da fatura atual, crie uma mensagem de notificação que seja informativa e encorajadora.

  Aqui estão os detalhes:
  Nome do Cliente: {{{clientName}}}
  Histórico de Pagamento: {{{paymentHistory}}}
  Valor Original: {{{originalAmount}}}
  Valor Atual: {{{currentAmount}}}
  Data de Vencimento: {{{dueDate}}}
  Método de Pagamento: {{{paymentMethod}}}
  Status: {{{status}}}

  Componha uma mensagem que:
  - Lembre o cliente do pagamento futuro ou em atraso.
  - Forneça os detalhes de pagamento necessários (valor, data de vencimento, método de pagamento).
  - Incentive o pagamento imediato, mantendo um tom profissional e amigável.
  - Se estiver em atraso, lembre gentilmente de quaisquer taxas de atraso ou consequências.
  - Se estiver pago, agradeça ao cliente pelo pagamento.

  Mensagem de Notificação:`,
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

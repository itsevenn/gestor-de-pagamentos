
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

// Substituir a definição do prompt por um array de mensagens no formato esperado
const buildPromptMessages = (input: GeneratePersonalizedNotificationInput) => [
  {
    role: "user",
    content: [
      {
        text: `Você é um assistente de IA que gera lembretes de faturas e avisos de atraso personalizados para clientes em português do Brasil.\n\nCom base no histórico de pagamentos do cliente e nos detalhes da fatura atual, crie uma mensagem de notificação que seja informativa e encorajadora.\n\nAqui estão os detalhes:\nNome do Cliente: ${input.clientName}\nHistórico de Pagamento: ${input.paymentHistory}\nValor Original: ${input.originalAmount}\nValor Atual: ${input.currentAmount}\nData de Vencimento: ${input.dueDate}\nMétodo de Pagamento: ${input.paymentMethod}\nStatus: ${input.status}\n\nComponha uma mensagem que:\n- Lembre o cliente do pagamento futuro ou em atraso.\n- Forneça os detalhes de pagamento necessários (valor, data de vencimento, método de pagamento).\n- Incentive o pagamento imediato, mantendo um tom profissional e amigável.\n- Se estiver em atraso, lembre gentilmente de quaisquer taxas de atraso ou consequências.\n- Se estiver pago, agradeça ao cliente pelo pagamento.\n\nMensagem de Notificação:`
      }
    ]
  }
];

const generatePersonalizedNotificationFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedNotificationFlow',
    inputSchema: GeneratePersonalizedNotificationInputSchema,
    outputSchema: GeneratePersonalizedNotificationOutputSchema,
  },
  async input => {
    const response = await ai.generate({
      messages: buildPromptMessages(input),
      output: {
        schema: GeneratePersonalizedNotificationOutputSchema,
      },
    });
    return response.output!;
  }
);

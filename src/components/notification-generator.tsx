'use client';

import { useState } from 'react';
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
import type { Invoice, Ciclista } from '@/lib/data';
import { useCiclistas } from '@/context/app-context';

interface NotificationGeneratorProps {
  invoice: Invoice;
  client: Ciclista;
}

export function NotificationGenerator({ invoice }: NotificationGeneratorProps) {
  const { ciclistas } = useCiclistas();
  const client = ciclistas.find(c => c.id === invoice.ciclistaId);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const { toast } = useToast();

  const generateLocalNotification = (invoice: Invoice, client?: Ciclista) => {
    const clientName = client?.nomeCiclista || 'Ciclista';
    const amount = Number(invoice.currentAmount).toFixed(2);
    const dueDate = new Date(invoice.dueDate).toLocaleDateString('pt-BR');
    const today = new Date();
    const dueDateObj = new Date(invoice.dueDate);
    const daysOverdue = Math.floor((today.getTime() - dueDateObj.getTime()) / (1000 * 60 * 60 * 24));

    let message = '';

    switch (invoice.status) {
      case 'overdue':
        message = `Olá ${clientName}! 👋

Espero que esteja bem! Gostaria de lembrar que sua fatura está em atraso há ${daysOverdue} dia(s).

📋 Detalhes da Fatura:
• Valor: R$ ${amount}
• Data de Vencimento: ${dueDate}
• Status: Atrasada

⏰ Por favor, regularize seu pagamento o quanto antes para evitar possíveis taxas de atraso.

💳 Formas de Pagamento:
• PIX
• Boleto Bancário
• Transferência Bancária
• Cartão de Crédito

Se tiver alguma dúvida ou dificuldade, não hesite em entrar em contato conosco. Estamos aqui para ajudar!

Agradecemos sua atenção e aguardamos o pagamento.

Atenciosamente,
Equipe de Gestão de Pagamentos`;

        break;

      case 'paid':
        message = `Olá ${clientName}! 👋

Excelente notícia! Recebemos seu pagamento com sucesso! 🎉

📋 Confirmação de Pagamento:
• Valor Pago: R$ ${amount}
• Data de Pagamento: ${invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString('pt-BR') : 'Hoje'}
• Método: ${invoice.paymentMethod || 'Não informado'}

✅ Sua fatura foi marcada como PAGA e está em dia.

Obrigado por manter seu pagamento em dia! Sua pontualidade é muito importante para nós.

Continue assim! 🚀

Atenciosamente,
Equipe de Gestão de Pagamentos`;

        break;

      case 'pending':
        message = `Olá ${clientName}! 👋

Gostaria de lembrar sobre sua fatura pendente.

📋 Detalhes da Fatura:
• Valor: R$ ${amount}
• Data de Vencimento: ${dueDate}
• Status: Pendente

⏰ A data de vencimento está se aproximando. Para evitar atrasos, recomendamos realizar o pagamento antes do vencimento.

💳 Formas de Pagamento Disponíveis:
• PIX (mais rápido)
• Boleto Bancário
• Transferência Bancária
• Cartão de Crédito

Se tiver alguma dúvida sobre o pagamento, estamos à disposição para ajudar!

Agradecemos sua atenção.

Atenciosamente,
Equipe de Gestão de Pagamentos`;

        break;

      case 'refunded':
        message = `Olá ${clientName}! 👋

Informamos que sua fatura foi reembolsada conforme solicitado.

📋 Detalhes do Reembolso:
• Valor Reembolsado: R$ ${amount}
• Status: Reembolsado

✅ O processo de reembolso foi concluído com sucesso.

Se você ainda não recebeu o valor, pode levar alguns dias úteis dependendo do método de pagamento original.

Em caso de dúvidas sobre o reembolso, entre em contato conosco.

Agradecemos sua compreensão.

Atenciosamente,
Equipe de Gestão de Pagamentos`;

        break;

      default:
        message = `Olá ${clientName}! 👋

Gostaria de informar sobre sua fatura.

📋 Detalhes da Fatura:
• Valor: R$ ${amount}
• Data de Vencimento: ${dueDate}
• Status: ${invoice.status}

Para mais informações, entre em contato conosco.

Atenciosamente,
Equipe de Gestão de Pagamentos`;
    }

    return message;
  };

  const handleGenerate = async () => {
    setLoading(true);
    setNotification('');

    try {
      // Simular um pequeno delay para mostrar o loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const message = generateLocalNotification(invoice, client);
      setNotification(message);
      
      toast({
        title: 'Notificação Gerada!',
        description: 'A mensagem foi criada com sucesso.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar notificação',
        description: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (notification) {
      navigator.clipboard.writeText(notification);
      toast({
        title: 'Copiado para a área de transferência!',
        description: 'A mensagem de notificação foi copiada.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerador de Notificações Inteligentes</CardTitle>
        <CardDescription>
          Gere lembretes e notificações personalizadas para esta fatura baseadas no status atual.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Gerar Notificação
        </Button>
        <div className="relative">
          <Textarea
            placeholder="A notificação gerada aparecerá aqui..."
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
          Revise a mensagem gerada para precisão antes de enviar.
        </p>
      </CardFooter>
    </Card>
  );
}

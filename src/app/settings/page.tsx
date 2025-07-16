
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Laptop } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Configurações</h1>
      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>
            Personalize a aparência do aplicativo. Selecione o tema que mais lhe
            agrada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Tema</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="w-full justify-start"
              >
                <Sun className="mr-2 h-4 w-4" />
                Claro
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="w-full justify-start"
              >
                <Moon className="mr-2 h-4 w-4" />
                Escuro
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
                className="w-full justify-start"
              >
                <Laptop className="mr-2 h-4 w-4" />
                Sistema
              </Button>
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-2">Notificações</h3>
            <p className="text-sm text-muted-foreground">
              Gerencie suas preferências de notificação (em breve).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Bell, ChevronRight, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MenuItems() {
  return (
    <div className="px-4 flex flex-col gap-3 mb-8">
      {/* Cuenta */}
      <Button
        variant="outline"
        className="w-full flex items-center gap-4 p-4 rounded-2xl backdrop-filter backdrop-blur-sm h-auto justify-start text-left group"
      >
        <div className="flex items-center justify-center rounded-xl bg-primary/10 text-primary w-12 h-12 shrink-0 group-hover:scale-110 transition-transform">
          <User className="w-5 h-5" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-base font-bold truncate">Cuenta</p>
          <p className="text-muted-foreground text-sm truncate">
            Perfil y preferencias basicas
          </p>
        </div>
        <div className="shrink-0 text-muted-foreground">
          <ChevronRight className="w-5 h-5" />
        </div>
      </Button>

      {/* Notificaciones */}
      <Button
        variant="outline"
        className="w-full flex items-center gap-4 p-4 rounded-2xl backdrop-filter backdrop-blur-sm h-auto justify-start text-left group"
      >
        <div className="flex items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-12 h-12 shrink-0 group-hover:scale-110 transition-transform">
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-base font-bold truncate">Notificaciones</p>
          <p className="text-muted-foreground text-sm truncate">
            Email, push y resumenes
          </p>
        </div>
        <div className="shrink-0 text-muted-foreground">
          <ChevronRight className="w-5 h-5" />
        </div>
      </Button>

      {/* Seguridad */}
      <Button
        variant="outline"
        className="w-full flex items-center gap-4 p-4 rounded-2xl backdrop-filter backdrop-blur-sm h-auto justify-start text-left group"
      >
        <div className="flex items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 w-12 h-12 shrink-0 group-hover:scale-110 transition-transform">
          <Shield className="w-5 h-5" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-base font-bold truncate">Seguridad</p>
          <p className="text-muted-foreground text-sm truncate">
            Acceso, sesiones y permisos
          </p>
        </div>
        <div className="shrink-0 text-muted-foreground">
          <ChevronRight className="w-5 h-5" />
        </div>
      </Button>
    </div>
  );
}

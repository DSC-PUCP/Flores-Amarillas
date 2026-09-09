import { useRouteContext } from '@tanstack/react-router';
import { CheckCircle2, Edit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getFallbackAvatar } from '@/lib/utils';

export default function ProfileHeader() {
  const {
    user: { avatar, email, fullName },
  } = useRouteContext({ from: '/_layout/profile/' });

  return (
    <div className="flex flex-col items-center px-6 pt-2 pb-6">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-purple-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-200" />
        <div className="relative">
          <Avatar className="w-28 h-28 border-4 border-white dark:border-[#1e1e2d] shadow-xl">
            <AvatarImage src={avatar} alt={`Portrait of ${fullName}`} />
            <AvatarFallback>{getFallbackAvatar(fullName)}</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-[#1e1e2d] flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>
      <div className="text-center mt-4">
        <h2 className="text-2xl font-bold leading-tight">{fullName}</h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">
          {email}
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
          Equipo y rol
        </p>
      </div>
      <Button className="mt-5 w-full max-w-[200px] h-10 rounded-full shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
        <Edit className="w-4 h-4" />
        Editar perfil
      </Button>
    </div>
  );
}

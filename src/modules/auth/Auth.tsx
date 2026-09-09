import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm } from '@/modules/auth/components/LoginForm';
import { useLogin } from './hooks/useAuth';

export default function Auth() {
  const { mutate, isPending, error } = useLogin();
  return (
    <div className="h-dvh w-full grid place-items-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Bienvenido</CardTitle>
          <CardDescription>
            Ingresa con tu cuenta para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm
            error={error}
            isPending={isPending}
            onSubmit={() => mutate()}
          />
        </CardContent>
      </Card>
    </div>
  );
}

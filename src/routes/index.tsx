import { createFileRoute, redirect } from '@tanstack/react-router';

/*
 * La raiz entra al catalogo, no a la landing.
 *
 * Con la landing delante, buena parte de la gente no llegaba a ver ni un
 * diseno: se quedaba leyendo el argumentario y se iba. Lo que vende aqui es la
 * plantilla, y sobre todo poder ver una desplegada de verdad, asi que la
 * primera pantalla es la de los disenos.
 *
 * `/home` sigue existiendo y se llega desde "Volver al inicio" del catalogo:
 * no se borra nada, solo deja de ser la puerta.
 */
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/template' });
  },
});

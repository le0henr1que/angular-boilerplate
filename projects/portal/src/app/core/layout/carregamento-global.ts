import { computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  Router,
} from '@angular/router';
import { Auth } from '@core/auth/auth';
import { filter, map, take } from 'rxjs';

/**
 * "Hook" do carregamento global: true enquanto o app ainda não tem uma tela inteira para mostrar.
 *
 * Cobre o que o index.html não cobre (o spinner de lá some quando o Angular desenha o App):
 *  - a 1ª navegação, enquanto os gates e o chunk da tela carregam;
 *  - a ida para o login/logout da Microsoft (bff/msal), até o navegador trocar de página.
 *    Sem isso, o cabeçalho aparecia vazio por um instante e "piscava" antes do redirect.
 *
 * Navegações seguintes (já com tela na frente) não usam isto: lá vale o spinner do cabeçalho.
 */
export function injectCarregamentoGlobal() {
  const router = inject(Router);
  const auth = inject(Auth);

  const primeiraTelaPronta = toSignal(
    router.events.pipe(
      filter(
        (evento) =>
          evento instanceof NavigationEnd ||
          evento instanceof NavigationError ||
          evento instanceof NavigationSkipped ||
          // Cancelada por redirect (ex.: gate mandou para /login) = outra navegação vem logo.
          (evento instanceof NavigationCancel &&
            evento.code !== NavigationCancellationCode.Redirect),
      ),
      take(1),
      map(() => true),
    ),
    { initialValue: false },
  );

  return computed(() => !primeiraTelaPronta() || auth.saindoDoApp());
}

import { type NivelLog } from '../log-config';
import { type DestinoLog, type RegistroLog } from '../logger';

const COR: Record<NivelLog, string> = {
  debug: '#6b7280',
  info: '#2563eb',
  warn: '#b45309',
  error: '#dc2626',
};

const METODO: Record<NivelLog, 'debug' | 'info' | 'warn' | 'error'> = {
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
};

/**
 * Escreve no console do navegador.
 * - dev (`comCores`): `12:03:04.123 INFO [http] GET /api/produtos → 200 (812 ms)` colorido;
 * - prod: a mesma linha sem cores, com o prefixo [portal] para filtrar no DevTools.
 *
 * O filtro "Verbose" do DevTools precisa estar ligado para ver o nível debug.
 */
export class ConsoleDestino implements DestinoLog {
  constructor(private readonly comCores: boolean) {}

  registrar(registro: RegistroLog): void {
    const { nivel, contexto, mensagem } = registro;
    const extras = [registro.original ?? registro.erro ?? registro.dados].filter(
      (extra) => extra !== undefined,
    );
    const metodo = METODO[nivel];

    if (this.comCores) {
      const hora = registro.momento.slice(11, 23);
      console[metodo](
        `%c${hora} ${nivel.toUpperCase()} [${contexto}]%c ${mensagem}`,
        `color:${COR[nivel]};font-weight:600`,
        '',
        ...extras,
      );
    } else {
      console[metodo](`[portal] ${nivel.toUpperCase()} [${contexto}] ${mensagem}`, ...extras);
    }
  }
}

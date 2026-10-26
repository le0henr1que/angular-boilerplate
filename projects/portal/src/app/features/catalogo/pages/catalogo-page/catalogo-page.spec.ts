import { TestBed } from '@angular/core/testing';
import { criarQueryClient } from '@core/query/query-client';
import { provideTanStackQuery } from '@tanstack/angular-query-experimental';
import { provideLocalePtBr } from '@testing/locale';
import { provideTestQueryClient } from '@testing/test-query-client';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NEVER, of, throwError } from 'rxjs';
import { CatalogoService } from '../../data-access/catalogo.service';
import { type ItemCatalogo } from '../../models/item-catalogo.model';
import CatalogoPage from './catalogo-page';

const ITENS: ItemCatalogo[] = [
  {
    id: 1,
    nome: 'Banana prata (kg)',
    preco: 7.99,
    categoria: { id: 1, nome: 'Hortifruti' },
    fornecedor: { nome: 'Sítio Bom Fruto', cidade: 'Petrolina' },
    estoque: { quantidade: 120, minimo: 30 },
  },
  {
    id: 2,
    nome: 'Pão de forma integral',
    preco: 12.5,
    categoria: { id: 2, nome: 'Padaria' },
    fornecedor: { nome: 'Trigo Fino', cidade: 'Recife' },
    estoque: { quantidade: 8, minimo: 15 },
  },
];

describe('CatalogoPage', () => {
  const service = { listar: vi.fn() };

  async function abrir() {
    await render(CatalogoPage, {
      providers: [
        provideLocalePtBr(),
        provideTestQueryClient(),
        { provide: CatalogoService, useValue: service },
      ],
    });
  }

  beforeEach(() => service.listar.mockReset().mockReturnValue(of(ITENS)));

  it('mostra os itens do service, lendo os campos aninhados', async () => {
    await abrir();
    await screen.findByText('Banana prata (kg)');
    const linhas = screen.getAllByRole('row');
    expect(linhas).toHaveLength(1 + ITENS.length);

    const celulas = within(linhas[1]).getAllByRole('cell').map((td) => td.textContent?.trim());
    expect(celulas[1]).toBe('Banana prata (kg)');
    expect(celulas[2]).toBe('Hortifruti');
    expect(celulas[3]).toBe('Sítio Bom Fruto (Petrolina)');
    expect(celulas[4]).toMatch(/R\$\s7,99/);
    expect(service.listar).toHaveBeenCalledTimes(1);
  });

  it('marca o estoque abaixo do mínimo', async () => {
    await abrir();
    await screen.findByText('Banana prata (kg)');
    const [, banana, pao] = screen.getAllByRole('row');
    expect(within(banana).queryByText('Baixo')).not.toBeInTheDocument();
    expect(within(pao).getByText('Baixo')).toBeInTheDocument();
  });

  it('mostra o esqueleto enquanto o service não responde', async () => {
    service.listar.mockReturnValue(NEVER);
    await abrir();
    expect(screen.getAllByRole('rowgroup')[1]).toHaveAttribute('aria-busy', 'true');
  });

  it('mostra o erro e tenta de novo', async () => {
    service.listar.mockReturnValueOnce(throwError(() => new Error('falhou')));
    await abrir();
    await userEvent.click(await screen.findByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByText('Banana prata (kg)')).toBeInTheDocument();
    expect(service.listar).toHaveBeenCalledTimes(2);
  });

  it('não chama a API de novo ao sair e voltar para a tela (usa o cache)', async () => {
    const { fixture } = await render(CatalogoPage, {
      providers: [
        provideLocalePtBr(),
        // O QueryClient do app (com staleTime), não o de teste: é ele que define o cache.
        provideTanStackQuery(criarQueryClient()),
        { provide: CatalogoService, useValue: service },
      ],
    });
    await screen.findByText('Banana prata (kg)');
    fixture.destroy(); // saiu da tela

    const deVolta = TestBed.createComponent(CatalogoPage); // mesmo QueryClient do app
    deVolta.detectChanges();
    expect(deVolta.nativeElement).toHaveTextContent('Banana prata (kg)');
    expect(service.listar).toHaveBeenCalledTimes(1);
  });
});

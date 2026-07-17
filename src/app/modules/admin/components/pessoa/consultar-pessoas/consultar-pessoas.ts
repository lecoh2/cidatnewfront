import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';

import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

import {
  Subject,
  finalize,
  switchMap,
  takeUntil
} from 'rxjs';

import { PessoaService } from '../../../../../core/services/pessoa.service';

import { ConsultarPessoaResponse } from '../../../../../core/models/pessoa/consultar-pessoa-response';

import { environment } from '../../../../../../environments/environment.development';

@Component({
  selector: 'app-consultar-pessoas',
  standalone: false,
  templateUrl: './consultar-pessoas.html',
  styleUrl: './consultar-pessoas.css',

  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({
          opacity: 0
        }),

        animate(
          '300ms ease-in',
          style({
            opacity: 1
          })
        )
      ]),

      transition(':leave', [
        animate(
          '300ms ease-out',
          style({
            opacity: 0
          })
        )
      ])
    ])
  ]
})
export class ConsultarPessoas
  implements OnInit, OnDestroy {

  // =========================
  // INJEÇÕES
  // =========================

  private pessoaService = inject(PessoaService);

  private router = inject(Router);

  private cdr = inject(ChangeDetectorRef);

  // =========================
  // CONTROLE RXJS
  // =========================

  private pesquisar$ = new Subject<void>();

  private destruir$ = new Subject<void>();

  // =========================
  // TABELA
  // =========================

  displayedColumns: string[] = [
    'nome',
    'profissao',
    'cpf',
    'rg',
    'telefone',
    'acoes'
  ];

  dataSource =
    new MatTableDataSource<ConsultarPessoaResponse>(
      []
    );

  consulta: ConsultarPessoaResponse[] = [];

  // =========================
  // PAGINAÇÃO
  // =========================

  totalRegistros = 0;

  paginaAtual = 1;

  tamanhoPagina = 10;

  totalPaginas = 1;

  paginasVisiveis: number[] = [];

  // =========================
  // ESTADO
  // =========================

  carregando = false;

  filtro = '';

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];

  tipoPessoaSelecionado:
    'fisica' | 'juridica' = 'fisica';

  urlBase = environment.apiDeslandes;

  // =========================
  // INIT
  // =========================

  ngOnInit(): void {
    this.inicializarPesquisa();

    this.carregarPessoas();
  }

  // =========================
  // DESTROY
  // =========================

  ngOnDestroy(): void {
    this.destruir$.next();

    this.destruir$.complete();

    this.pesquisar$.complete();
  }

  // =========================
  // INICIALIZAR PESQUISA
  // =========================

  private inicializarPesquisa(): void {
    this.pesquisar$
      .pipe(
        takeUntil(this.destruir$),

        switchMap(() => {
          this.carregando = true;

          this.mensagemErro = [];

          this.mensagemSucesso = [];

          const termo =
            this.filtro?.trim() ?? '';

          const request$ =
            this.tipoPessoaSelecionado ===
            'fisica'
              ? this.pessoaService
                  .consultarPessoaFisicaPaginado(
                    this.paginaAtual,
                    this.tamanhoPagina,
                    termo
                  )
              : this.pessoaService
                  .consultarPessoaJuridicaPaginado(
                    this.paginaAtual,
                    this.tamanhoPagina,
                    termo
                  );

          return request$.pipe(
            finalize(() => {
              this.carregando = false;

              this.cdr.detectChanges();
            })
          );
        })
      )
      .subscribe({
        next: response => {
          const itens =
            response?.items ?? [];

          if (
            this.tipoPessoaSelecionado ===
            'fisica'
          ) {
            this.dataSource.data = itens;

            this.consulta = [];
          } else {
            this.consulta = itens;

            this.dataSource.data = [];
          }

          this.totalRegistros =
            response?.totalCount ?? 0;

          this.totalPaginas = Math.max(
            1,
            Math.ceil(
              this.totalRegistros /
              this.tamanhoPagina
            )
          );

          if (
            this.paginaAtual >
            this.totalPaginas
          ) {
            this.paginaAtual =
              this.totalPaginas;
          }

          this.atualizarPaginasVisiveis();

          this.cdr.detectChanges();
        },

        error: () => {
          this.mensagemErro = [
            this.tipoPessoaSelecionado ===
            'fisica'
              ? 'Erro ao consultar pessoas físicas.'
              : 'Erro ao consultar pessoas jurídicas.'
          ];

          this.dataSource.data = [];

          this.consulta = [];

          this.totalRegistros = 0;

          this.totalPaginas = 1;

          this.paginasVisiveis = [1];

          this.cdr.detectChanges();
        }
      });
  }

  // =========================
  // CARREGAR
  // =========================

  carregarPessoas(): void {
    this.pesquisar$.next();
  }

  // =========================
  // FILTRO
  // =========================

  aplicarFiltro(): void {
    this.paginaAtual = 1;

    this.filtro =
      this.filtro?.trim() ?? '';

    this.carregarPessoas();
  }

  limparFiltro(): void {
    this.filtro = '';

    this.paginaAtual = 1;

    this.carregarPessoas();
  }

  // =========================
  // TROCAR TIPO
  // =========================

  onTipoPessoaChange(): void {
    this.dataSource.data = [];

    this.consulta = [];

    this.filtro = '';

    this.paginaAtual = 1;

    this.totalRegistros = 0;

    this.totalPaginas = 1;

    this.paginasVisiveis = [];

    this.mensagemErro = [];

    this.mensagemSucesso = [];

    this.carregarPessoas();
  }

  // =========================
  // PAGINAÇÃO
  // =========================

  irParaPagina(pagina: number): void {
    if (
      pagina < 1 ||
      pagina > this.totalPaginas ||
      pagina === this.paginaAtual
    ) {
      return;
    }

    this.paginaAtual = pagina;

    this.carregarPessoas();
  }

  atualizarPaginasVisiveis(): void {
    const maxVisiveis = 5;

    let inicio = Math.max(
      1,
      this.paginaAtual -
        Math.floor(maxVisiveis / 2)
    );

    let fim = Math.min(
      this.totalPaginas,
      inicio + maxVisiveis - 1
    );

    inicio = Math.max(
      1,
      fim - maxVisiveis + 1
    );

    this.paginasVisiveis =
      Array.from(
        {
          length:
            fim - inicio + 1
        },
        (_, indice) =>
          inicio + indice
      );
  }

  alterarTamanhoPagina(): void {
    this.paginaAtual = 1;

    this.carregarPessoas();
  }

  // =========================
  // NAVEGAÇÃO
  // =========================

  editarPessoaFisica(
    id?: string
  ): void {
    if (!id) {
      this.mensagemErro = [
        'Não foi possível identificar a pessoa física.'
      ];

      return;
    }

    this.router.navigate([
      '/admin/editar-pessoa-fisica',
      id
    ]);
  }

  editarPessoaJuridica(
    id?: string
  ): void {
    if (!id) {
      this.mensagemErro = [
        'Não foi possível identificar a pessoa jurídica.'
      ];

      return;
    }

    this.router.navigate([
      '/admin/editar-pessoa-juridica',
      id
    ]);
  }

  // =========================
  // PERFIL
  // =========================

  getIconPerfil(
    perfil?: number
  ): string {
    switch (perfil) {
      case 1:
        return 'fas fa-user text-primary';

      case 2:
        return 'fas fa-address-book text-success';

      default:
        return 'fas fa-question-circle text-muted';
    }
  }

  getTituloPerfil(
    perfil?: number
  ): string {
    switch (perfil) {
      case 1:
        return 'Cliente';

      case 2:
        return 'Contato';

      default:
        return 'Sem perfil';
    }
  }

  // =========================
  // TELEFONES
  // =========================

  formatarTelefoneArray(
    telefones?: string
  ): string[] {
    if (!telefones) {
      return [];
    }

    return telefones
      .split(';')
      .map(telefone =>
        telefone.trim()
      )
      .filter(telefone =>
        telefone.length > 0
      )
      .map(telefone => {
        const numeros =
          telefone.replace(/\D/g, '');

        if (numeros.length === 11) {
          return numeros.replace(
            /(\d{2})(\d{5})(\d{4})/,
            '($1) $2-$3'
          );
        }

        if (numeros.length === 10) {
          return numeros.replace(
            /(\d{2})(\d{4})(\d{4})/,
            '($1) $2-$3'
          );
        }

        return telefone;
      });
  }

  // =========================
  // CPF
  // =========================

  formatarCpf(
    cpf?: string
  ): string {
    if (!cpf) {
      return '';
    }

    const numeros =
      cpf.replace(/\D/g, '');

    if (numeros.length !== 11) {
      return cpf;
    }

    return numeros.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      '$1.$2.$3-$4'
    );
  }

  // =========================
  // RG
  // =========================

  formatarRg(
    rg?: string
  ): string {
    if (!rg) {
      return '';
    }

    if (
      rg.trim().toUpperCase() ===
      'NADA CONSTA'
    ) {
      return rg;
    }

    const numeros =
      rg.replace(/\D/g, '');

    if (
      numeros.length < 7 ||
      numeros.length > 9
    ) {
      return rg;
    }

    if (numeros.length === 9) {
      return numeros.replace(
        /(\d{2})(\d{3})(\d{3})(\d{1})/,
        '$1.$2.$3-$4'
      );
    }

    if (numeros.length === 8) {
      return numeros.replace(
        /(\d{2})(\d{3})(\d{3})/,
        '$1.$2.$3'
      );
    }

    return rg;
  }

  // =========================
  // CNPJ
  // =========================

  formatarCnpj(
    cnpj?: string
  ): string {
    if (!cnpj) {
      return '';
    }

    const numeros =
      cnpj.replace(/\D/g, '');

    if (numeros.length !== 14) {
      return cnpj;
    }

    return numeros.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    );
  }

  // =========================
  // INSCRIÇÃO ESTADUAL
  // =========================

  formatarInscricaoEstadual(
    inscricao?: string
  ): string {
    if (!inscricao) {
      return '';
    }

    if (
      inscricao.includes('.') ||
      inscricao.includes('-') ||
      inscricao.includes('/')
    ) {
      return inscricao;
    }

    const numeros =
      inscricao.replace(/\D/g, '');

    if (numeros.length === 9) {
      return numeros.replace(
        /(\d{2})(\d{3})(\d{3})(\d{1})/,
        '$1.$2.$3-$4'
      );
    }

    return inscricao;
  }

  // =========================
  // INSCRIÇÃO MUNICIPAL
  // =========================

  formatarInscricaoMunicipal(
    inscricao?: string
  ): string {
    if (!inscricao) {
      return '';
    }

    const numeros =
      inscricao.replace(/\D/g, '');

    if (numeros.length === 7) {
      return numeros.replace(
        /(\d{3})(\d{4})/,
        '$1.$2'
      );
    }

    return inscricao;
  }

  // =========================
  // PLACEHOLDER DO FILTRO
  // =========================

  get placeholderFiltro(): string {
    return this.tipoPessoaSelecionado ===
      'fisica'
      ? 'Pesquisar por nome, CPF, RG ou telefone...'
      : 'Pesquisar por nome, CNPJ, inscrição estadual ou telefone...';
  }
}
declare var bootstrap: any;

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild
} from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import {
  catchError,
  finalize,
  forkJoin,
  of
} from 'rxjs';

import { ProcessoService } from '../../../../../core/services/processo.service';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { EtiquetaService } from '../../../../../core/services/etiqueta.service';
import { HistoricoService } from '../../../../../core/services/historico.service';

import { ConsultarUsuarioResponse } from '../../../../../core/models/usuario/consultar-usuarios.response';
import { UsuarioEstagiarioResponse } from '../../../../../core/models/usuario/usuario-estagiario-response';

import { ConsultarEtiquetaResponse } from '../../../../../core/models/etiqueta/consultar-etiqueta-response';
import { PessoaSelecionada } from '../../../../../core/models/pessoa/pessoa-selecionada';
import { PessoaResumo } from '../../../../../core/models/pessoa/pessoa-resumo';

import { InstanciaEnum } from '../../../../../core/models/enums/intancia/instanciaEnum';
import { AcessoEnum } from '../../../../../core/models/enums/acesso/acesoEnum';
import { TipoEntidadeEnum } from '../../../../../core/models/enums/tipo-entidade/tipo-entidadeEnum';

import { TipoDocumentoProcessoEnum } from '../../../../../core/models/enums/tipo-documento/tipo-documento-processo-enum';

import { ProcessoUpdateRequest } from '../../../../../core/models/processo/processo-update-request';
import { ProcessoLocalPadraoResponse } from '../../../../../core/models/processo/processo-local-padrao-response';
import { ProcessoLocalizacaoResponse } from '../../../../../core/models/processo/processo-localizacao-response';

type DocumentoForm = FormGroup<{
  tipoDocumento: FormControl<TipoDocumentoProcessoEnum | null>;
  numeroDocumento: FormControl<string | null>;
}>;

@Component({
  selector: 'app-editar-processo',
  standalone: false,
  templateUrl: './editar-processo.html',
  styleUrl: './editar-processo.css'
})
export class EditarProcesso implements OnInit {

  @ViewChild('modalHistorico')
  modalHistorico!: ElementRef;
@ViewChild('modalLocalizacoes')
modalLocalizacoes!: ElementRef;
  // =========================
  // INJEÇÕES
  // =========================

  private builder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private processoService = inject(ProcessoService);
  private authHelper = inject(AuthHelper);
  private usuarioService = inject(UsuarioService);
  private pessoaService = inject(PessoaService);
  private etiquetaService = inject(EtiquetaService);
  private historicoService = inject(HistoricoService);
  private cdr = inject(ChangeDetectorRef);

  // =========================
  // ESTADO
  // =========================

  id = '';

  carregando = false;
  carregandoHistorico = false;

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  historico: any[] = [];

  // =========================
  // USUÁRIOS
  // =========================

  responsaveis: ConsultarUsuarioResponse[] = [];

  estagiarios: UsuarioEstagiarioResponse[] = [];

  // =========================
  // ETIQUETAS
  // =========================

  tiposetiquetas: ConsultarEtiquetaResponse[] = [];

  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];

  // =========================
  // PESSOAS
  // =========================

  pessoasSelecionadas: PessoaSelecionada[] = [];
  pessoasFiltradas: PessoaResumo[] = [];

  envolvidosSelecionados: PessoaSelecionada[] = [];
  envolvidosFiltradas: PessoaResumo[] = [];

  // =========================
  // LOCALIZAÇÃO
  // =========================

 localizacoesProcesso: ProcessoLocalizacaoResponse[] = [];

  locais: ProcessoLocalPadraoResponse[] = [];

  // =========================
  // ENUMS
  // =========================

  instanciaEnum = InstanciaEnum;
  acessoEnum = AcessoEnum;

  tiposDocumentos = [
    {
      id: TipoDocumentoProcessoEnum.Parecer,
      nome: 'Parecer'
    },
    {
      id: TipoDocumentoProcessoEnum.Despacho,
      nome: 'Despacho'
    },
    {
      id: TipoDocumentoProcessoEnum.TCE,
      nome: 'TCE'
    },
    {
      id: TipoDocumentoProcessoEnum.Oficio,
      nome: 'Ofício'
    }
  ];

  // =========================
  // FORMULÁRIO
  // =========================

  form = this.builder.group({
    usuarioResponsavelId:
      this.builder.control<string | null>(null),

    estagiarioResponsavelId:
      this.builder.control<string | null>(null),

    titulo:
      this.builder.control<string | null>(null),

    numeroProcesso:
      this.builder.control<string | null>(
        null,
        Validators.required
      ),

    objeto:
      this.builder.control<string | null>(null),

    distribuido:
      this.builder.control<string | null>(null),

    observacao:
      this.builder.control<string | null>(
        null,
        [
          Validators.required,
          Validators.minLength(20)
        ]
      ),

    acesso:
      this.builder.control<number | null>(null),

    tipoProcesso:
      this.builder.control<number | null>(null),

    novaLocalizacao:
      this.builder.control<string | null>(null),

    localizacaoInicialId:
      this.builder.control<string | null>(
        null,
        Validators.required
      ),

    documentos:
      this.builder.array<DocumentoForm>([])
  });

  // =========================
  // GETTERS
  // =========================

  get podeEnviar(): boolean {
    return this.form.valid && !this.carregando;
  }

  get documentos(): FormArray<DocumentoForm> {
    return this.form.controls.documentos;
  }

  // =========================
  // INIT
  // =========================

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.mensagemErro = [
        'Não foi possível identificar o processo.'
      ];

      return;
    }

    this.id = id;

    /*
     * O processo será carregado somente depois que
     * responsáveis, estagiários, etiquetas e locais
     * estiverem disponíveis.
     */
    this.carregarDadosIniciais();
  }

  // =========================
  // DADOS INICIAIS
  // =========================

  private carregarDadosIniciais(): void {
    this.carregando = true;
    this.mensagemErro = [];

    forkJoin({
      usuarios:
        this.usuarioService
          .consultarUsuarioResponsavel()
          .pipe(
            catchError(() =>
              of([] as ConsultarUsuarioResponse[])
            )
          ),

      estagiarios:
        this.usuarioService
          .consultarEstagiarios()
          .pipe(
            catchError(() =>
              of([] as UsuarioEstagiarioResponse[])
            )
          ),

      etiquetas:
        this.etiquetaService
          .consultar()
          .pipe(
            catchError(() =>
              of([] as ConsultarEtiquetaResponse[])
            )
          ),

      localizacoes:
        this.processoService
          .consultarLocais()
          .pipe(
            catchError(() =>
              of([] as ProcessoLocalPadraoResponse[])
            )
          )
    })
      .subscribe({
        next: response => {
          this.responsaveis =
            response.usuarios ?? [];

          this.estagiarios =
            response.estagiarios ?? [];

          this.tiposetiquetas =
            response.etiquetas ?? [];

          this.locais =
            response.localizacoes ?? [];

          this.carregarProcesso();
        },

        error: () => {
          this.mensagemErro = [
            'Erro ao carregar os dados iniciais.'
          ];

          this.carregando = false;
        }
      });
  }

  // =========================
  // CARREGAR PROCESSO
  // =========================

  private carregarProcesso(): void {
    this.processoService
      .ObterProcessoPorId(this.id)
      .pipe(
        finalize(() => {
          this.carregando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          console.log(
            'PROCESSO RECEBIDO:',
            res
          );

          this.localizacoesProcesso =
            res.localizacoes ?? [];

          const localAtual =
            this.localizacoesProcesso
              .slice()
              .sort(
                (a: any, b: any) =>
                  new Date(
                    b.dataCadastro
                  ).getTime() -
                  new Date(
                    a.dataCadastro
                  ).getTime()
              )
              .find(
                (item: any) =>
                  item.atual
              );

          this.form.patchValue(
            {
              usuarioResponsavelId:
                res.usuarioResponsavelId ??
                null,

              estagiarioResponsavelId:
                res.estagiarioResponsavelId ??
                null,

              titulo:
                res.titulo ?? '',

              numeroProcesso:
                res.numeroProcesso ?? '',

              objeto:
                res.objeto ?? '',

              distribuido:
                res.distribuido ?? null,

              observacao:
                res.observacao ?? '',

              acesso:
                res.acesso ?? null,

              tipoProcesso:
                res.tipoProcesso ?? null,

              novaLocalizacao:
                localAtual?.local ?? null,

              /*
               * Caso o backend não retorne
               * localizacaoInicialId, mantém o ID
               * da localização atual.
               */
              localizacaoInicialId:
                res.localizacaoInicialId ??
                localAtual?.id ??
                null
            },
            {
              emitEvent: false
            }
          );

          // CLIENTES
          this.pessoasSelecionadas =
            (
              res.grupoClienteProcesso ??
              []
            ).map((item: any) => ({
              id: item.idPessoa,
              nome: item.nome
            }));

          // ENVOLVIDOS
          this.envolvidosSelecionados =
            (
              res.grupoEnvolvidosProcesso ??
              []
            ).map((item: any) => ({
              id: item.idPessoa,
              nome: item.nome
            }));

          // ETIQUETAS
          this.etiquetasSelecionadas =
            (
              res.grupoEtiquetasProcesso ??
              []
            ).map((item: any) => ({
              id: item.idEtiqueta,
              nome: item.nome,
              cor: item.cor
            }));

          // DOCUMENTOS
          this.documentos.clear();

          const documentosRecebidos =
            res.documentos ?? [];

          documentosRecebidos.forEach(
            (item: any) => {
              this.documentos.push(
                this.criarDocumentoForm(
                  item.tipoDocumento,
                  item.numeroDocumento
                )
              );
            }
          );
        },

        error: () => {
          this.mensagemErro = [
            'Erro ao carregar o processo.'
          ];
        }
      });
  }

  // =========================
  // DOCUMENTOS
  // =========================

  private criarDocumentoForm(
    tipoDocumento:
      TipoDocumentoProcessoEnum | null =
        null,

    numeroDocumento:
      string | null =
        null
  ): DocumentoForm {
    return this.builder.group({
      tipoDocumento:
        this.builder.control<
          TipoDocumentoProcessoEnum | null
        >(
          tipoDocumento,
          Validators.required
        ),

      numeroDocumento:
        this.builder.control<string | null>(
          numeroDocumento,
          [
            Validators.required,
            Validators.maxLength(100)
          ]
        )
    });
  }

  adicionarDocumento(): void {
    this.documentos.push(
      this.criarDocumentoForm()
    );
  }

  removerDocumento(index: number): void {
    if (
      index < 0 ||
      index >= this.documentos.length
    ) {
      return;
    }

    this.documentos.removeAt(index);
  }

  documentoInvalido(
    index: number,
    campo:
      'tipoDocumento' |
      'numeroDocumento'
  ): boolean {
    const controle =
      this.documentos
        .at(index)
        .controls[campo];

    return controle.touched &&
      controle.invalid;
  }

  // =========================
  // BUSCAS
  // =========================

  buscarPessoas(nome: string): void {
    const termo = nome?.trim();

    if (!termo || termo.length < 2) {
      this.pessoasFiltradas = [];
      return;
    }

    this.pessoaService
      .consultarPessoasResumo(termo)
      .pipe(
        catchError(() =>
          of([] as PessoaResumo[])
        )
      )
      .subscribe(response => {
        this.pessoasFiltradas =
          response ?? [];
      });
  }

  buscarEnvolvidos(nome: string): void {
    const termo = nome?.trim();

    if (!termo || termo.length < 2) {
      this.envolvidosFiltradas = [];
      return;
    }

    this.pessoaService
      .consultarPessoasResumo(termo)
      .pipe(
        catchError(() =>
          of([] as PessoaResumo[])
        )
      )
      .subscribe(response => {
        this.envolvidosFiltradas =
          response ?? [];
      });
  }

  // =========================
  // SUBMIT
  // =========================

  onSubmit(): void {
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      this.documentos.controls
        .forEach(documento =>
          documento.markAllAsTouched()
        );

      this.mensagemErro = [
        'Preencha corretamente os campos obrigatórios.'
      ];

      return;
    }

    this.carregando = true;

    const formValue =
      this.form.getRawValue();

    const limpar = <T>(
      valor: T | null | undefined
    ): T | undefined => {
      return valor === null ||
        valor === undefined
          ? undefined
          : valor;
    };

    const documentos =
      formValue.documentos
        .filter(documento =>
          documento.tipoDocumento != null &&
          !!documento.numeroDocumento?.trim()
        )
        .map(documento => ({
          tipoDocumento:
            documento.tipoDocumento!,

          numeroDocumento:
            documento.numeroDocumento!
              .trim()
        }));

    const request: ProcessoUpdateRequest = {
      usuarioResponsavelId:
        limpar(
          formValue.usuarioResponsavelId
        ),

      estagiarioResponsavelId:
        limpar(
          formValue.estagiarioResponsavelId
        ),

      titulo:
        limpar(
          formValue.titulo?.trim()
        ),

      numeroProcesso:
        limpar(
          formValue.numeroProcesso?.trim()
        ),

      objeto:
        limpar(
          formValue.objeto?.trim()
        ),

      distribuido:
        limpar(
          formValue.distribuido
        ),

      observacao:
        limpar(
          formValue.observacao?.trim()
        ),

      acesso:
        limpar(
          formValue.acesso
        ),

      tipoProcesso:
        limpar(
          formValue.tipoProcesso
        ),

      novaLocalizacao:
        limpar(
          formValue.novaLocalizacao
        ),

      localizacaoInicialId:
        limpar(
          formValue.localizacaoInicialId
        ),

      documentos,

      grupoClienteProcesso:
        this.pessoasSelecionadas.map(
          pessoa => ({
            idPessoa: pessoa.id
          })
        ),

      grupoEnvolvidosProcesso:
        this.envolvidosSelecionados.map(
          pessoa => ({
            idPessoa: pessoa.id
          })
        ),

      grupoEtiquetasProcesso:
        this.etiquetasSelecionadas.map(
          etiqueta => ({
            etiquetaId:
              etiqueta.id!
          })
        )
    };

    this.processoService
      .editarProcesso(
        this.id,
        request
      )
      .pipe(
        finalize(() => {
          this.carregando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: any) => {
          this.mensagemErro = [];

          this.mensagemSucesso = [
            response.message
          ];

          this.cdr.detectChanges();

          setTimeout(() => {
            this.router.navigate([
              '/admin/consultar-processo'
            ]);
          }, 3000);
        },

        error: (
          err: HttpErrorResponse
        ) => {
          this.tratarErro(err);
        }
      });
  }

  // =========================
  // NAVEGAÇÃO
  // =========================

  irParaLista(): void {
    this.router.navigate([
      '/admin/consultar-processo'
    ]);
  }

  // =========================
  // ERROS
  // =========================

  private tratarErro(
    err: HttpErrorResponse
  ): void {
    this.mensagemErro = [];

    const response =
      err.error;

    if (response?.errors) {
      for (
        const key in
        response.errors
      ) {
        const erros =
          response.errors[key];

        if (Array.isArray(erros)) {
          this.mensagemErro.push(
            ...erros
          );
        }
      }
    } else if (response?.message) {
      this.mensagemErro.push(
        response.message
      );
    } else if (response?.mensagem) {
      this.mensagemErro.push(
        response.mensagem
      );
    } else {
      this.mensagemErro.push(
        'Erro inesperado ao atualizar o processo.'
      );
    }
  }

  // =========================
  // HISTÓRICO
  // =========================

  abrirHistoricoProcesso(
    processoId: string
  ): void {
    this.carregandoHistorico = true;
    this.historico = [];

    const modal =
      new bootstrap.Modal(
        this.modalHistorico
          .nativeElement
      );

    modal.show();

    this.historicoService
      .ConsultarHistorico(
        TipoEntidadeEnum.Processo,
        processoId
      )
      .subscribe({
        next: response => {
          this.historico =
            (response ?? []).map(
              item => ({
                ...item,

                antes:
                  item.dadosAntes
                    ? JSON.parse(
                        item.dadosAntes
                      )
                    : null,

                depois:
                  item.dadosDepois
                    ? JSON.parse(
                        item.dadosDepois
                      )
                    : null
              })
            );

          this.carregandoHistorico =
            false;

          this.cdr.detectChanges();
        },

        error: error => {
          console.error(error);

          this.carregandoHistorico =
            false;
        }
      });
  }

  formatarValor(
    valor: any,
    campo: string
  ): string {
    if (
      valor === null ||
      valor === undefined
    ) {
      return '-';
    }

    if (Array.isArray(valor)) {
      return valor
        .map(item =>
          this.extrairTexto(item)
        )
        .join(', ');
    }

    if (typeof valor === 'boolean') {
      return valor
        ? 'Sim'
        : 'Não';
    }

    if (
      campo
        .toLowerCase()
        .includes('data')
    ) {
      const data =
        new Date(valor);

      return isNaN(data.getTime())
        ? valor
        : data.toLocaleString(
            'pt-BR'
          );
    }

    if (typeof valor === 'object') {
      return this.extrairTexto(
        valor
      );
    }

    return valor.toString();
  }

  private extrairTexto(
    objeto: any
  ): string {
    if (!objeto) {
      return '-';
    }

    const normalizado =
      this.normalizarObjeto(
        objeto
      );

    return (
      normalizado.local ||
      normalizado.nome ||
      normalizado.descricao ||
      normalizado.titulo ||
      JSON.stringify(objeto)
    );
  }

  private normalizarObjeto(
    objeto: any
  ): any {
    const resultado: any = {};

    Object.keys(objeto)
      .forEach(chave => {
        resultado[
          chave.toLowerCase()
        ] = objeto[chave];
      });

    return resultado;
  }

  formatarCampo(
    campo: string
  ): string {
    const campos: any = {
      titulo: 'Título',
      numeroprocesso:
        'Número do Processo',
      objeto: 'Objeto',
      valorcausa:
        'Valor da Causa',
      valorcondenacao:
        'Valor da Condenação',
      distribuido: 'Distribuído',
      observacao: 'Observação',
      instancia: 'Instância',
      acesso: 'Acesso',
      clientes: 'Clientes',
      envolvidos: 'Envolvidos',
      etiquetas: 'Etiquetas',
      documentos: 'Documentos',
      estagiarioresponsavelid:
        'Estagiário responsável',
      localizacao: 'Localização',
      novalocalizacao:
        'Localização'
    };

    return campos[
      campo.toLowerCase()
    ] || campo;
  }

  getMudancas(
    historico: any
  ): any[] {
    if (!historico?.dadosAntes) {
      return [];
    }

    try {
      const dados =
        JSON.parse(
          historico.dadosAntes
        );

      return Array.isArray(dados)
        ? dados
        : [];
    } catch {
      return [];
    }
  }
  abrirModalLocalizacoes(): void {
  if (!this.localizacoesProcesso?.length) {
    this.mensagemErro = [
      'Nenhuma localização encontrada para este processo.'
    ];

    return;
  }

  const modal = new bootstrap.Modal(
    this.modalLocalizacoes.nativeElement
  );

  modal.show();
}get localizacoesOrdenadas(): any[] {
  return [...(this.localizacoesProcesso ?? [])]
    .sort((a, b) => {
      const dataA = new Date(
        a.dataCadastro ?? 0
      ).getTime();

      const dataB = new Date(
        b.dataCadastro ?? 0
      ).getTime();

      return dataB - dataA;
    });
}
}
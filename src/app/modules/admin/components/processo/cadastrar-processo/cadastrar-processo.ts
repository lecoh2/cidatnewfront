import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import {
  catchError,
  finalize,
  forkJoin,
  of
} from 'rxjs';

import { AuthHelper } from '../../../../../core/helpers/auth.helper';

import { ProcessoService } from '../../../../../core/services/processo.service';

import { PessoaService } from '../../../../../core/services/pessoa.service';

import { UsuarioService } from '../../../../../core/services/usuario.service';

import { EtiquetaService } from '../../../../../core/services/etiqueta.service';

import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';

import { ConsultarUsuarioResponse } from '../../../../../core/models/usuario/consultar-usuarios.response';

import { UsuarioEstagiarioResponse } from '../../../../../core/models/usuario/usuario-estagiario-response';

import { ConsultarEtiquetaResponse } from '../../../../../core/models/etiqueta/consultar-etiqueta-response';

import { PessoaResumo } from '../../../../../core/models/pessoa/pessoa-resumo';

import { PessoaSelecionada } from '../../../../../core/models/pessoa/pessoa-selecionada';

import { InstanciaEnum } from '../../../../../core/models/enums/intancia/instanciaEnum';

import { AcessoEnum } from '../../../../../core/models/enums/acesso/acesoEnum';

import { ProcessoLocalPadraoResponse } from '../../../../../core/models/processo/processo-local-padrao-response';

import { TipoDocumentoProcessoEnum } from '../../../../../core/models/enums/tipo-documento/tipo-documento-processo-enum';

@Component({
  selector: 'app-cadastrar-processo',
  standalone: false,
  templateUrl: './cadastrar-processo.html',
  styleUrl: './cadastrar-processo.css'
})
export class CadastrarProcesso implements OnInit {

  // =========================
  // INJEÇÕES
  // =========================

  private builder = inject(FormBuilder);

  private router = inject(Router);

  private processoService = inject(ProcessoService);

  private authHelper = inject(AuthHelper);

  private usuarioService = inject(UsuarioService);

  private pessoaService = inject(PessoaService);

  private etiquetaService = inject(EtiquetaService);

  // =========================
  // ESTADO
  // =========================

  usuarioLogado?: AutenticarUsuarioResponse | null;

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];

  carregando = false;

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
  // CLIENTES
  // =========================

  pessoasSelecionadas: PessoaSelecionada[] = [];

  pessoasFiltradas: PessoaResumo[] = [];

  // =========================
  // ENVOLVIDOS
  // =========================

  envolvidosSelecionados: PessoaSelecionada[] = [];

  envolvidosFiltradas: PessoaResumo[] = [];

  // =========================
  // ENUMS
  // =========================

  instanciaEnum = InstanciaEnum;

  acessoEnum = AcessoEnum;

  tipoDocumentoEnum = TipoDocumentoProcessoEnum;

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
  // LOCALIZAÇÕES
  // =========================

  locais: ProcessoLocalPadraoResponse[] = [];

  // =========================
  // FORMULÁRIO
  // =========================

  form = this.builder.group({
    idUsuario:
      this.builder.control<string | null>(null),

    usuarioResponsavelId:
      this.builder.control<string | null>(null),

    estagiarioResponsavelId:
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

    valorCondenacao:
      this.builder.control<number | null>(null),

    observacao:
      this.builder.control<string | null>(
        null,
        [
          Validators.required,
          Validators.minLength(20)
        ]
      ),

    tipoProcesso:
      this.builder.control<number | null>(null),

    localizacaoInicialId:
      this.builder.control<string | null>(
        null,
        Validators.required
      ),

    documentos:
      this.builder.array<FormGroup>([])
  });

  // =========================
  // GETTERS
  // =========================

  get podeEnviar(): boolean {
    return this.form.valid &&
      !this.carregando;
  }

  get documentos(): FormArray<FormGroup> {
    return this.form.get(
      'documentos'
    ) as FormArray<FormGroup>;
  }

  // =========================
  // INIT
  // =========================

  ngOnInit(): void {
    this.usuarioLogado =
      this.authHelper.get();

    if (this.usuarioLogado?.idUsuario) {
      this.form
        .get('idUsuario')
        ?.setValue(
          this.usuarioLogado.idUsuario
        );
    }

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
      .pipe(
        finalize(() => {
          this.carregando = false;
        })
      )
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
        },

        error: () => {
          this.mensagemErro = [
            'Erro ao carregar os dados iniciais.'
          ];
        }
      });
  }

  // =========================
  // DOCUMENTOS
  // =========================

  adicionarDocumento(): void {
    const documento =
      this.builder.group({
        tipoDocumento:
          this.builder.control<
            TipoDocumentoProcessoEnum | null
          >(
            null,
            Validators.required
          ),

        numeroDocumento:
          this.builder.control<string | null>(
            null,
            [
              Validators.required,
              Validators.maxLength(100)
            ]
          )
      });

    this.documentos.push(documento);
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
    campo: string
  ): boolean {
    const controle =
      this.documentos
        .at(index)
        .get(campo);

    return !!controle?.touched &&
      !!controle?.invalid;
  }

  // =========================
  // BUSCAR PESSOAS
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

  // =========================
  // BUSCAR ENVOLVIDOS
  // =========================

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
    ?.filter(documento =>
      documento['tipoDocumento'] != null &&
      !!documento['numeroDocumento']?.trim()
    )
    .map(documento => ({
      tipoDocumento:
        documento['tipoDocumento']!,

      numeroDocumento:
        documento['numeroDocumento']!
          .trim()
    })) ?? [];

    const request = {
      usuarioResponsavelId:
        limpar(
          formValue.usuarioResponsavelId
        ),

      estagiarioResponsavelId:
        limpar(
          formValue.estagiarioResponsavelId
        ),

      numeroProcesso:
        limpar(
          formValue.numeroProcesso
            ?.trim()
        ),

      objeto:
        limpar(
          formValue.objeto?.trim()
        ),

      distribuido:
        limpar(
          formValue.distribuido
        ),

      valorCondenacao:
        limpar(
          formValue.valorCondenacao
        ),

      observacao:
        limpar(
          formValue.observacao?.trim()
        ),

      localizacaoInicialId:
        limpar(
          formValue.localizacaoInicialId
        ),

      tipoProcesso:
        limpar(
          formValue.tipoProcesso
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
            etiquetaId: etiqueta.id!
          })
        )
    };

    this.processoService
      .cadastrarProcesso(request)
      .pipe(
        finalize(() => {
          this.carregando = false;
        })
      )
      .subscribe({
        next: response => {
          this.mensagemErro = [];

          this.mensagemSucesso = [
            response.message
          ];

          this.resetarFormulario();
        },

        error: (
          err: HttpErrorResponse
        ) => {
          this.tratarErro(err);
        }
      });
  }

  // =========================
  // ETIQUETAS
  // =========================

  selecionarEtiqueta(
    etiqueta: ConsultarEtiquetaResponse
  ): void {
    const jaSelecionada =
      this.etiquetasSelecionadas.some(
        item =>
          item.id === etiqueta.id
      );

    if (jaSelecionada) {
      this.mensagemErro = [
        'Etiqueta já selecionada.'
      ];

      return;
    }

    this.etiquetasSelecionadas.push(
      etiqueta
    );
  }

  removerEtiqueta(
    etiqueta: ConsultarEtiquetaResponse
  ): void {
    this.etiquetasSelecionadas =
      this.etiquetasSelecionadas.filter(
        item =>
          item.id !== etiqueta.id
      );
  }

  // =========================
  // RESET
  // =========================

  private resetarFormulario(): void {
    this.form.reset({
      idUsuario:
        this.usuarioLogado
          ?.idUsuario ??
        null,

      usuarioResponsavelId: null,

      estagiarioResponsavelId: null,

      numeroProcesso: null,

      objeto: null,

      distribuido: null,

      valorCondenacao: null,

      observacao: null,

      tipoProcesso: null,

      localizacaoInicialId: null
    });

    this.documentos.clear();

    this.pessoasSelecionadas = [];

    this.envolvidosSelecionados = [];

    this.etiquetasSelecionadas = [];

    this.pessoasFiltradas = [];

    this.envolvidosFiltradas = [];
  }

  // =========================
  // ERROS
  // =========================

  private tratarErro(
    err: HttpErrorResponse
  ): void {
    this.mensagemErro = [];

    const errorResponse =
      err.error;

    if (errorResponse?.errors) {
      for (
        const key in
        errorResponse.errors
      ) {
        const erros =
          errorResponse.errors[key];

        if (Array.isArray(erros)) {
          this.mensagemErro.push(
            ...erros
          );
        }
      }
    } else if (
      errorResponse?.message
    ) {
      this.mensagemErro.push(
        errorResponse.message
      );
    } else if (
      errorResponse?.mensagem
    ) {
      this.mensagemErro.push(
        errorResponse.mensagem
      );
    } else {
      this.mensagemErro.push(
        'Erro inesperado ao cadastrar o processo.'
      );
    }
  }
}
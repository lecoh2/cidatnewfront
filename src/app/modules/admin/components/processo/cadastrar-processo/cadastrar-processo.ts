import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { ProcessoService } from '../../../../../core/services/processo.service';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { VaraService } from '../../../../../core/services/vara.service';
import { ConsultarVaraResponse } from '../../../../../core/models/vara/consultar-vara-response';
import { AcaoService } from '../../../../../core/services/acao.service';
import { ConsultarAcaoResponse } from '../../../../../core/models/acao/consultar-acao-response';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { ConsultarUsuarioResponse } from '../../../../../core/models/usuario/consultar-usuarios.response';
import { ConsultarEtiquetaResponse } from '../../../../../core/models/etiqueta/consultar-etiqueta-response';
import { PessoaResumo } from '../../../../../core/models/pessoa/pessoa-resumo';
import { PessoaSelecionada } from '../../../../../core/models/pessoa/pessoa-selecionada';
import { QualificacoesService } from '../../../../../core/services/qualificacoes.service';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { QualificacaoResponse } from '../../../../../core/models/qualificacao/qualificacao-response';

import { catchError, forkJoin, of } from 'rxjs';
import { EtiquetaService } from '../../../../../core/services/etiqueta.service';
import { InstanciaEnum } from '../../../../../core/models/enums/intancia/instanciaEnum';
import { AcessoEnum } from '../../../../../core/models/enums/acesso/acesoEnum';
import { validate } from '@angular/forms/signals';
import { ProcessoLocalPadraoResponse } from '../../../../../core/models/processo/processo-local-padrao-response';
@Component({
  selector: 'app-cadastrar-processo',
  standalone: false,
  templateUrl: './cadastrar-processo.html',
  styleUrl: './cadastrar-processo.css',
})
export class CadastrarProcesso implements OnInit {

  // ================== INJEÇÕES ==================
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private processoService = inject(ProcessoService);
  private authHelper = inject(AuthHelper);
  private varaService = inject(VaraService);
  private acaoService = inject(AcaoService);
  private usuarioService = inject(UsuarioService);
  private pessoaService = inject(PessoaService);
  private qualificacaoService = inject(QualificacoesService);
  private etiquetaService = inject(EtiquetaService);

  // ================== ESTADO ==================
  usuarioLogado?: AutenticarUsuarioResponse | null;
  varasFiltradas: ConsultarVaraResponse[] = [];
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;

  foros: { id: string, nome: string }[] = [];
  varas: ConsultarVaraResponse[] = [];
  acoes: ConsultarAcaoResponse[] = [];
  responsaveis: ConsultarUsuarioResponse[] = [];
  qualificacoes: QualificacaoResponse[] = [];

  tiposetiquetas: ConsultarEtiquetaResponse[] = [];
  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];

  pessoasSelecionadas: PessoaSelecionada[] = [];
  pessoasFiltradas: PessoaResumo[] = [];

  envolvidosSelecionados: PessoaSelecionada[] = [];
  envolvidosFiltradas: PessoaResumo[] = [];

  instanciaEnum = InstanciaEnum;
  acessoEnum = AcessoEnum;
locais: ProcessoLocalPadraoResponse[] = [];
  // ================== FORM ==================
 form = this.builder.group({
  idUsuario: [''],
  acaoId: this.builder.control<string | null>(null),
  foroId: [null],
  varaId: [null],
  usuarioResponsavelId: this.builder.control<string | null>(null),

  juizo: [''],
  pasta: [''],
  titulo: [''],
  numeroProcesso: ['', Validators.required],
  linkTribunal: [''],
  objeto: [''],

  valorCausa: [null],
  distribuido: [null],
  valorCondenacao: [null],

  observacao: ['', [Validators.maxLength(20)]],

  instancia: [null],
  acesso: [null],

  // FALTAVAM
  tipoProcesso: [null],

  localizacaoInicialId: ['', Validators.required]
});

  // ================== INIT ==================
  ngOnInit(): void {
    this.carregando = false;

    this.usuarioLogado = this.authHelper.get();

    if (this.usuarioLogado) {
      this.form.get('idUsuario')?.setValue(this.usuarioLogado.idUsuario ?? null);
    }

    this.form.get('acaoId')?.valueChanges.subscribe(v => {
      console.log('🔥 acaoId mudou:', v);
    });

    this.form.get('usuarioResponsavelId')?.valueChanges.subscribe(v => {
      console.log('🔥 usuarioResponsavelId mudou:', v);
    });

    this.carregarDadosIniciais();

    this.form.get('foroId')?.valueChanges.subscribe(foroId => {

      if (!foroId) {
        this.varasFiltradas = this.varas;
        return;
      }

      this.varasFiltradas = this.varas.filter(v => v.foroId === foroId);
      this.form.get('varaId')?.setValue(null);
    });
  }

  // ================== JUÍZO ==================
  get juizoFormatado(): string {
    const varaId = this.form.value.varaId;

    if (!varaId) return '';

    const vara = this.varas.find(v => v.id === varaId);

    if (!vara) return '';

    return `${vara.nomeVara} - ${vara.nomeForo}`;
  }

  // ================== DADOS INICIAIS ==================
  private carregarDadosIniciais() {

    this.carregando = false;
    this.mensagemErro = [];

    forkJoin({
      varas: this.varaService.consultar(),
      acoes: this.acaoService.consultar(),
      usuarios: this.usuarioService.consultarUsuarioResponsavel(),
      qualificacoes: this.qualificacaoService.consultarQualificacoes(),
      etiquetas: this.etiquetaService.consultar(),
       localizacoes: this.processoService.consultarLocais()
    }).subscribe({
      next: (res) => {

    const {varas,
 acoes,
  usuarios,
  qualificacoes,
  etiquetas,
  localizacoes
} = res;

        this.varas = varas;
        this.varasFiltradas = varas;

        const mapa = new Map<string, string>();
        varas.forEach(v => {
          if (v.foroId && v.nomeForo) {
            mapa.set(v.foroId, v.nomeForo);
          }
        });

        this.foros = Array.from(mapa, ([id, nome]) => ({ id, nome }));

        this.acoes = acoes;
        this.responsaveis = usuarios;
        this.qualificacoes = qualificacoes;
        this.tiposetiquetas = etiquetas;
       this.locais = localizacoes;
      },
      error: () => {
        this.mensagemErro = ['Erro ao carregar dados iniciais'];
      },
      complete: () => {
        this.carregando = false;
      }
    });
  }

  // ================== BUSCAS ==================
  buscarPessoas(nome: string) {
    this.pessoaService.consultarPessoasResumo(nome)
      .pipe(catchError(() => of([])))
      .subscribe(res => this.pessoasFiltradas = res);
  }

  buscarEnvolvidos(nome: string) {
    this.pessoaService.consultarPessoasResumo(nome)
      .pipe(catchError(() => of([])))
      .subscribe(res => this.envolvidosFiltradas = res);
  }

  // ================== SUBMIT ==================
  onSubmit(): void {

    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

   // if (this.pessoasSelecionadas.some(p => !p.idQualificacao)) {
   //   this.mensagemErro = ['Selecione a qualificação para todos os clientes.'];
  //    return;
  //  }

   // if (this.envolvidosSelecionados.some(e => !e.idQualificacao)) {
    //  this.mensagemErro = ['Selecione a qualificação para todos os envolvidos.'];
   //   return;
  //  }

    this.carregando = true;

    const formValue = this.form.value;
    const limpar = (v: any) => v ?? undefined;

    const request = {
      acaoId: limpar(formValue.acaoId),
      varaId: formValue.varaId!,
      usuarioResponsavelId: limpar(formValue.usuarioResponsavelId),
      juizo: limpar(formValue.juizo),
      pasta: limpar(formValue.pasta),
      titulo: limpar(formValue.titulo),
      numeroProcesso: limpar(formValue.numeroProcesso),
      linkTribunal: limpar(formValue.linkTribunal),
      objeto: limpar(formValue.objeto),
      valorCausa: limpar(formValue.valorCausa),
      distribuido: limpar(formValue.distribuido),
      valorCondenacao: limpar(formValue.valorCondenacao),
      observacao: limpar(formValue.observacao),
      instancia: limpar(formValue.instancia),
      acesso: limpar(formValue.acesso),
  localizacaoInicialId: limpar(formValue.localizacaoInicialId),

      grupoClienteProcesso: this.pessoasSelecionadas.map(p => ({
        idPessoa: p.id,
        idQualificacao: p.idQualificacao ?? undefined
      })),

      grupoEnvolvidosProcesso: this.envolvidosSelecionados.map(e => ({
        idPessoa: e.id,
        idQualificacao: e.idQualificacao ?? undefined
      })),

      grupoEtiquetasProcesso: this.etiquetasSelecionadas.map(e => ({
        etiquetaId: e.id!
      }))
    };

    this.processoService.cadastrarProcesso(request).subscribe({
      next: (response) => {
        this.resetarFormulario();
        this.carregando = false;
        this.mensagemSucesso = [response?.message];
      },
      error: (err: HttpErrorResponse) => this.tratarErro(err)
    });
  }

  // ================== ETIQUETAS ==================
  selecionarEtiqueta(etiqueta: ConsultarEtiquetaResponse) {
    if (this.etiquetasSelecionadas.some(e => e.id === etiqueta.id)) {
      this.mensagemErro = ['Etiqueta já selecionada.'];
      return;
    }

    this.etiquetasSelecionadas.push(etiqueta);
  }

  removerEtiqueta(etiqueta: ConsultarEtiquetaResponse) {
    this.etiquetasSelecionadas =
      this.etiquetasSelecionadas.filter(e => e.id !== etiqueta.id);
  }

  // ================== RESET ==================
  private resetarFormulario() {
    this.form.reset();
    this.pessoasSelecionadas = [];
    this.envolvidosSelecionados = [];
    this.etiquetasSelecionadas = [];

    if (this.usuarioLogado) {
      this.form.get('idUsuario')?.setValue(this.usuarioLogado.idUsuario ?? null);
    }
  }

  // ================== ERROS ==================
 private tratarErro(err: HttpErrorResponse): void {

  this.mensagemErro = [];

  const errorResponse = err.error;

  if (errorResponse?.errors) {
    for (const key in errorResponse.errors) {
      this.mensagemErro.push(...errorResponse.errors[key]);
    }
  } 
  else if (errorResponse?.message) {   // 🔥 AQUI
    this.mensagemErro.push(errorResponse.message);
  } 
  else {
    this.mensagemErro.push('Erro inesperado.');
  }

  this.carregando = false;
}
}

declare var bootstrap: any;
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { ProcessoService } from "../../../../../core/services/processo.service";
import { AuthHelper } from "../../../../../core/helpers/auth.helper";
import { VaraService } from "../../../../../core/services/vara.service";
import { UsuarioService } from "../../../../../core/services/usuario.service";
import { AcaoService } from "../../../../../core/services/acao.service";
import { PessoaService } from "../../../../../core/services/pessoa.service";
import { QualificacoesService } from "../../../../../core/services/qualificacoes.service";
import { EtiquetaService } from "../../../../../core/services/etiqueta.service";
import { inject, OnInit } from "@angular/core";
import { InstanciaEnum } from "../../../../../core/models/enums/intancia/instanciaEnum";
import { AcessoEnum } from "../../../../../core/models/enums/acesso/acesoEnum";
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, catchError, of } from 'rxjs';
import { ConsultarVaraResponse } from '../../../../../core/models/vara/consultar-vara-response';
import { ConsultarAcaoResponse } from '../../../../../core/models/acao/consultar-acao-response';
import { ConsultarUsuarioResponse } from '../../../../../core/models/usuario/consultar-usuarios.response';
import { QualificacaoResponse } from '../../../../../core/models/qualificacao/qualificacao-response';
import { ConsultarEtiquetaResponse } from '../../../../../core/models/etiqueta/consultar-etiqueta-response';
import { PessoaSelecionada } from '../../../../../core/models/pessoa/pessoa-selecionada';
import { PessoaResumo } from '../../../../../core/models/pessoa/pessoa-resumo';
import { HistoricoService } from '../../../../../core/services/historico.service';
import { TipoEntidadeEnum } from '../../../../../core/models/enums/tipo-entidade/tipo-entidadeEnum';
import { ProcessoUpdateRequest } from '../../../../../core/models/processo/processo-update-request';
import { ProcessoLocalPadraoResponse } from '../../../../../core/models/processo/processo-local-padrao-response';


@Component({
  selector: 'app-editar-processo',
  standalone: false,
  templateUrl: './editar-processo.html',
  styleUrl: './editar-processo.css',
})


export class EditarProcesso implements OnInit {
  @ViewChild('modalHistorico')
  modalHistorico!: ElementRef;
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private processoService = inject(ProcessoService);
  private authHelper = inject(AuthHelper);
  private varaService = inject(VaraService);
  private acaoService = inject(AcaoService);
  private usuarioService = inject(UsuarioService);
  private pessoaService = inject(PessoaService);
  private qualificacaoService = inject(QualificacoesService);
  private etiquetaService = inject(EtiquetaService);
  private historicoService = inject(HistoricoService);
  private cdr = inject(ChangeDetectorRef);
  historico: any[] = [];
  carregandoHistorico = false;
  id!: string;

  carregando = false;
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  foros: { id: string, nome: string }[] = [];

  varas: ConsultarVaraResponse[] = [];
  varasFiltradas: ConsultarVaraResponse[] = [];

  acoes: ConsultarAcaoResponse[] = [];

  responsaveis: ConsultarUsuarioResponse[] = [];
  qualificacoes: QualificacaoResponse[] = [];

  tiposetiquetas: ConsultarEtiquetaResponse[] = [];
  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];

  //  AGORA PADRONIZADO
  pessoasSelecionadas: PessoaSelecionada[] = [];
  pessoasFiltradas: PessoaResumo[] = [];

  envolvidosSelecionados: PessoaSelecionada[] = [];
  envolvidosFiltradas: PessoaResumo[] = [];

  instanciaEnum = InstanciaEnum;
  acessoEnum = AcessoEnum;
  localizacoesProcesso: any[] = [];
locais: ProcessoLocalPadraoResponse[] = [];
  form = this.builder.group({
    acaoId: [null],
    foroId: [null],
    varaId: [null, Validators.required],
    usuarioResponsavelId: [null],
    juizo: [''],
    pasta: [''],
    titulo: [''],
    numeroProcesso: [''],
    linkTribunal: [''],
    objeto: [''],
    valorCausa: [null],
    distribuido: [null],
    valorCondenacao: [null],
    observacao: [''],
    instancia: [null],
    acesso: [null],
      tipoProcesso: [null],
    novaLocalizacao: [''],
    localizacaoInicialId: [null, Validators.required]
  });
  private carregarDadosIniciais() {
    this.carregando = true;
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
console.log('🔥 PROCESSO BACKEND:', res);
        const { varas, acoes, usuarios, qualificacoes, etiquetas, localizacoes   } = res as {
          varas: ConsultarVaraResponse[];
          acoes: ConsultarAcaoResponse[];
          usuarios: ConsultarUsuarioResponse[];
          qualificacoes: QualificacaoResponse[];
          etiquetas: ConsultarEtiquetaResponse[];
          localizacoes: ProcessoLocalPadraoResponse[];
          
        };

        // 🔥 VARAS + FOROS
        this.varas = varas;
        this.varasFiltradas = varas;
this.locais = localizacoes;
        const mapa = new Map<string, string>();
        varas.forEach(v => {
          if (v.foroId && v.nomeForo) {
            mapa.set(v.foroId, v.nomeForo);
          }
        });

        this.foros = Array.from(mapa, ([id, nome]) => ({ id, nome }));

        // 🔥 OUTROS DADOS
        this.acoes = acoes;
        this.responsaveis = usuarios;
        this.qualificacoes = qualificacoes;
        this.tiposetiquetas = etiquetas;
        this.locais = localizacoes;

        // 🔥 IMPORTANTE (somente no EDITAR)
        if (this.id) {
          this.carregarProcesso();
        }
      },
      error: () => {
        this.mensagemErro = ['Erro ao carregar dados iniciais'];
        this.carregando = false;
      },
      complete: () => {
        this.carregando = false;
      }
    });
  } irParaLista(): void {
    this.router.navigate(['/admin/consultar-processo']);
  }
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
  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;

    this.carregarDadosIniciais();
    this.carregarProcesso();

    this.form.get('foroId')?.valueChanges.subscribe(foroId => {
      if (!foroId) {
        this.varasFiltradas = this.varas;
        return;
      }

      this.varasFiltradas = this.varas.filter(v => v.foroId === foroId);
      this.form.get('varaId')?.setValue(null);
    });
  }
  get juizoFormatado(): string {
    const varaId = this.form.value.varaId;

    if (!varaId) return '';

    const vara = this.varas.find(v => v.id === varaId);

    if (!vara) return '';

    return `${vara.nomeVara} - ${vara.nomeForo}`;
  }
  // ================= CARREGAR PROCESSO =================
  private carregarProcesso() {
    this.carregando = true;

    this.processoService.ObterProcessoPorId(this.id).subscribe({
      next: (res: any) => {
        console.log('🔥 PROCESSO BACKEND:', res); // 👈 AQUI
const atual = res.localizacoes
  ?.slice()
  .sort((a: any, b: any) => new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime())
  .find((x: any) => x.atual);
        // FORM
        this.form.patchValue({
          acaoId: res.acaoId,
          varaId: res.varaId,
          foroId: res.foroId,
          usuarioResponsavelId: res.usuarioResponsavelId,
          juizo: res.juizo,
          pasta: res.pasta,
          titulo: res.titulo,
          numeroProcesso: res.numeroProcesso,
          linkTribunal: res.linkTribunal,
          objeto: res.objeto,
          valorCausa: res.valorCausa,
          distribuido: res.distribuido,
          valorCondenacao: res.valorCondenacao,
          observacao: res.observacao,
          instancia: res.instancia,
          acesso: res.acesso,
      tipoProcesso: res.tipoProcesso,
  novaLocalizacao: atual?.local ?? null,
  localizacaoInicialId: atual?.id ?? null
        }, { emitEvent: false });

        // CLIENTES
        this.pessoasSelecionadas = (res.grupoClienteProcesso ?? []).map((c: any) => ({
          id: c.idPessoa,
          nome: c.nome,
          idQualificacao: c.qualificacaoId
        }));

        // ENVOLVIDOS
        this.envolvidosSelecionados = (res.grupoEnvolvidosProcesso ?? []).map((e: any) => ({
          id: e.idPessoa,
          nome: e.nome,
          idQualificacao: e.qualificacaoId
        }));

        // ETIQUETAS
        this.etiquetasSelecionadas = (res.grupoEtiquetasProcesso ?? []).map((e: any) => ({
          id: e.idEtiqueta,
          nome: e.nome,
          cor: e.cor
        }));

        this.carregando = false;
      },
      error: () => {
        this.mensagemErro = ['Erro ao carregar processo'];
        this.carregando = false;
      }
    });
  }
  onSubmit(): void {
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.pessoasSelecionadas.some(p => !p.idQualificacao)) {
      this.mensagemErro = ['Selecione a qualificação para todos os clientes.'];
      return;
    }

    if (this.envolvidosSelecionados.some(e => !e.idQualificacao)) {
      this.mensagemErro = ['Selecione a qualificação para todos os envolvidos.'];
      return;
    }

    this.carregando = true;

    const f = this.form.value;
    const limpar = (v: any) => v ?? undefined;

    const request: ProcessoUpdateRequest = {
      acaoId: limpar(f.acaoId),
      varaId: f.varaId!,
      usuarioResponsavelId: limpar(f.usuarioResponsavelId),
      juizo: limpar(f.juizo),
      pasta: limpar(f.pasta),
      titulo: limpar(f.titulo),
      numeroProcesso: limpar(f.numeroProcesso),
      linkTribunal: limpar(f.linkTribunal),
      objeto: limpar(f.objeto),
      valorCausa: limpar(f.valorCausa),
      distribuido: limpar(f.distribuido),
      valorCondenacao: limpar(f.valorCondenacao),
      observacao: limpar(f.observacao),
      instancia: limpar(f.instancia),
      acesso: limpar(f.acesso),
      tipoProcesso:limpar(f.tipoProcesso),
      novaLocalizacao: limpar(f.novaLocalizacao),
      localizacaoInicialId: limpar(f.localizacaoInicialId),
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

    this.processoService.editarProcesso(this.id, request).subscribe({
      next: (res: any) => {
        this.carregando = false;

        this.mensagemSucesso = [
          res.message ?? 'Processo atualizado com sucesso'
        ];

        this.cdr.detectChanges(); // 👈 força render

        setTimeout(() => {
          this.router.navigate(['/admin/consultar-processo']);
        }, 3000);
      },
      error: (err) => this.tratarErro(err)
    });
  }
  private tratarErro(err: HttpErrorResponse) {
    this.mensagemErro = [];

    const e = err.error;

    if (e?.errors) {
      for (const key in e.errors) {
        this.mensagemErro.push(...e.errors[key]);
      }
    } else if (e?.mensagem) {
      this.mensagemErro.push(e.mensagem);
    } else {
      this.mensagemErro.push('Erro inesperado.');
    }

    this.carregando = false;
  }

abrirHistoricoProcesso(processoId: string) {

  this.carregandoHistorico = true;

  this.historico = [];

  const modal =
    new bootstrap.Modal(
      this.modalHistorico.nativeElement
    );

  modal.show();

  this.historicoService
    .ConsultarHistorico(
      TipoEntidadeEnum.Processo, // ✅ CORRETO
      processoId
    )
    .subscribe({

      next: (res) => {

        this.historico = (res ?? []).map(h => ({
          ...h,
          antes: h.dadosAntes
            ? JSON.parse(h.dadosAntes)
            : null,

          depois: h.dadosDepois
            ? JSON.parse(h.dadosDepois)
            : null
        }));

        console.log('🔥 HISTORICO:', this.historico);

        this.carregandoHistorico = false;

        this.cdr.detectChanges();
      },

      error: (err) => {

        console.error(err);

        this.carregandoHistorico = false;
      }

    });
}



 formatarValor(valor: any, campo: string): string {

  if (valor === null || valor === undefined) return '-';

  // ARRAY
  if (Array.isArray(valor)) {
    return valor.map(v => this.extrairTexto(v)).join(', ');
  }

  // BOOLEAN
  if (typeof valor === 'boolean') {
    return valor ? 'Sim' : 'Não';
  }

  // DATA
 if (campo.toLowerCase().includes('data')) {
  const d = new Date(valor);
  return isNaN(d.getTime()) ? valor : d.toLocaleString('pt-BR');
}

  // OBJETO
  if (typeof valor === 'object') {
    return this.extrairTexto(valor);
  }

  return valor.toString();
}
private extrairTexto(obj: any): string {
  if (!obj) return '-';

  const normalizado = this.normalizarObjeto(obj);

  return (
    normalizado.local ||
    normalizado.nome ||
    normalizado.descricao ||
    normalizado.titulo ||
    JSON.stringify(obj)
  );
}
private normalizarObjeto(obj: any): any {
  const resultado: any = {};

  Object.keys(obj).forEach(key => {
    resultado[key.toLowerCase()] = obj[key];
  });

  return resultado;
}
formatarCampo(campo: string): string {

  const map: any = {
    titulo: 'Título',
    pasta: 'Pasta',
    numeroprocesso: 'Número do Processo',
    linktribunal: 'Link Tribunal',
    objeto: 'Objeto',
    valorcausa: 'Valor da Causa',
    valorcondenacao: 'Valor da Condenação',
    distribuido: 'Distribuído',
    observacao: 'Observação',
    instancia: 'Instância',
    acesso: 'Acesso',
    clientes: 'Clientes',
    envolvidos: 'Envolvidos',
    etiquetas: 'Etiquetas',
  localizacao: 'Localização',
novaLocalizacao: 'Localização'
  };

  return map[campo.toLowerCase()] || campo;
} getMudancas(h: any): any[] {

  if (!h?.dadosAntes)
    return [];

  try {

    const dados = JSON.parse(h.dadosAntes);

    return Array.isArray(dados)
      ? dados
      : [];

  } catch {

    return [];
  }
}
}

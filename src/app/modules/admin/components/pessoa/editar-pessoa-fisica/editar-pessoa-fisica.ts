import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { PessoaService } from '../../../../../core/services/pessoa.service';
import { CepService } from '../../../../../core/services/cep.service';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { EtiquetaService } from '../../../../../core/services/etiqueta.service';

import { ConsultarEtiquetaResponse } from '../../../../../core/models/etiqueta/consultar-etiqueta-response';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';

import { PerfilEnum } from '../../../../../core/models/enums/perfil/perfilEnum';
import { TratamentoEnum } from '../../../../../core/models/enums/tratamento/tratamentoEnum';

import { EnderecoRequest } from '../../../../../core/models/endereco/endereco-request';
import { InformacoesComplementaresRequest } from '../../../../../core/models/informacoes-complementares/informacoes-complementares-request';

import { limparNull } from '../../../../../core/utils/limpar-null';
import { PessoaFisicaUpdateRequest } from '../../../../../core/models/pessoa/pessoa-fisica-update-request';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-editar-pessoa-fisica',
  standalone: false,
  templateUrl: './editar-pessoa-fisica.html',
  styleUrls: ['./editar-pessoa-fisica.css']
})
export class EditarPessoaFisica implements OnInit {

  private pessoaService = inject(PessoaService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authHelper = inject(AuthHelper);
  private cepService = inject(CepService);
  private etiquetaService = inject(EtiquetaService);
private cdr = inject(ChangeDetectorRef);
  idPessoa = '';

  usuarioLogado?: AutenticarUsuarioResponse | null;

  tiposEtiquetas: ConsultarEtiquetaResponse[] = [];
  etiquetaSelecionada?: ConsultarEtiquetaResponse;

  mensagemErro: string[] = [];
  mensagemAviso: string[] = [];
  mensagemSucesso: string[] = [];

  carregando = false;
  step = 1;

  perfilEnum = PerfilEnum;

  perfis = Object.keys(PerfilEnum)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      id: PerfilEnum[key as keyof typeof PerfilEnum],
      nome: key
    }));

  tratamentoEnum = TratamentoEnum;

  tratamentos = Object.keys(TratamentoEnum)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      id: TratamentoEnum[key as keyof typeof TratamentoEnum],
      nome: key
    }));

  form = this.builder.group({
    nome: ['', Validators.required],
    apelido: [''],
    telefone: ['', Validators.required],
    site: [''],
    email: [''],
    idPerfil: [null as number | null],
idEtiqueta: [null as string | null],

    // Documentação da pessoa física
    rg: [''],
    cpf: ['', Validators.required],
    tituloEleitor: [''],
    carteiraTrabalho: [''],
    pisPasep: [''],
    cnh: [''],
    passaporte: [''],
    certidaoReservista: [''],

    // Controle da alteração
    idUsuario: [''],
    observacoes: ['', Validators.required],

    endereco: this.builder.group({
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      localidade: ['', Validators.required],
      uf: ['', Validators.required],
      cep: ['', Validators.required]
    }),

   informacoesComplementares: this.builder.group({
  dataNascimento: [''],
  nomeEmpresa: [''],
  profissao: [''],
  atividadeEconomica: [''],
  estadoCivil: [''],
  codigo: [''],
  nomePai: [''],
  nomeMae: [''],
  naturalidade: [''],
  nacionalidade: [''],
  comentario: ['']
})
  });

  ngOnInit(): void {
    this.mensagemErro = [];
    this.carregando = true;

    this.usuarioLogado = this.authHelper.get();

    if (this.usuarioLogado?.idUsuario) {
      this.form.get('idUsuario')?.setValue(
        this.usuarioLogado.idUsuario
      );
    }

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.mensagemErro = [
        'Não foi possível identificar a pessoa física.'
      ];

      this.carregando = false;
      return;
    }

    this.idPessoa = id;

    this.carregarEtiquetas();
    this.carregarPessoa(id);
  }

  private carregarPessoa(id: string): void {
    this.pessoaService
      .consultarPessoaFisicaPorId(id)
      .subscribe({
        next: response => {
          const pessoa = response.data;

          if (!pessoa) {
            this.mensagemErro = [
              'Pessoa física não encontrada.'
            ];

            this.carregando = false;
            return;
          }

          this.form.patchValue({
            nome: pessoa.nome ?? '',
            apelido: pessoa.apelido ?? '',
            telefone: pessoa.telefone ?? '',
            site: pessoa.site ?? '',
            email: pessoa.email ?? '',

           

            idEtiqueta:
              pessoa.idEtiqueta ??
              null,

            rg: pessoa.rg ?? '',
            cpf: pessoa.cpf ?? '',
            tituloEleitor: pessoa.tituloEleitor ?? '',
            carteiraTrabalho: pessoa.carteiraTrabalho ?? '',
            pisPasep: pessoa.pisPasep ?? '',
            cnh: pessoa.cnh ?? '',
            passaporte: pessoa.passaporte ?? '',
            certidaoReservista:
              pessoa.certidaoReservista ?? '',

            endereco: {
              logradouro:
                pessoa.endereco?.logradouro ?? '',
              numero:
                pessoa.endereco?.numero ?? '',
              complemento:
                pessoa.endereco?.complemento ?? '',
              bairro:
                pessoa.endereco?.bairro ?? '',
              localidade:
                pessoa.endereco?.localidade ?? '',
              uf:
                pessoa.endereco?.uf ?? '',
              cep:
                pessoa.endereco?.cep ?? ''
            },

          informacoesComplementares: {
  dataNascimento:
    pessoa.informacoesComplementares?.dataNascimento ?? '',

  nomeEmpresa:
    pessoa.informacoesComplementares?.nomeEmpresa ?? '',

  profissao:
    pessoa.informacoesComplementares?.profissao ?? '',

  atividadeEconomica:
    pessoa.informacoesComplementares?.atividadeEconomica ?? '',

  estadoCivil:
    pessoa.informacoesComplementares?.estadoCivil ?? '',

  codigo:
    pessoa.informacoesComplementares?.codigo ?? '',

  nomePai:
    pessoa.informacoesComplementares?.nomePai ?? '',

  nomeMae:
    pessoa.informacoesComplementares?.nomeMae ?? '',

  naturalidade:
    pessoa.informacoesComplementares?.naturalidade ?? '',

  nacionalidade:
    pessoa.informacoesComplementares?.nacionalidade ?? '',

  comentario:
    pessoa.informacoesComplementares?.comentario ?? ''
}
          });

          this.carregando = false;
        },
        error: err => {
          this.tratarErro(err);
        }
      });
  }

  private carregarEtiquetas(): void {
    this.etiquetaService.consultar().subscribe({
      next: response => {
        this.tiposEtiquetas = response;
      },
      error: () => {
        this.mensagemAviso = [
          'Não foi possível carregar as etiquetas.'
        ];
      }
    });
  }

  irParaStep(step: number): void {
    this.step = step;
  }

  onSubmit(): void {
    this.mensagemErro = [];
    this.mensagemAviso = [];
    this.mensagemSucesso = [];

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      this.mensagemErro = [
        'Preencha corretamente os campos obrigatórios.'
      ];

      return;
    }

    if (!this.idPessoa) {
      this.mensagemErro = [
        'Não foi possível identificar a pessoa física.'
      ];

      return;
    }

    this.carregando = true;

    const formValue = this.form.getRawValue();

    const endereco = limparNull<EnderecoRequest>(
      formValue.endereco ?? {}
    );

    const informacoesComplementares =
      limparNull<InformacoesComplementaresRequest>(
        formValue.informacoesComplementares ?? {}
      );

    const request: PessoaFisicaUpdateRequest = {
      nome: formValue.nome?.trim() || undefined,
      apelido: formValue.apelido?.trim() || undefined,

      idEtiqueta:
        formValue.idEtiqueta != null
          ? Number(formValue.idEtiqueta)
          : undefined,

      email: formValue.email?.trim() || undefined,
      site: formValue.site?.trim() || undefined,

      idPerfil:
        formValue.idPerfil != null
          ? Number(formValue.idPerfil)
          : undefined,

      rg: formValue.rg?.trim() || undefined,
      cpf: formValue.cpf?.trim() || undefined,

      tituloEleitor:
        formValue.tituloEleitor?.trim() || undefined,

      carteiraTrabalho:
        formValue.carteiraTrabalho?.trim() || undefined,

      pisPasep:
        formValue.pisPasep?.trim() || undefined,

      cnh:
        formValue.cnh?.trim() || undefined,

      passaporte:
        formValue.passaporte?.trim() || undefined,

      certidaoReservista:
        formValue.certidaoReservista?.trim() || undefined,

      telefone:
        formValue.telefone?.trim() || undefined,

      idUsuario:
        this.usuarioLogado?.idUsuario ?? undefined,

      idSexo: undefined,

      observacoes:
        formValue.observacoes?.trim() || undefined,

      endereco,
      informacoesComplementares
    };

this.pessoaService
  .editarPessoaFisica(
    this.idPessoa,
    request
  )
  .pipe(
    finalize(() => {
      this.carregando = false;
      this.cdr.detectChanges();
    })
  )
  .subscribe({
    next: response => {
      this.mensagemErro = [];
      this.mensagemAviso = [];

      this.mensagemSucesso = [
        response.message
      ];

      this.cdr.detectChanges();

      setTimeout(() => {
        this.router.navigate([
          '/admin/consultar-pessoas'
        ]);
      }, 3000);
    },

    error: (err: HttpErrorResponse) => {
      this.tratarErro(err);
    }
  });
}

  buscarCep(): void {
    this.mensagemErro = [];
    this.mensagemAviso = [];

    const cep = this.form
      .get('endereco.cep')
      ?.value
      ?.replace(/\D/g, '');

    if (!cep || cep.length !== 8) {
      this.mensagemAviso = [
        'O CEP deve conter 8 dígitos.'
      ];

      return;
    }

    this.cepService.buscarCep(cep).subscribe({
      next: endereco => {
        if ((endereco as any).erro) {
          this.mensagemErro = [
            'CEP não encontrado.'
          ];

          return;
        }

        this.form.patchValue({
          endereco: {
            logradouro: endereco.logradouro,
            bairro: endereco.bairro,
            localidade: endereco.localidade,
            uf: endereco.uf
          }
        });
      },
      error: () => {
        this.mensagemErro = [
          'Erro ao buscar o CEP.'
        ];
      }
    });
  }

  limitarUf(valor: string): string {
    if (!valor) {
      return '';
    }

    return valor
      .replace(/[^a-zA-Z]/g, '')
      .toUpperCase()
      .substring(0, 2);
  }

  onBlurUf(): void {
    const controle = this.form.get('endereco.uf');
    const valor = controle?.value || '';

    controle?.setValue(
      this.limitarUf(valor)
    );
  }

  formatarTelefonesEmLinha(valor?: string): string {
    if (!valor) {
      return '';
    }

    return valor
      .split(';')
      .map(telefone => {
        const numeros = telefone.replace(/\D/g, '');

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

        return telefone.trim();
      })
      .join('; ');
  }

  formatarLimitarTelefones(): void {
    const controle = this.form.get('telefone');

    if (!controle?.value) {
      return;
    }

    const formatado =
      this.limitarTelefonesMaximo33Numeros(
        controle.value
      );

    controle.setValue(formatado);
  }

  limitarTelefonesMaximo33Numeros(
    valor: string
  ): string {
    const apenasNumeros = valor
      .replace(/\D/g, '')
      .substring(0, 33);

    const telefones: string[] = [];

    for (
      let inicio = 0;
      inicio < apenasNumeros.length;
      inicio += 11
    ) {
      const telefone =
        apenasNumeros.substring(inicio, inicio + 11);

      if (telefone.length === 11) {
        telefones.push(
          telefone.replace(
            /(\d{2})(\d{5})(\d{4})/,
            '($1) $2-$3'
          )
        );
      } else if (telefone.length === 10) {
        telefones.push(
          telefone.replace(
            /(\d{2})(\d{4})(\d{4})/,
            '($1) $2-$3'
          )
        );
      }
    }

    return telefones.join('; ');
  }

  formatarCampoEmail(): void {
    const controle = this.form.get('email');
    const valor = controle?.value;

    if (!valor) {
      return;
    }

    let emails = valor
      .split(';')
      .map(email => email.trim())
      .filter(email => email);

    if (emails.length > 3) {
      this.mensagemErro = [
        'Você só pode informar no máximo três e-mails.'
      ];

      emails = emails.slice(0, 3);
    }

    controle.setValue(
      emails.join('; ')
    );
  }

  get podeEnviar(): boolean {
    return this.form.valid && !this.carregando;
  }

  private tratarErro(
    err: HttpErrorResponse
  ): void {
    this.mensagemErro = [];

    const errorResponse = err.error;

    if (errorResponse?.errors) {
      for (const key in errorResponse.errors) {
        const erros = errorResponse.errors[key];

        if (Array.isArray(erros)) {
          this.mensagemErro.push(...erros);
        }
      }
    } else if (errorResponse?.message) {
      this.mensagemErro.push(
        errorResponse.message
      );
    } else if (errorResponse?.mensagem) {
      this.mensagemErro.push(
        errorResponse.mensagem
      );
    } else {
      this.mensagemErro.push(
        'Erro inesperado ao atualizar a pessoa física.'
      );
    }

    this.carregando = false;
  }
}


import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';

import { UsuarioService } from '../../../../../core/services/usuario.service';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { EditarUsuarioRequest } from '../../../../../core/models/usuario/editar-usuario-request';

import { environment } from '../../../../../../environments/environment.development';
import { PerfilUsuarioResponse } from '../../../../../core/models/perfil/perfil-usuario-response';

@Component({
  selector: 'app-perfil',
  standalone: false,
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class Perfil implements OnInit {

  private usuarioService = inject(UsuarioService);

  private builder = inject(FormBuilder);

  private router = inject(Router);

  private route = inject(ActivatedRoute);

  private authHelper = inject(AuthHelper);

  private cd = inject(ChangeDetectorRef);

  @ViewChild('fileInput')
  fileInput!: ElementRef<HTMLInputElement>;

  carregandoConsulta = true;

  carregandoCadastro = false;

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];

usuario!: PerfilUsuarioResponse;

  usuarioLogado: any;

  setores: any[] = [];

  niveis: any[] = [];

  fotoUsuario: string =
    'assets/appdeslandes/img/default-avatar.jpg';

  selectedFile?: File;

  form: FormGroup = this.builder.group({

    id: [''],

    nomeUsuario: [''],

    login: ['', Validators.required],

    senha: [
      '',
      [
        Validators.required,
        this.senhaForteValidator()
      ]
    ],

    confirmarSenha: [
      '',
      Validators.required
    ],

    idPessoa: ['', Validators.required],

    grupoSetores: this.builder.array([]),

    grupoNiveis: this.builder.array([]),

    dataCadastro: [''],

    email: [''],

    endereco: [''],

    telefone: [''],

    genero: ['']

  }, {
    validators: this.validarSenhasIguais()
  });

  get podeEnviar(): boolean {
    return this.form.valid;
  }

  get fotoSelecionada(): boolean {
    return !!this.selectedFile;
  }

  ngOnInit(): void {

    this.carregandoConsulta = true;

    this.usuarioLogado = this.authHelper.get();

    console.log(
      'USUARIO LOGADO:',
      this.usuarioLogado
    );

    if (!this.usuarioLogado?.idUsuario) {

      this.mensagemErro.push(
        'Usuário não autenticado.'
      );

      this.carregandoConsulta = false;

      return;
    }

    this.usuarioService
      .consultarPerfilUsuarioPorId(
        this.usuarioLogado.idUsuario
      )
      .subscribe({

        next: (response) => {

          console.log(
            'RESPONSE PERFIL:',
            response
          );

          const usuario = response;

          this.usuario = usuario;

          this.setores =
            usuario.grupoSetores ?? [];

          this.niveis =
            usuario.grupoNiveis ?? [];

          this.fotoUsuario =
            usuario?.foto?.fileUrl
              ? `${environment.apiDeslandes}${usuario.foto.fileUrl}`
              : 'assets/appdeslandes/img/default-avatar.jpg';

          this.form.patchValue({

            id: usuario.id,

            nomeUsuario:
              usuario.nomeUsuario,

            login:
              usuario.login,

            dataCadastro:
              usuario.dataCadastro,

            email:
              usuario.email,

            endereco:
              usuario.endereco,

            telefone:
              usuario.telefone,

            genero:
              usuario.genero

          });

          console.log(
            'FORM ID:',
            this.form.value.id
          );

          this.cd.detectChanges();

          this.carregandoConsulta = false;
        },

        error: (err) => {

          console.error(
            'ERRO PERFIL:',
            err
          );

          this.mensagemErro.push(
            'Erro ao carregar o perfil do usuário.'
          );

          this.carregandoConsulta = false;
        }
      });
  }

  abrirUpload(): void {

    if (this.fileInput) {

      // limpa seleção anterior
      this.fileInput.nativeElement.value = '';

      // abre seletor
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    this.selectedFile = file;

    console.log(
      'ARQUIVO:',
      file
    );

    const reader = new FileReader();

    reader.onload = (e: any) => {

      this.fotoUsuario =
        e.target.result;

      this.cd.detectChanges();
    };

    reader.readAsDataURL(file);
  }

  uploadFoto(): void {

    if (!this.selectedFile) {

      this.mensagemErro = [
        'Selecione uma foto.'
      ];

      return;
    }

    if (!this.form.value.id) {

      console.error(
        'ID INVALIDO:',
        this.form.value
      );

      this.mensagemErro = [
        'Usuário inválido.'
      ];

      return;
    }

    this.carregandoCadastro = true;

    this.mensagemErro = [];

    this.mensagemSucesso = [];

    this.usuarioService
      .cadastrarFoto(
        this.form.value.id,
        this.selectedFile
      )
      .subscribe({

        next: (res: any) => {

          console.log(
            'UPLOAD OK:',
            res
          );

          this.mensagemSucesso = [
            'Foto salva com sucesso!'
          ];

          if (res?.fileUrl) {

            this.fotoUsuario =
              `${environment.apiDeslandes}${res.fileUrl}`;
          }

          this.selectedFile = undefined;

          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }

          this.cd.detectChanges();
        },

        error: (err) => {

          console.error(
            'ERRO UPLOAD:',
            err
          );

          this.mensagemErro = [
            'Erro ao salvar foto.'
          ];
        }

      })
      .add(() => {

        this.carregandoCadastro = false;
      });
  }

  onImageError(event: Event): void {

    (
      event.target as HTMLImageElement
    ).src =
      'assets/appdeslandes/img/default-avatar.jpg';
  }

  onSubmit(): void {

    this.carregandoCadastro = true;

    this.mensagemErro = [];

    this.mensagemSucesso = [];

    if (!this.podeEnviar) {

      this.mensagemErro.push(
        'Preencha todos os campos obrigatórios corretamente.'
      );

      this.carregandoCadastro = false;

      return;
    }

    const request:
      EditarUsuarioRequest = {

      id:
        this.form.value.id,

      login:
        this.form.value.login,

      senha:
        this.form.value.senha
    };

    this.usuarioService
      .editarPorId(request)
      .subscribe({

        next: (response) => {

          this.mensagemSucesso.push(
            response.message ??
            'Usuário atualizado com sucesso!'
          );
        },

        error: (e) =>
          this.tratarErro(e)

      })
      .add(() => {

        this.carregandoCadastro = false;
      });
  }

  private tratarErro(e: any): void {

    this.mensagemErro = [];

    const errorResponse =
      e?.error;

    if (errorResponse?.errors) {

      for (const key in errorResponse.errors) {

        if (
          Array.isArray(
            errorResponse.errors[key]
          )
        ) {

          this.mensagemErro.push(
            ...errorResponse.errors[key]
          );
        }
      }

    } else if (errorResponse?.mensagem) {

      this.mensagemErro.push(
        errorResponse.mensagem
      );

    } else {

      this.mensagemErro.push(
        'Ocorreu um erro inesperado.'
      );
    }
  }

  validarSenhasIguais(): ValidatorFn {

    return (
      group: AbstractControl
    ): ValidationErrors | null => {

      const senha =
        group.get('senha')?.value;

      const confirmar =
        group.get('confirmarSenha')?.value;

      return senha &&
        confirmar &&
        senha !== confirmar

        ? { senhasDiferentes: true }

        : null;
    };
  }

  senhaForteValidator(): ValidatorFn {

    return (
      control: AbstractControl
    ): ValidationErrors | null => {

      const valor =
        control.value;

      if (!valor) {
        return null;
      }

      const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

      return regex.test(valor)

        ? null

        : {
            senhaFraca:
              'A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.'
          };
    };
  }

  coresBadge = [

    'badge-subtle-primary',

    'badge-subtle-success',

    'badge-subtle-warning',

    'badge-subtle-info',

    'badge-subtle-danger',

    'badge-subtle-secondary'
  ];
}
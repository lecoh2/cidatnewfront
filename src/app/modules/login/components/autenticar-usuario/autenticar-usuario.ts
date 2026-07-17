import { ChangeDetectorRef, Component, inject, NgZone } from '@angular/core';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthHelper } from '../../../../core/helpers/auth.helper';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-autenticar-usuario',
  standalone: false,
  templateUrl: './autenticar-usuario.html',
  styleUrl: './autenticar-usuario.css'
})
export class AutenticarUsuario {

  private service = inject(UsuarioService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private helper = inject(AuthHelper);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  anoAtual = new Date().getFullYear();

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;

  form = this.builder.group({
    login: new FormControl('', [Validators.required]),
    senha: new FormControl('', [Validators.required])
  });

  onSubmit(): void {

    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (this.form.invalid) {
      this.mensagemErro = ['Preencha login e senha.'];
      this.cdr.detectChanges();
      return;
    }

    const request = {
      login: this.form.value.login ?? '',
      senha: this.form.value.senha ?? ''
    };

    this.carregando = true;
    this.cdr.detectChanges();

    this.service.autenticar(request)
      .pipe(
        finalize(() => {

          this.zone.run(() => {

            this.carregando = false;

            console.log('FINALIZE EXECUTADO');

            this.cdr.detectChanges();

          });

        })
      )
      .subscribe({

        next: (response: any) => {

          this.zone.run(() => {

            console.log('SUCESSO:', response);

            const usuario = response.data ?? response;

            this.helper.create(usuario);

            this.mensagemSucesso = [
              `Bem-vindo ${usuario.nomeUsuario}`
            ];

            this.mensagemErro = [];

            this.form.reset();

            this.cdr.detectChanges();

            setTimeout(() => {
              this.router.navigate(['/admin/painel-principal']);
            }, 1500);

          });

        },

        error: (e) => {

          this.zone.run(() => {

            console.log('ERRO COMPLETO:', e);

            this.carregando = false;

            const mensagem =
              e?.error?.message ||
              e?.error?.Message ||
              e?.error?.mensagem ||
              'Credenciais inválidas.';

            this.mensagemErro = [mensagem];

            this.mensagemSucesso = [];

            console.log('Mensagem atribuída:', this.mensagemErro);

            this.cdr.detectChanges();

          });

        }

      });
  }
}
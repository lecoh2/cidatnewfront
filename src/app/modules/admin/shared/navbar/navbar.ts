import {
  Component,
  inject,
  ElementRef,
  Renderer2,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { AuthHelper } from '../../../../core/helpers/auth.helper';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { environment } from '../../../../../environments/environment.development';
import { LembreteResponse } from '../../../../core/models/lembrete/lembrete-response';
import { DashboardService } from '../../../../core/services/dashboard.service';
@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, AfterViewInit, OnDestroy {

  // INJEÇÕES
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private usuarioService = inject(UsuarioService);
  private cdr = inject(ChangeDetectorRef);
 private dashboardService = inject(DashboardService);
  authHelper = inject(AuthHelper);
lembretes: LembreteResponse[] = [];
  // ATRIBUTOS
  nomeUsuario: string = 'Usuário';
  usuarioLogado: any = null;

  fotoUsuario: string =
    'assets/appdeslandes/img/default-avatar.jpg';

  // INIT
 ngOnInit(): void {

  this.carregarUsuario();
   this.carregarLembretes();
}
obterLinkLembrete(item: any): string[] {

  // EVENTO
  if (item.tipo === 'Evento') {

    return [
      '/admin',
      'editar-evento',
      item.id
    ];
  }

  // TAREFA
  if (item.tipo === 'Tarefa') {

    return [
      '/admin',
      'editar-tarefa',
      item.id
    ];
  }

  // fallback
  return ['/admin'];
}
  // DESTROY
  ngOnDestroy(): void {
    console.log('NAVBAR DESTRUIDA');
  }

  // CARREGAR USUÁRIO
  private carregarUsuario(): void {

    // fallback SEMPRE primeiro
    this.fotoUsuario =
      'assets/appdeslandes/img/default-avatar.jpg';

    // pega usuário
    this.usuarioLogado = this.authHelper.get();

    // nome
    this.nomeUsuario =
      this.usuarioLogado?.nomeUsuario ?? 'Usuário';

    // se não existir usuário, mantém fallback
    if (!this.usuarioLogado?.idUsuario) {
      return;
    }

    // busca perfil atualizado
    this.usuarioService
      .consultarPerfilUsuarioPorId(
        this.usuarioLogado.idUsuario
      )
      .subscribe({

        next: (usuario) => {

          const foto = usuario?.foto?.fileUrl;

          // garante fallback seguro
          this.fotoUsuario =
            foto
              ? `${environment.apiDeslandes}${foto}`
              : 'assets/appdeslandes/img/default-avatar.jpg';

          // força atualização visual Angular
      this.cdr.markForCheck();

          console.log(
            'FOTO FINAL:',
            this.fotoUsuario
          );
        },

        error: (err) => {

          console.error(
            'Erro ao carregar foto:',
            err
          );

          // fallback em caso de erro
          this.fotoUsuario =
            'assets/appdeslandes/img/default-avatar.jpg';

       this.cdr.markForCheck();
        }
      });
  }
private carregarLembretes(): void {

  this.dashboardService
    .getLembretes()
    .subscribe({

      next: (res) => {

        console.log('LEMBRETES:', res);

        this.lembretes = res ?? [];

        this.cdr.detectChanges();
      },

      error: (err) => {

        console.error(
          'Erro ao carregar lembretes',
          err
        );
      }
    });
}
  // SIDEBAR
  ngAfterViewInit(): void {

    const sidebar =
      document.querySelector('.sidebar');

    const toggleBtn =
      this.el.nativeElement.querySelector(
        '.sidebar-toggle'
      );

    if (sidebar && toggleBtn) {

      this.renderer.listen(
        toggleBtn,
        'click',
        () => {

          sidebar.classList.toggle('collapsed');

          window.dispatchEvent(
            new Event('resize')
          );
        }
      );
    }
  }

  // TEMA
  toggleTheme(): void {

    const themeKey =
      'appstack-config-theme';

    const currentTheme =
      localStorage.getItem(themeKey);

    const newTheme =
      currentTheme === 'dark'
        ? 'default'
        : 'dark';

    document.documentElement.setAttribute(
      'data-bs-theme',
      newTheme
    );

    document.documentElement.setAttribute(
      'data-sidebar-theme',
      newTheme
    );

    localStorage.setItem(
      themeKey,
      newTheme
    );

    document.dispatchEvent(
      new Event(
        'DOMContentLoaded',
        {
          bubbles: true,
          cancelable: true
        }
      )
    );
  }

  // LOGOUT
  logout(): void {

    if (
      confirm(
        `Deseja realmente sair do sistema, ${this.nomeUsuario}?`
      )
    ) {

      this.authHelper.remove();

      location.reload();
    }
  }
}
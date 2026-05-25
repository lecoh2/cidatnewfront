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
import { Notificacao } from '../../../../core/models/notficacao/notificacao';
import { NotificacoService } from '../../../../core/services/notificacao.service';
import { NotificacaoSignalRService } from '../../../../core/services/notificacao-signalr.service';
import Swal from 'sweetalert2';
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
  private notificacaoService = inject(NotificacoService);
   private notificacaoSignalR = inject(NotificacaoSignalRService);
  authHelper = inject(AuthHelper);


  notificacoes: Notificacao[] = [];

  // ATRIBUTOS
  nomeUsuario: string = 'Usuário';
  usuarioLogado: any = null;

  fotoUsuario: string =
    'assets/appdeslandes/img/default-avatar.jpg';

  // INIT
ngOnInit(): void {

  this.carregarUsuario();
 
  this.carregarNotificacoes();

  const usuario = this.authHelper.get();

  if (usuario?.idUsuario) {
this.notificacaoSignalR.iniciar(
  usuario.idUsuario,
  (data) => {

    console.log('🔔 SignalR recebido:', data);

    this.notificacoes.unshift({
      id: '',
      usuarioId: usuario.idUsuario,
      titulo: data.titulo,
      mensagem: data.mensagem,
      lida: false,
      dataCriacao: new Date().toISOString()
    });

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',

      title: data.titulo,
      text: data.mensagem,

      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,

      background: '#1f2937',
      color: '#fff',
      iconColor: '#3b82f6',

      showClass: {
        popup: 'animate__animated animate__fadeInRight'
      },

      hideClass: {
        popup: 'animate__animated animate__fadeOutRight'
      }
    });

    this.cdr.markForCheck();
  }
);
  }this.notificacaoSignalR.onNotificacaoLida((id: string) => {

  const notificacao =
    this.notificacoes.find(x => x.id === id);

  if (notificacao) {

    notificacao.lida = true;

    this.cdr.markForCheck();
  }
});
}

carregarNotificacoes() {

 const usuario = this.authHelper.get();

console.log('👤 USUARIO LOGADO:', usuario);

if (!usuario?.idUsuario) return;

this.notificacaoService
  .getNotificacoes(usuario.idUsuario)
  .subscribe({
    next: (res) => {
      console.log('🔔 NOTIFICAÇÕES:', res);

      this.notificacoes = res ?? [];
      this.cdr.markForCheck();
    },
    error: (err) => {
      console.error('❌ Erro ao buscar notificações:', err);
      this.notificacoes = [];
    }
  });
}
marcarComoLida(item: Notificacao): void {

  if (!item?.id) return;

  this.notificacaoService.marcarComoLida(item.id)
    .subscribe({
next: () => {

  this.notificacoes =
    this.notificacoes.filter(x => x.id !== item.id);

  this.cdr.markForCheck();

  Swal.fire({
  toast: true,
  position: 'top-end',
  icon: 'success',

  title: 'Marcada como lida',

  showConfirmButton: false,
  timer: 1800,
  timerProgressBar: true,

  background: '#1f2937',
  color: '#fff',

  iconColor: '#22c55e'
});
},
      error: (err) => {
        console.error('Erro ao marcar como lida:', err);
      }
    });
}
  get naoLidas() {
    return (this.notificacoes ?? []).filter(x => !x.lida).length;
  }



  // DESTROY
  ngOnDestroy(): void {
    console.log('NAVBAR DESTRUIDA');
  }

  // USUÁRIO
  private carregarUsuario(): void {

    this.fotoUsuario =
      'assets/appdeslandes/img/default-avatar.jpg';

    this.usuarioLogado = this.authHelper.get();

    this.nomeUsuario =
      this.usuarioLogado?.nomeUsuario ?? 'Usuário';

    if (!this.usuarioLogado?.idUsuario) return;

    this.usuarioService
      .consultarPerfilUsuarioPorId(this.usuarioLogado.idUsuario)
      .subscribe({

        next: (usuario) => {

          const foto = usuario?.foto?.fileUrl;

          this.fotoUsuario =
            foto
              ? `${environment.apiDeslandes}${foto}`
              : 'assets/appdeslandes/img/default-avatar.jpg';

          this.cdr.markForCheck();
        },

        error: (err) => {

          console.error('Erro ao carregar foto:', err);

          this.fotoUsuario =
            'assets/appdeslandes/img/default-avatar.jpg';

          this.cdr.markForCheck();
        }
      });
  }

  // LEMBRETES


  // SIDEBAR
  ngAfterViewInit(): void {

    const sidebar =
      document.querySelector('.sidebar');

    const toggleBtn =
      this.el.nativeElement.querySelector('.sidebar-toggle');

    if (sidebar && toggleBtn) {

      this.renderer.listen(toggleBtn, 'click', () => {

        sidebar.classList.toggle('collapsed');

        window.dispatchEvent(new Event('resize'));
      });
    }
  }

  // TEMA
  toggleTheme(): void {

    const themeKey = 'appstack-config-theme';

    const currentTheme = localStorage.getItem(themeKey);

    const newTheme =
      currentTheme === 'dark' ? 'default' : 'dark';

    document.documentElement.setAttribute('data-bs-theme', newTheme);
    document.documentElement.setAttribute('data-sidebar-theme', newTheme);

    localStorage.setItem(themeKey, newTheme);

    document.dispatchEvent(
      new Event('DOMContentLoaded', {
        bubbles: true,
        cancelable: true
      })
    );
  }

  // LOGOUT
  logout(): void {

    if (confirm(`Deseja realmente sair do sistema, ${this.nomeUsuario}?`)) {

      this.authHelper.remove();
      location.reload();
    }
  }
}
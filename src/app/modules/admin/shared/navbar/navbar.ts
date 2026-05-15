import { Component, inject, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { AuthHelper } from '../../../../core/helpers/auth.helper';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { environment } from '../../../../../environments/environment.development';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements AfterViewInit {
  // Injeta ElementRef e Renderer2
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private usuarioService = inject(UsuarioService);
  //injeção de depedencia
  authHelper = inject(AuthHelper);
  //atributos 
  nomeUsuario: string = '';
  usuarioLogado: any;
  fotoUsuario: string = 'assets/appdeslandes/img/default-avatar.jpg';
  //função executada ao abrir a pagina
  ngOnDestroy(): void {
  console.log('NAVBAR DESTRUIDA');
}
ngOnInit(): void {
  this.usuarioLogado = this.authHelper.get();

  this.nomeUsuario = this.usuarioLogado?.nomeUsuario ?? 'Usuário';

  // SEMPRE define fallback primeiro
  this.fotoUsuario = 'assets/appdeslandes/img/default-avatar.jpg';

  if (!this.usuarioLogado?.idUsuario) {
    return; // agora não quebra a imagem default
  }

  this.usuarioService
    .consultarPerfilUsuarioPorId(this.usuarioLogado.idUsuario)
    .subscribe({
      next: (usuario) => {
        this.fotoUsuario =
          usuario?.foto?.fileUrl
            ? `${environment.apiDeslandes}${usuario.foto.fileUrl}`
            : 'assets/appdeslandes/img/default-avatar.jpg';
      },
      error: () => {
        this.fotoUsuario = 'assets/appdeslandes/img/default-avatar.jpg';
      }
    });
}
  ngAfterViewInit() {
    const sidebar = document.querySelector('.sidebar'); // Busca global (caso sidebar esteja fora do navbar)
    const toggleBtn = this.el.nativeElement.querySelector('.sidebar-toggle');

    if (sidebar && toggleBtn) {
      this.renderer.listen(toggleBtn, 'click', () => {
        sidebar.classList.toggle('collapsed');
        window.dispatchEvent(new Event('resize'));
      });
    }
  }
  toggleTheme(): void {
    const themeKey = 'appstack-config-theme';
    const currentTheme = localStorage.getItem(themeKey);
    const newTheme = currentTheme === 'dark' ? 'default' : 'dark';

    document.documentElement.setAttribute('data-bs-theme', newTheme);
    document.documentElement.setAttribute('data-sidebar-theme', newTheme);
    localStorage.setItem(themeKey, newTheme);

    document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
  }
  logout() {
    if (confirm(`Deseja realmente sair do sistema, ${this.nomeUsuario}?`)) {
      this.authHelper.remove();//apagar os dados do usuario
      location.reload();//recarregar página
    }
  }
}

import {
  ChangeDetectorRef,
  Component,
  NgZone
} from '@angular/core';

import { ProcessoService } from '../../../../../core/services/processo.service';

import {
  finalize,
  timeout
} from 'rxjs';

@Component({
  selector: 'app-importar-processo-excel',
  templateUrl: './importar-processo-excel.html',
  standalone: false,
})
export class ImportarProcessoExcel {

  arquivo: File | null = null;

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  carregando = false;

  constructor(
    private processoService: ProcessoService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  // =========================
  // SELECIONAR ARQUIVO
  // =========================
  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.arquivo = null;
      return;
    }

    this.arquivo = input.files[0];
  }

  // =========================
  // ENVIAR IMPORTAÇÃO
  // =========================
  enviar(): void {

    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (!this.arquivo) {

      this.mensagemErro = [
        'Selecione um arquivo.'
      ];

      return;
    }

    const formData = new FormData();

    formData.append('file', this.arquivo);

    this.carregando = true;

    this.processoService
      .importarDistribuicao(formData)
      .pipe(

        timeout(120000),

        finalize(() => {

          this.ngZone.run(() => {

            this.carregando = false;

            this.cd.detectChanges();
          });
        })
      )
      .subscribe({

        next: (res: any) => {

          this.ngZone.run(() => {

            this.mensagemSucesso = [
              `Importação concluída. Sucesso: ${res?.sucesso ?? 0} | Falhas: ${res?.falhas ?? 0}`
            ];

            if (res?.erros?.length > 0) {
              this.mensagemErro = res.erros;
            }

            this.arquivo = null;

            this.cd.detectChanges();
          });
        },

        error: (err) => {

          console.error(err);

          this.ngZone.run(() => {

            this.mensagemErro = [
              err?.error?.message ??
              'Erro ao importar arquivo.'
            ];

            this.cd.detectChanges();
          });
        }
      });
  }

  // =========================
  // LIMPAR
  // =========================
  limpar(): void {

    this.arquivo = null;

    this.mensagemErro = [];
    this.mensagemSucesso = [];

    this.cd.detectChanges();
  }
}
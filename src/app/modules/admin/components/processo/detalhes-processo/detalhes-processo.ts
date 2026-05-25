import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { forkJoin } from 'rxjs';

import { take } from 'rxjs/operators';

import { ProcessoService }
from '../../../../../core/services/processo.service';

import { AtendimentoPorCliente }
from '../../../../../core/models/atendimento/atendimento-por-cliente';

@Component({
  selector: 'app-detalhes-processo',
  standalone: false,
  templateUrl: './detalhes-processo.html',
  styleUrls: ['./detalhes-processo.css']
})
export class DetalhesProcesso
implements OnInit {

  // =====================================
  // INJEÇÕES
  // =====================================
  private route =
    inject(ActivatedRoute);

  private processoService =
    inject(ProcessoService);

  private cdr =
    inject(ChangeDetectorRef);

  // =====================================
  // ESTADO
  // =====================================
  processoId!: string;

  processo: any = null;

  atendimentosPorCliente:
    AtendimentoPorCliente[] = [];

  carregando = false;

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];

  // =====================================
  // INIT
  // =====================================
  ngOnInit(): void {

    this.route.paramMap
      .subscribe(params => {

        const id =
          params.get('id');

        if (!id) {

          this.mensagemErro = [
            'Processo inválido'
          ];

          return;
        }

        this.processoId = id;

        this.carregarDados();

      });

  }

  // =====================================
  // CARREGAR DADOS
  // =====================================
 private carregarDados(): void {

  console.log('🚀 INICIOU carregarDados');

  this.carregando = true;

  this.mensagemErro = [];

  this.processo = null;

  this.atendimentosPorCliente = [];

  console.log('🆔 Processo ID:', this.processoId);

  forkJoin({

    processo:
      this.processoService
        .ObterProcessoPorId(
          this.processoId
        ),

    atendimentos:
      this.processoService
        .getResumoAtendimentos(
          this.processoId
        )

  })
  .pipe(take(1))
  .subscribe({

    next: (res) => {

      console.log('✅ RESPOSTA COMPLETA:', res);

      console.log('✅ PROCESSO:', res.processo);

      console.log('📊 ATENDIMENTOS:', res.atendimentos);

      this.processo =
        res.processo;

      this.atendimentosPorCliente =
        res.atendimentos ?? [];

      console.log(
        '📦 processo atribuído:',
        this.processo
      );

      console.log(
        '📦 atendimentos atribuídos:',
        this.atendimentosPorCliente
      );

      this.carregando = false;

      console.log(
        '✅ carregando FALSE'
      );

      this.cdr.detectChanges();

      console.log(
        '🔄 detectChanges executado'
      );

    },

    error: (err) => {

      console.error(
        '❌ ERRO NO SUBSCRIBE:',
        err
      );

      console.error(
        '❌ STATUS:',
        err?.status
      );

      console.error(
        '❌ ERROR:',
        err?.error
      );

      this.mensagemErro = [
        'Erro ao carregar dados do processo'
      ];

      this.carregando = false;

      this.cdr.detectChanges();

    },

    complete: () => {

      console.log(
        '🏁 forkJoin COMPLETE'
      );

    }

  });

}

  // =====================================
  // FORMATAR DATA
  // =====================================
  formatarData(
    data?: string
  ): string {

    if (!data)
      return '-';

    return new Date(data)
      .toLocaleDateString(
        'pt-BR'
      );

  }

  // =====================================
  // FORMATAR NÚMERO PROCESSO
  // =====================================
  formatarNumeroProcesso(
    numero: string | null
  ): string {

    if (!numero)
      return '-';

    const limpo =
      numero.replace(/\D/g, '');

    return limpo.replace(
      /^(\d{3})(\d{6})(\d{4})$/,
      '$1/$2/$3'
    );

  }

}
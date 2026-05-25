import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-dashboard-localizacoes',
  standalone: false,
  templateUrl: './dashboard-localizacoes.html',
  styleUrl: './dashboard-localizacoes.css'
})
export class DashboardLocalizacoes implements OnChanges {

  @Input()
  localizacoes: any[] = [];

  localizacoesOrdenadas: any[] = [];

  ngOnChanges(): void {
    this.ordenarLocalizacoes();
  }

  private ordenarLocalizacoes(): void {

    if (!this.localizacoes?.length) {
      this.localizacoesOrdenadas = [];
      return;
    }

    this.localizacoesOrdenadas = [...this.localizacoes]
      .sort((a, b) => {

        // 1. ATUAL SEMPRE PRIMEIRO
        if (a.atual && !b.atual) return -1;
        if (!a.atual && b.atual) return 1;

        // 2. depois ordena por data (mais recente primeiro)
        const dataA = new Date(a.dataSaida ?? 0).getTime();
        const dataB = new Date(b.dataSaida ?? 0).getTime();

        return dataB - dataA;
      });
  }

  obterLocalAtual(): any {
    return this.localizacoes.find(x => x.atual);
  }

  obterHistorico(): any[] {
    return this.localizacoesOrdenadas.filter(x => !x.atual);
  }

  formatarData(data: string | null): string {
    if (!data) return '-';
    return new Date(data).toLocaleString('pt-BR');
  }
}
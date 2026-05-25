import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-dashboard-historico',
  standalone: false,
  templateUrl: './dashboard-historico.html',
  styleUrl: './dashboard-historico.css'
})
export class DashboardHistorico implements OnChanges {

  @Input()
  historico: any[] = [];

  historicoOrdenado: any[] = [];

  ngOnChanges(): void {

    this.carregarHistorico();

  }

  private carregarHistorico(): void {

    this.historicoOrdenado =
      [...this.historico]
        .sort((a, b) =>
          new Date(b.dataAlteracao || b.dataCadastro).getTime() -
          new Date(a.dataAlteracao || a.dataCadastro).getTime()
        );

  }

  formatarData(data: string | null): string {

    if (!data)
      return '-';

    return new Date(data)
      .toLocaleString('pt-BR');

  }

  obterClasse(tipo: string): string {

    switch (tipo?.toLowerCase()) {

      case 'criação':
      case 'criacao':
        return 'bg-success';

      case 'edição':
      case 'edicao':
        return 'bg-warning text-dark';

      case 'movimentação':
      case 'movimentacao':
        return 'bg-primary';

      case 'exclusão':
      case 'exclusao':
        return 'bg-danger';

      default:
        return 'bg-secondary';

    }

  }

}
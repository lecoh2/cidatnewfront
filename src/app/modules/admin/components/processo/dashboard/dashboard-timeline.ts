import {
  Component,
  Input,
  OnChanges
} from '@angular/core';

import { AtendimentoPorCliente }
from '../../../../../core/models/atendimento/atendimento-por-cliente';

@Component({
  selector: 'app-dashboard-timeline',
  standalone: false,
   templateUrl: './dashboard-timeline.html',
   styleUrls: ['./dashboard-timeline.css']
})
export class DashboardTimeline
implements OnChanges {

  @Input()
  timeline: AtendimentoPorCliente[] = [];

  timelineOrdenada: AtendimentoPorCliente[] = [];

  ngOnChanges(): void {

    this.timelineOrdenada =
      [...this.timeline]
        .sort((a, b) =>
          new Date(b.ultimoAtendimento).getTime() -
          new Date(a.ultimoAtendimento).getTime()
        );

  }

  formatarData(data: string | null): string {

    if (!data)
      return '-';

    return new Date(data)
      .toLocaleString('pt-BR');

  }

  obterIniciais(nome: string): string {

    if (!nome)
      return '?';

    return nome
      .split(' ')
      .map(x => x[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  }

  obterClasseBadge(total: number): string {

    if (total >= 10)
      return 'bg-danger';

    if (total >= 5)
      return 'bg-warning text-dark';

    return 'bg-primary';

  }

}
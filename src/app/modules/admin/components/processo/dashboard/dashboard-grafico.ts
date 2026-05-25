import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';

import { Chart } from 'chart.js/auto';

import { AtendimentoPorCliente }
from '../../../../../core/models/atendimento/atendimento-por-cliente';

@Component({
  selector: 'app-dashboard-grafico',
  standalone: false,
  templateUrl: './dashboard-grafico.html',
  styleUrls: ['./dashboard-grafico.css']
})
export class DashboardGrafico
implements OnChanges, OnDestroy {

  @Input()
  atendimentos: AtendimentoPorCliente[] = [];

  private chart: Chart | null = null;

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['atendimentos'] &&
      this.atendimentos?.length
    ) {

      setTimeout(() => {

        this.criarGrafico();

      });

    }

  }

  criarGrafico(): void {

    const canvas =
      document.getElementById(
        'chart-processo-atendimento'
      ) as HTMLCanvasElement;

    if (!canvas)
      return;

    this.chart?.destroy();

   this.chart = new Chart(canvas, {

  type: 'bar',

  data: {

    labels:
      this.atendimentos.map(
        x => x.nome
      ),

    datasets: [
      {
        label: 'Atendimentos',

        data:
          this.atendimentos.map(
            x => x.totalAtendimentos
          ),

        backgroundColor: [
          '#0d6efd',
          '#198754',
          '#dc3545',
          '#ffc107',
          '#6f42c1',
          '#fd7e14',
          '#20c997',
          '#6610f2',
          '#d63384',
          '#0dcaf0'
        ],

        borderColor: [
          '#0a58ca',
          '#146c43',
          '#b02a37',
          '#cc9a06',
          '#59359c',
          '#ca6510',
          '#1aa179',
          '#520dc2',
          '#ab296a',
          '#0aa2c0'
        ],

        borderWidth: 1,

        borderRadius: 8,

        maxBarThickness: 50
      }
    ]

  },

  options: {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {
        display: false
      }

    },

    scales: {

      y: {

        beginAtZero: true,

        ticks: {
          precision: 0
        }

      }

    }

  }

});

  }

  ngOnDestroy(): void {

    this.chart?.destroy();

  }

}
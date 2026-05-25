import { Component, Input } from '@angular/core';
import { AtendimentoPorCliente } from '../../../../../core/models/atendimento/atendimento-por-cliente';

@Component({
  selector: 'app-dashboard-cards',
  standalone: false,
  templateUrl: './dashboard-cards.html',
  styleUrl: './dashboard-cards.css'
})
export class DashboardCards {

  @Input()
  processo: any;

  @Input()
  atendimentos: AtendimentoPorCliente[] = [];

  get totalAtendimentos(): number {

    return this.atendimentos.reduce(
      (total, item) => total + item.totalAtendimentos,
      0
    );

  }

  get totalClientes(): number {

    return this.atendimentos.length;

  }

  get clienteMaisAtivo(): string {

    if (!this.atendimentos.length)
      return '-';

    const cliente =
      this.atendimentos.reduce((a, b) =>
        a.totalAtendimentos > b.totalAtendimentos ? a : b
      );

    return cliente.nome;

  }

  get ultimoAtendimento(): string {

    if (!this.atendimentos.length)
      return '-';

    const ultimo =
      this.atendimentos
        .map(x => new Date(x.ultimoAtendimento))
        .sort((a, b) => b.getTime() - a.getTime())[0];

    return ultimo.toLocaleString('pt-BR');

  }

}
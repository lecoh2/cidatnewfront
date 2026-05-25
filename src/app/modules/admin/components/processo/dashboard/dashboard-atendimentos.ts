import { Component, Input } from '@angular/core';
import { AtendimentoPorCliente } from '../../../../../core/models/atendimento/atendimento-por-cliente';


@Component({
  selector: 'app-dashboard-atendimentos',
  standalone: false,
  templateUrl: './dashboard-atendimentos.html',
  styleUrl: './dashboard-atendimentos.css'
})
export class DashboardAtendimentos {

  @Input()
  atendimentos: AtendimentoPorCliente[] = [];

  obterIniciais(nome: string): string {

    if (!nome)
      return '?';

    return nome
      .split(' ')
      .map(x => x.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();

  }

  formatarData(data: string | null): string {

    if (!data)
      return '-';

    return new Date(data)
      .toLocaleString('pt-BR');

  }

  obterTotalAtendimentos(): number {

    return this.atendimentos.reduce(
      (total, item) =>
        total + item.totalAtendimentos,
      0
    );

  }

  obterClienteMaisAtivo(): AtendimentoPorCliente | null {

    if (!this.atendimentos.length)
      return null;

    return this.atendimentos.reduce((a, b) =>
      a.totalAtendimentos > b.totalAtendimentos
        ? a
        : b
    );

  }
private aplicarMascaraCpf(valor: string): string {

  if (!valor) return '';

  const cpf = valor.replace(/\D/g, '');

  return cpf.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    '$1.$2.$3-$4'
  );
}

formatarCpf(valor: string): string {
  return this.aplicarMascaraCpf(valor);
}
}
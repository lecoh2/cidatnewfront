import { Component, Input, OnChanges } from '@angular/core';
import { AtendimentoPorCliente } from '../../../../../core/models/atendimento/atendimento-por-cliente';

@Component({
  selector: 'app-dashboard-clientes',
  standalone: false,
  templateUrl: './dashboard-clientes.html',
  styleUrl: './dashboard-clientes.css'
})
export class DashboardClientes implements OnChanges {

  @Input()
  clientes: any[] = [];

  clientesOrdenados: any[] = [];

  ngOnChanges(): void {

    this.carregarClientes();

  }

  private carregarClientes(): void {

    this.clientesOrdenados =
      [...this.clientes]
        .sort((a, b) =>
          (a.nome || '').localeCompare(b.nome || '')
        );

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

  obterCor(index: number): string {

    const cores = [
      'bg-primary',
      'bg-success',
      'bg-warning',
      'bg-danger',
      'bg-info',
      'bg-dark'
    ];

    return cores[index % cores.length];

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
import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { RelatorioService }
from '../../../../../core/services/relatorio.service';

import { RelatorioMensalResponse }
from '../../../../../core/models/usuario/relatorio-mensal-response';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import {
  ChartConfiguration,
  ChartOptions
} from 'chart.js';
@Component({
  selector: 'app-relatorio-mensal',
  standalone: false,
  templateUrl: './dashbord-relatorio-mensal.html',
  styleUrl: './dashbord-relatorio-mensal.css'
})
export class DashboardRelatorioMensal
implements OnInit {

  // =========================
  // INJEÇÕES
  // =========================
  private relatorioService =
    inject(RelatorioService);

  // =========================
  // ESTADO
  // =========================
  carregando = false;

  mensagemErro: string[] = [];

  relatorio?: RelatorioMensalResponse;

  mes = new Date().getMonth() + 1;

  ano = new Date().getFullYear();
barChartData?: ChartConfiguration<'bar'>['data'];

barChartOptions: ChartOptions<'bar'> = {
  responsive: true
};
  // =========================
  // INIT
  // =========================
  ngOnInit(): void {

    this.carregarRelatorio();

  }

  // =========================
  // CARREGAR RELATÓRIO
  // =========================
  carregarRelatorio(): void {

    this.carregando = true;

    this.mensagemErro = [];

    this.relatorioService
      .obterRelatorioMensal(
        this.mes,
        this.ano
      )
      .subscribe({

        next: (res) => {

          this.relatorio = res;

          this.carregando = false;
          this.barChartData = {
  labels: res.funcionarios.map(x => x.nome),

  datasets: [
    {
      data: res.funcionarios.map(x => x.quantidadeProcessos),
      label: 'Processos'
    }
  ]
};

        },

        error: () => {

          this.mensagemErro = [
            'Erro ao carregar relatório.'
          ];

          this.carregando = false;

        }

      });

  }

  // =========================
  // TOTAL PROCESSOS
  // =========================
  obterTotalProcessosUsuarios(): number {

    if (!this.relatorio)
      return 0;

    return this.relatorio
      .processosPorUsuario
      .reduce(
        (total, item) =>
          total + item.quantidadeProcessos,
        0
      );

  }

  // =========================
  // INICIAIS
  // =========================
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

  // =========================
  // MÊS FORMATADO
  // =========================
  obterNomeMes(): string {

    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro'
    ];

    return meses[this.mes - 1];

  }formatarNumeroProcesso(numero: string): string {

  if (!numero)
    return '';

  const valor = numero.replace(/\D/g, '');

  // PADRÃO INTERNO
  if (valor.length === 13) {

    return valor.replace(
      /(\d{3})(\d{6})(\d{4})/,
      '$1/$2/$3'
    );

  }

  // PADRÃO CNJ
  if (valor.length === 20) {

    return valor.replace(
      /^(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})$/,
      '$1-$2.$3.$4.$5.$6'
    );

  }

  // QUALQUER OUTRO FORMATO
  return numero;

}exportarExcel(): void {

  if (!this.relatorio)
    return;

  const worksheet = XLSX.utils.json_to_sheet(
    this.relatorio.processosPorUsuario
  );

  const workbook = {
    Sheets: {
      data: worksheet
    },
    SheetNames: ['data']
  };

  const excelBuffer =
    XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

  const blob = new Blob(
    [excelBuffer],
    {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    }
  );

  FileSaver.saveAs(
    blob,
    'relatorio-mensal.xlsx'
  );

}
exportarPdf(): void {

  const DATA =
    document.getElementById('relatorio');

  if (!DATA)
    return;

  html2canvas(DATA).then(canvas => {

    const imgWidth = 208;

    const pageHeight = 295;

    const imgHeight =
      canvas.height * imgWidth / canvas.width;

    const heightLeft = imgHeight;

    const contentData =
      canvas.toDataURL('image/png');

    const pdf = new jsPDF(
      'p',
      'mm',
      'a4'
    );

    pdf.addImage(
      contentData,
      'PNG',
      0,
      0,
      imgWidth,
      imgHeight
    );

    pdf.save('relatorio.pdf');

  });

}
}
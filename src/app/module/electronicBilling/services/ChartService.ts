import { Injectable } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexResponsive,
  ApexFill,
  ApexDataLabels,
  ApexLegend,
} from 'ng-apexcharts';
import { Company } from '../model/company.model';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  fill: ApexFill;
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
};

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  constructor() {}

  // Método para inicializar las opciones de la gráfica
  initializeChartOptions(): Partial<ChartOptions> {
    return {
      series: [],
      chart: {
        width: 280,
        height: 380,
        type: 'donut',
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '11px',
        },
        formatter: function (val: number) {
          return `${Math.round(val)}%`;
        },
      },
      fill: {
        type: 'gradient',
      },
      legend: {
        position: 'bottom',
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };
  }

  // Método para actualizar los datos de la gráfica
  updateChartData(companiesData: Company[], symbol: string): Partial<ChartOptions> {
    const taxTotals: { [key: string]: number } = {};

    companiesData.forEach((company) => {
      company.invoices.forEach((invoice) => {
        invoice.impuestoClaseItem.forEach((taxType, index) => {
          const taxValue = invoice.impuestoValorItemFormatted[index] || 0;
          taxTotals[taxType] = (taxTotals[taxType] || 0) + taxValue;
        });
      });
    });

    return {
      series: Object.values(taxTotals),
      labels: Object.keys(taxTotals),
      legend: {
        formatter: (val: string, opts: any) => {
          const value = opts.w.globals.series[opts.seriesIndex] || 0;
          return `${val} - ${symbol}${value.toFixed(2)}`;
        },
      },
    };
  }
}
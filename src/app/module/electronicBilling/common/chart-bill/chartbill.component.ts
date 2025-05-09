import {
  Input,
  OnDestroy,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { Company, COUNTRY_DETAILS } from '../../model/company.model';

import { Component, ViewChild } from "@angular/core";
import {
  ApexChart,
  ApexAxisChartSeries,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexGrid
} from "ng-apexcharts";
import { CurrencyService } from '../../services/CurrencyService';

type ApexXAxis = {
  type?: "category" | "datetime" | "numeric";
  categories?: any;
  labels?: {
    style?: {
      colors?: string | string[];
      fontSize?: string;
    };
  };
};

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  grid: ApexGrid;
  colors: string[];
  legend: ApexLegend;
};

@Component({
  selector: 'app-chartbill',
  imports: [NgApexchartsModule],
  standalone: true,
  templateUrl: './chartbill.component.html',
  styleUrl: './chartbill.component.scss'
})
export class ChartbillComponent implements OnChanges, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  @Input() selectedCountry: any = {};
  @Input() companiesData: Company[] = [];
  monedaObjetivo = 'USD';
  symbol = '$';

  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  constructor(
    private currencyService: CurrencyService,
  ) {
    this.initChart();
  }

  ngOnInit(): void {
    this.currencyService.selectedCurrency$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((currency) => {
        this.monedaObjetivo = currency;
        this.updateCurrencySymbol();
        this.updateChartData();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['companiesData'] && this.companiesData.length > 0) {
      this.updateChartData();
    }

    if (changes['companiesData'] && !changes['companiesData'].firstChange) {
      this.updateCurrencySymbol();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private initChart(): void {
    this.chartOptions = {
      series: [
        {
          name: "Total Facturado",
          data: [] // Inicializar como arreglo vacío
        }
      ],
      chart: {
        height: 350,
        type: "bar",
        events: {
          click: (chart, w, e) => {
            // Manejar clics en el gráfico si es necesario
          }
        }
      },
      colors: [
        "#008FFB",
        "#00E396",
        "#FEB019",
        "#FF4560",
        "#775DD0",
        "#546E7A",
        "#26a69a",
        "#D10CE8"
      ],
      plotOptions: {
        bar: {
          columnWidth: "70%",
          distributed: true,
        }
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        show: false
      },
      grid: {
        show: false
      },
      xaxis: {
        categories: [],
        labels: {
          style: {
            colors: [
              "#008FFB",
              "#00E396",
              "#FEB019",
              "#FF4560",
              "#775DD0",
              "#546E7A",
              "#26a69a",
              "#D10CE8"
            ],
            fontSize: "12px"
          }
        }
      }
    };
  }
  private updateChartData(): void {
    if (!this.companiesData || this.companiesData.length === 0) {
      return;
    }
  
    // Abreviar los nombres de las empresas
    const categories = this.companiesData.map(company => this.abbreviateName(company.registrationName, 15)); // 15 es la longitud máxima
    const data = this.companiesData.map(company => {
      // Asegurarse de que los valores sean mayores que cero
      return company.totalBilledConverted > 0 ? company.totalBilledConverted : 1; // Usar 1 si el valor es 0 o negativo
    });
  
    this.chartOptions.series = [
      {
        name: "Total Facturado",
        data: data // Mantener los valores como números
      }
    ];
  
    this.chartOptions.yaxis = {
      ...this.chartOptions.yaxis,
      logarithmic: true, // Habilitar escala logarítmica
      labels: {
        formatter: (value: number) => {
          return `${this.symbol} ${this.formatNumber(value)}`;
        },
        style: {
          fontSize: '10px', // Tamaño de la fuente más pequeño
          fontWeight: 300, // Grosor de la fuente más fino
          colors: '#666' // Color de la fuente (gris oscuro)
        }
      }
    };
  
    this.chartOptions.xaxis = {
      ...this.chartOptions.xaxis,
      categories: categories
    };
  }
  
  private abbreviateName(name: string, maxLength: number): string {
    // Si el nombre es más largo que la longitud máxima, acortarlo y agregar "..."
    if (name.length > maxLength) {
      return name.substring(0, maxLength) + '...';
    }
    return name;
  }
  
  private formatNumber(value: number): string {
    // Formatear el número con separadores de miles y dos decimales
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  
  private updateCurrencySymbol(): void {
    const countryData = COUNTRY_DETAILS[this.monedaObjetivo];
    if (countryData) {
      this.symbol = countryData.symbol;
    }
    this.updateChartData();
  }
}
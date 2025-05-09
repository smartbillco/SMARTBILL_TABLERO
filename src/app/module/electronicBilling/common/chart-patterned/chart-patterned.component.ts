import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexStroke,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexTooltip,
  ApexFill,
  ApexStates,
  NgApexchartsModule,
} from "ng-apexcharts";
import { Subject, takeUntil } from "rxjs";
import { Company, COUNTRY_DETAILS } from "../../model/company.model";
import { CurrencyService } from "../../services/CurrencyService";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  legend: ApexLegend;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  fill: ApexFill;
  states: ApexStates;
  title: ApexTitleSubtitle;
};

@Component({
  selector: "app-chart-patterned",
  imports: [NgApexchartsModule],
  standalone: true,
  templateUrl: "./chart-patterned.component.html",
  styleUrls: ["./chart-patterned.component.scss"],
})
export class ChartPatternedComponent implements OnChanges, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  @Input() selectedCountry: any = {};
  @Input() companiesData: Company[] = [];
  @Input() chartType: "bar" | "line" | "area" | "scatter" | "donut" = "bar";

  monedaObjetivo = "USD";
  symbol = "$";

  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  constructor(private currencyService: CurrencyService) {
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
    if (changes["companiesData"] && this.companiesData.length > 0) {
      this.updateChartData();
    }

    if (changes["companiesData"] && !changes["companiesData"].firstChange) {
      this.updateCurrencySymbol();
    }

      if (changes["chartType"]) {
        this.chartOptions.chart.type = this.chartType;
        if (this.chart) {
          this.chart.updateOptions(this.chartOptions);
        }
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
          name: "",
          data: [0],
        },
      ],

      chart: {
        type: this.chartType,
        height: 350,
        stacked: true,
        dropShadow: {
          enabled: true,
          blur: 1,
          opacity: 0.25,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: "60%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 2,
      },
      title: {
        text: "\u00A0\u00A0\u00A0 Estrategia de tus compras o Consumos",
        style: {
          color: "#808080",
        },
      },
      xaxis: {
        categories: [2025],
      },
      yaxis: {
        title: {
          text: undefined,
        },
      },
        /*tooltip: {
        shared: false,
        y: {
          formatter: function (val) {
            return val + "K";
          },
        },
      },
    */
      tooltip: {
        shared: false,
        theme: "light", 
        x: {
          formatter: (val, { dataPointIndex }) => {
            const year = this.chartOptions.xaxis.categories[dataPointIndex];
            const totalFacturado = this.getTotalFacturadoPorAnio(year);
            return `Total Fact. Año ${year}: ${this.formatNumber(totalFacturado)}`;
          },
        },
        y: {
          formatter: (val) => {
            return `<strong>Facturado:</strong> ${this.formatNumber(val)}<br>`;
          },
        },
        //position: "right", 
      },
      
      
      
      fill: {
        type: "pattern",
        opacity: 1,
      },
      states: {
        hover: {
          filter: {
            type: "none",
          },
        },
      },
      legend: {
        position: "right",
        offsetY: 40,
      },
    };
  }

  private abbreviateName(name: string, maxLength: number): string {
    // Si el nombre es más largo que la longitud máxima, acortarlo y agregar "..."
    if (name.length > maxLength) {
      return name.substring(0, maxLength) + "...";
    }
    return name;
  }

  private formatNumber(value: number): string {
    // Formatear el número con separadores de miles, dos decimales y el símbolo de la moneda
    return `${this.symbol} ${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  private updateCurrencySymbol(): void {
    const countryData = COUNTRY_DETAILS[this.monedaObjetivo];
    if (countryData) {
      this.symbol = countryData.symbol;
    }
    this.updateChartData();
  }

  private updateChartData(): void {
    if (this.companiesData.length === 0) {
      // Resetear las series y las categorías del eje X cuando no hay datos
      this.chartOptions.series = [];
      this.chartOptions.xaxis = {
        categories: [],
      };
  
      // Forzar la actualización del gráfico
      if (this.chart) {
        this.chart.updateOptions(this.chartOptions);
      }
      return;
    }
  
    // Paso 1: Extraer todos los años únicos de las facturas
    const allYears = new Set<number>();
    this.companiesData.forEach((company) => {
      company.invoices.forEach((invoice) => {
        const year = new Date(invoice.issueDate).getFullYear();
        allYears.add(year);
      });
    });
  
    // Convertir el Set de años a un array y ordenarlo
    const sortedYears = Array.from(allYears).sort((a, b) => a - b);
  
    // Paso 2: Crear las series para el gráfico
    const series: ApexAxisChartSeries = this.companiesData.map((company) => {
      // Inicializar un objeto para agrupar los montos por año
      const dataByYear: { [year: number]: number } = {};
  
      // Inicializar todos los años con un valor de 0
      sortedYears.forEach((year) => {
        dataByYear[year] = 0;
      });
  
      // Sumar los montos facturados por año
      company.invoices.forEach((invoice) => {
        const year = new Date(invoice.issueDate).getFullYear();
        dataByYear[year] += invoice.totalFacturaFormatted;
      });
  
      // Convertir el objeto a un array de valores en el orden de los años
      const data = sortedYears.map((year) => dataByYear[year]);
  
      return {
        name: this.abbreviateName(company.registrationName, 20), // Acortar el nombre si es necesario
        data: data, // Usar los montos agrupados por año
      };
    });
  
    // Paso 3: Actualizar las opciones del gráfico
    this.chartOptions.series = series;
  
    // Actualizar las categorías del eje X con los años
    this.chartOptions.xaxis = {
      categories: sortedYears.map((year) => year.toString()), // Convertir los años a strings
    };
  
    // Forzar la actualización del gráfico
    if (this.chart) {
      this.chart.updateOptions(this.chartOptions);
    }
  }

  private getTotalFacturadoPorAnio(year: string): number {
    let totalFacturado = 0;
  
    this.companiesData.forEach((company) => {
      company.invoices.forEach((invoice) => {

        // Convertir el año de la factura a string para compararlo con el año proporcionado
        const invoiceYear = new Date(invoice.issueDate).getFullYear().toString();
        //console.log(`Año en tooltip: ${year}, Año de factura: ${invoiceYear}`);
        if (invoiceYear === year) {
          totalFacturado += invoice.totalFacturaFormatted; 
        }
      });
    });
  
    console.log(`Total facturado en ${year}:`, totalFacturado); 
    return totalFacturado;
  }
}

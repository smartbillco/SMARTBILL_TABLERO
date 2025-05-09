import { Component, Input, ViewChild, OnChanges, SimpleChanges } from "@angular/core";
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexXAxis,
  ApexPlotOptions,
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
  xaxis: ApexXAxis;
};

@Component({
  selector: "app-chartbill-horiz",
  imports: [NgApexchartsModule],
  templateUrl: "./chartbill-horiz.component.html",
  styleUrl: "./chartbill-horiz.component.scss",
})
export class ChartbillHorizComponent implements OnChanges {
  private unsubscribe$ = new Subject<void>();
  @Input() selectedCountry: any = {};
  @Input() companiesData: Company[] = [];
  monedaObjetivo = "USD";
  symbol = "$";

  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

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
    if (changes['companiesData'] && this.companiesData) {
      this.updateChartData();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  constructor(private currencyService: CurrencyService) {
    this.chartOptions = {
      series: [
        {
          name: "basic",
          data: [],
        },
      ],
      chart: {
        type: "bar",
        height: 350,
      },
      plotOptions: {
        bar: {
          horizontal: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: [],
      },
    };
  }

  private abbreviateName(name: string, maxLength: number): string {
    if (name.length > maxLength) {
      return name.substring(0, maxLength) + '...';
    }
    return name;
  }

  private formatNumber(value: number): string {
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

  private updateChartData(): void {
    if (this.companiesData && this.companiesData.length > 0) {
      const categories = this.companiesData.map(company => this.abbreviateName(company.registrationName, 20));
      const data = this.companiesData.map(company => company.totalBilledConverted);

      this.chartOptions.series = [{
        name: "Total Billed",
        data: data,
      }];

      this.chartOptions.xaxis = {
        categories: categories,
      };
    }
  }
}
import {
  Component,
  Input,
  ViewChild,
  OnDestroy,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { Company, COUNTRY_DETAILS } from '../../model/company.model';
import { ChartOptions, ChartService } from '../../services/ChartService';
import { CurrencyService } from '../../services/CurrencyService';

@Component({
  selector: 'app-charttax',
  imports: [NgApexchartsModule],
  standalone: true,
  templateUrl: './charttax.component.html',
  styleUrl: './charttax.component.scss',
})
export class CharttaxComponent implements OnChanges, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  @Input() selectedCountry: any = {};
  @Input() companiesData: Company[] = [];
  monedaObjetivo = 'USD';
  symbol = '$';

  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  constructor(
    private currencyService: CurrencyService,
    private chartService: ChartService // Inyecta el servicio
  ) {
    // Inicializa las opciones de la gráfica usando el servicio
    this.chartOptions = this.chartService.initializeChartOptions();
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

  private updateChartData(): void {
    // Actualiza los datos de la gráfica usando el servicio
    const updatedOptions = this.chartService.updateChartData(
      this.companiesData,
      this.symbol
    );
    this.chartOptions = { ...this.chartOptions, ...updatedOptions };
  }

  private updateCurrencySymbol(): void {
    const countryData = COUNTRY_DETAILS[this.monedaObjetivo];
    if (countryData) {
      this.symbol = countryData.symbol;
    }
    this.updateChartData();
  }
}
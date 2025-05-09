import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import moment from "moment";
import {
  DaterangepickerDirective,
  NgxDaterangepickerMd,
} from "ngx-daterangepicker-material";
@Component({
  selector: "app-date-range-picker",
  templateUrl: "./date-range-picker.component.html",
  styleUrls: ["./date-range-picker.component.scss"],
  standalone: true,
  imports: [FormsModule, CommonModule, NgxDaterangepickerMd,],
  
})
export class DateRangePickerComponent {
  @Input() dateselected: { startDate: moment.Moment; endDate: moment.Moment };
  @Output() dateRangeChanged = new EventEmitter<{
    startDate: moment.Moment;
    endDate: moment.Moment;
  }>();

  alwaysShowCalendars = true;

  ranges = {
    Hoy: [moment(), moment()],
    Ayer: [moment().subtract(1, "days"), moment().subtract(1, "days")],
    "Últimos 7 Días": [moment().subtract(6, "days"), moment()],
    "Últimos 30 Días": [moment().subtract(29, "days"), moment()],
    "Este Mes": [moment().startOf("month"), moment().endOf("month")],
    "Mes Pasado": [
      moment().subtract(1, "month").startOf("month"),
      moment().subtract(1, "month").endOf("month"),
    ],
  };

  locale = {
    format: "D MMMM YYYY",
    separator: " - ",
    cancelLabel: "Cancelar",
    applyLabel: "Aplicar",
  };

  onDateRangeChange(e: any): void {
    this.dateRangeChanged.emit(e);
  }

  open(e): void {
    // Lógica para abrir el datepicker
  }
}
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from "@angular/core";
import { NgIf, NgClass } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { CurrencySelectorComponent } from "../../module/electronicBilling/common/currency-selector/currency-selector.component";
import { AppSettings } from "../../pages/service/app-settings.service";
import { NetworkStatusComponent } from "../../module/pages/network-status-component/network-status.component";

declare var slideToggle: any;

@Component({
  selector: "header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    ReactiveFormsModule,
    FormsModule,
    NetworkStatusComponent,
    CurrencySelectorComponent,
  ],
})
export class HeaderComponent implements OnDestroy {
  @Input() appSidebarTwo;
  @Output() appSidebarEndToggled = new EventEmitter<boolean>();
  @Output() appSidebarMobileToggled = new EventEmitter<boolean>();
  @Output() appSidebarEndMobileToggled = new EventEmitter<boolean>();

  constructor(
    public appSettings: AppSettings) { }

  toggleAppSidebarMobile() {
    this.appSidebarMobileToggled.emit(true);
  }

  toggleAppSidebarEnd() {
    this.appSidebarEndToggled.emit(true);
  }

  toggleAppSidebarEndMobile() {
    this.appSidebarEndMobileToggled.emit(true);
  }

  toggleAppTopMenuMobile() {
    var target = document.querySelector(".app-top-menu");
    if (target) {
      slideToggle(target);
    }
  }

  toggleAppHeaderMegaMenuMobile() {
    this.appSettings.appHeaderMegaMenuMobileToggled =
      !this.appSettings.appHeaderMegaMenuMobileToggled;
  }

  ngOnDestroy() {
    this.appSettings.appHeaderMegaMenuMobileToggled = false;
  }

}

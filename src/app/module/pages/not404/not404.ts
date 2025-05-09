import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppSettings } from '../../../pages/service/app-settings.service';

@Component({
	selector: 'error',
  templateUrl: './not404.html',
  standalone:true,
  imports: [RouterLink],
  styleUrl: './not404.css'

})

export class ErrorPage implements OnDestroy {
	constructor(public appSettings: AppSettings) {
    this.appSettings.appEmpty = true;
	}

  ngOnDestroy() {
    this.appSettings.appEmpty = false;
  }
}

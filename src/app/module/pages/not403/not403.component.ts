import { Component, OnDestroy } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { RouterLink } from '@angular/router';
import { AppSettings } from '../../../pages/service/app-settings.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-not403',
  imports: [RouterLink],
  templateUrl: './not403.component.html',
  styleUrls: ['./not403.component.scss'] 
})
export class Not403Component implements OnDestroy {
	constructor(public appSettings: AppSettings) {
    this.appSettings.appEmpty = false;
	}

  username: string;

  ngOnInit(): void {
      const helper = new JwtHelperService();
      const token = sessionStorage.getItem(environment.TOKEN_NAME);
      this.username = helper.decodeToken(token).sub;
  }

  ngOnDestroy() {
    this.appSettings.appEmpty = false;
  }
}

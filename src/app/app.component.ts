import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderInterceptor } from './interceptor/loader-interceptor'; 
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxSpinnerModule],

  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true,
    },
  ],
})
export class AppComponent {
  title = 'smartbill-frontend';
}
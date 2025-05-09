import { Component, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgForm } from '@angular/forms';
import 'lity';
import { CommonModule } from '@angular/common';
import { AppSettings } from '../service/app-settings.service';

@Component({
  selector: 'app-landing-pages',
  templateUrl: './landing-pages.component.html',
  styleUrl: './landing-pages.component.scss',
  standalone : true,
  imports: [
    CommonModule,
    RouterLink,
    ],})
export class LandingPagesComponent implements OnDestroy {
  constructor(private router: Router, public appSettings: AppSettings) {
    this.appSettings.appEmpty = true;
  }

  ngOnDestroy() {
    this.appSettings.appEmpty = false;
  }

  formSubmit(f: NgForm) {
    this.router.navigate(['']);
  }
  
  scrollToTarget(targetId: string) {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const scrollPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 72;
      window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
    }
  }
}

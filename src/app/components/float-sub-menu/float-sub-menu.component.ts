import { Component, Input, Output, EventEmitter } 		 from '@angular/core';
import { NgIf, NgFor, NgClass, NgTemplateOutlet } from '@angular/common';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { AppSettings } from '../../pages/service/app-settings.service';

declare var slideToggle: any;

@Component({
    selector: 'float-sub-menu',
    templateUrl: './float-sub-menu.component.html',
    standalone: true,
    imports: [NgIf, NgFor, RouterLinkActive, NgClass, NgTemplateOutlet, RouterLink]
})

export class FloatSubMenuComponent {
	@Input() menus;
	@Input() top;
	@Input() left;
	@Input() right;
	@Input() bottom;
	@Input() lineTop;
	@Input() lineBottom;
	@Input() arrowTop;
	@Input() arrowBottom;

	@Output() remainAppSidebarFloatSubMenu = new EventEmitter();
	@Output() hideAppSidebarFloatSubMenu = new EventEmitter();
	@Output() calculateFloatSubMenuPosition = new EventEmitter();
	
  constructor(public appSettings: AppSettings) {
  }

	expandCollapseSubmenu(e, currentMenu, allMenu, active) {
		e.preventDefault();
		var targetItem = (e.target).closest('.menu-item');
		var target = <HTMLElement>targetItem.querySelector('.menu-submenu');
		slideToggle(target);
		this.calculateFloatSubMenuPosition.emit();
	}

	remainMenu() {
	  this.remainAppSidebarFloatSubMenu.emit(true);
	}

	hideMenu() {
	  this.hideAppSidebarFloatSubMenu.emit(true);
	}
}

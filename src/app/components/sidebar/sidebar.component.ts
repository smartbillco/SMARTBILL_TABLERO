import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  ViewChild,
  AfterViewChecked,
} from "@angular/core";

import { slideUp } from "../../composables/slideUp";
import { slideToggle } from "../../composables/slideToggle";
import { NgClass, NgTemplateOutlet, NgIf, NgFor } from "@angular/common";
import { NgScrollbar } from "ngx-scrollbar";
import { RouterLinkActive, RouterLink, Router } from "@angular/router";
import { FloatSubMenuComponent } from "../float-sub-menu/float-sub-menu.component";
import { JwtHelperService } from "@auth0/angular-jwt";
import { environment } from "./../../../environments/environment";
import { firstValueFrom, tap } from "rxjs";

import { ChangeDetectorRef } from "@angular/core";
import { AppSettings } from "../../pages/service/app-settings.service";
import { AppMenuService } from "../../pages/service/app-menus.service";
import { AuthService } from "../../pages/service/auth.service";
import { UserService } from "../../module/user-management/service/user.service";

@Component({
  selector: "sidebar",
  templateUrl: "./sidebar.component.html",
  standalone: true,
  imports: [
    NgClass,
    NgScrollbar,
    NgTemplateOutlet,
    NgIf,
    NgFor,
    RouterLinkActive,
    RouterLink,
    FloatSubMenuComponent,
  ],
})
export class SidebarComponent implements AfterViewChecked {
  menus: any[] = [];
  profileImageUrl: string = "";
  username: string | null = "";
  userRol: string | null = "";

  @ViewChild("sidebarScrollbar", { static: false })
  private sidebarScrollbar: ElementRef;
  @Output() appSidebarMinifiedToggled = new EventEmitter<boolean>();
  @Output() hideMobileSidebar = new EventEmitter<boolean>();
  @Output() setPageFloatSubMenu = new EventEmitter();

  @Output() appSidebarMobileToggled = new EventEmitter<boolean>();
  @Input() appSidebarTransparent;
  @Input() appSidebarGrid;
  @Input() appSidebarFixed;
  @Input() appSidebarMinified;

  appSidebarFloatSubMenu;
  appSidebarFloatSubMenuHide;
  appSidebarFloatSubMenuHideTime = 250;
  appSidebarFloatSubMenuTop;
  appSidebarFloatSubMenuLeft = "60px";
  appSidebarFloatSubMenuRight;
  appSidebarFloatSubMenuBottom;
  appSidebarFloatSubMenuArrowTop;
  appSidebarFloatSubMenuArrowBottom;
  appSidebarFloatSubMenuLineTop;
  appSidebarFloatSubMenuLineBottom;
  appSidebarFloatSubMenuOffset;

  mobileMode;
  desktopMode;
  scrollTop;

  toggleNavProfile(e) {
    e.preventDefault();

    var targetSidebar = <HTMLElement>(
      document.querySelector(".app-sidebar:not(.app-sidebar-end)")
    );
    var targetMenu = e.target.closest(".menu-profile");
    var targetProfile = <HTMLElement>(
      document.querySelector("#appSidebarProfileMenu")
    );
    var expandTime =
      targetSidebar &&
      targetSidebar.getAttribute("data-disable-slide-animation")
        ? 0
        : 250;

    if (targetProfile && targetProfile.style) {
      if (targetProfile.style.display == "block") {
        targetMenu.classList.remove("active");
      } else {
        targetMenu.classList.add("active");
      }
      slideToggle(targetProfile, expandTime);
      targetProfile.classList.toggle("expand");
    }
  }

  toggleAppSidebarMinified() {
    this.appSidebarMinifiedToggled.emit(true);
    this.scrollTop = 40;
  }

  toggleAppSidebarMobile() {
    this.appSidebarMobileToggled.emit(true);
  }

  calculateAppSidebarFloatSubMenuPosition() {
    var targetTop = this.appSidebarFloatSubMenuOffset.top;
    var direction = document.body.style.direction;
    var windowHeight = window.innerHeight;

    setTimeout(() => {
      let targetElm = <HTMLElement>(
        document.querySelector(".app-sidebar-float-submenu-container")
      );
      let targetSidebar = <HTMLElement>document.getElementById("sidebar");
      var targetHeight = targetElm.offsetHeight;
      this.appSidebarFloatSubMenuRight = "auto";
      this.appSidebarFloatSubMenuLeft =
        this.appSidebarFloatSubMenuOffset.width +
        targetSidebar.offsetLeft +
        "px";

      if (windowHeight - targetTop > targetHeight) {
        this.appSidebarFloatSubMenuTop =
          this.appSidebarFloatSubMenuOffset.top + "px";
        this.appSidebarFloatSubMenuBottom = "auto";
        this.appSidebarFloatSubMenuArrowTop = "20px";
        this.appSidebarFloatSubMenuArrowBottom = "auto";
        this.appSidebarFloatSubMenuLineTop = "20px";
        this.appSidebarFloatSubMenuLineBottom = "auto";
      } else {
        this.appSidebarFloatSubMenuTop = "auto";
        this.appSidebarFloatSubMenuBottom = "0";

        var arrowBottom = windowHeight - targetTop - 21;
        this.appSidebarFloatSubMenuArrowTop = "auto";
        this.appSidebarFloatSubMenuArrowBottom = arrowBottom + "px";
        this.appSidebarFloatSubMenuLineTop = "20px";
        this.appSidebarFloatSubMenuLineBottom = arrowBottom + "px";
      }
    }, 0);
  }

  showAppSidebarFloatSubMenu(menu, e) {
    if (this.appSettings.appSidebarMinified) {
      clearTimeout(this.appSidebarFloatSubMenuHide);

      this.appSidebarFloatSubMenu = menu;
      this.appSidebarFloatSubMenuOffset = e.target.getBoundingClientRect();
      this.calculateAppSidebarFloatSubMenuPosition();
    }
  }

  hideAppSidebarFloatSubMenu() {
    this.appSidebarFloatSubMenuHide = setTimeout(() => {
      this.appSidebarFloatSubMenu = "";
    }, this.appSidebarFloatSubMenuHideTime);
  }

  remainAppSidebarFloatSubMenu() {
    clearTimeout(this.appSidebarFloatSubMenuHide);
  }

  appSidebarSearch(e: any) {
    var targetValue = e.target.value;
    targetValue = targetValue.toLowerCase();

    if (targetValue) {
      var elms = [].slice.call(
        document.querySelectorAll(
          ".app-sidebar:not(.app-sidebar-end) .menu > .menu-item:not(.menu-profile):not(.menu-header):not(.menu-search), .app-sidebar:not(.app-sidebar-end) .menu-submenu > .menu-item"
        )
      );
      if (elms) {
        elms.map(function (elm) {
          elm.classList.add("d-none");
        });
      }
      var elms = [].slice.call(
        document.querySelectorAll(
          ".app-sidebar:not(.app-sidebar-end) .has-text"
        )
      );
      if (elms) {
        elms.map(function (elm) {
          elm.classList.remove("has-text");
        });
      }
      var elms = [].slice.call(
        document.querySelectorAll(".app-sidebar:not(.app-sidebar-end) .expand")
      );
      if (elms) {
        elms.map(function (elm) {
          elm.classList.remove("expand");
        });
      }
      var elms = [].slice.call(
        document.querySelectorAll(
          ".app-sidebar:not(.app-sidebar-end) .menu > .menu-item:not(.menu-profile):not(.menu-header):not(.menu-search) > .menu-link, .app-sidebar .menu-submenu > .menu-item > .menu-link"
        )
      );
      if (elms) {
        elms.map(function (elm) {
          var targetText = elm.textContent;
          targetText = targetText.toLowerCase();
          if (targetText.search(targetValue) > -1) {
            var targetElm = elm.closest(".menu-item");
            if (targetElm) {
              targetElm.classList.remove("d-none");
              targetElm.classList.add("has-text");
            }

            var targetElm = elm.closest(".menu-item.has-sub");
            if (targetElm) {
              var targetElm = targetElm.querySelector(
                ".menu-submenu .menu-item.d-none"
              );
              if (targetElm) {
                targetElm.classList.remove("d-none");
              }
            }

            var targetElm = elm.closest(".menu-submenu");
            if (targetElm) {
              targetElm.style.display = "block";

              var targetElm = targetElm.querySelector(
                ".menu-item:not(.has-text)"
              );
              if (targetElm) {
                targetElm.classList.add("d-none");
              }

              var targetElm = elm.closest(".has-sub:not(.has-text)");
              if (targetElm) {
                targetElm.classList.remove("d-none");
                targetElm.classList.add("expand");

                var targetElm = targetElm.closest(".has-sub:not(.has-text)");
                if (targetElm) {
                  targetElm.classList.remove("d-none");
                  targetElm.classList.add("expand");
                }
              }
            }
          }
        });
      }
    } else {
      var elms = [].slice.call(
        document.querySelectorAll(
          ".app-sidebar:not(.app-sidebar-end) .menu > .menu-item:not(.menu-profile):not(.menu-header):not(.menu-search).has-sub .menu-submenu"
        )
      );
      if (elms) {
        elms.map(function (elm) {
          elm.removeAttribute("style");
        });
      }

      var elms = [].slice.call(
        document.querySelectorAll(
          ".app-sidebar:not(.app-sidebar-end) .menu > .menu-item:not(.menu-profile):not(.menu-header):not(.menu-search)"
        )
      );
      if (elms) {
        elms.map(function (elm) {
          elm.classList.remove("d-none");
        });
      }

      var elms = [].slice.call(
        document.querySelectorAll(
          ".app-sidebar:not(.app-sidebar-end) .menu-submenu > .menu-item"
        )
      );
      if (elms) {
        elms.map(function (elm) {
          elm.classList.remove("d-none");
        });
      }

      var elms = [].slice.call(
        document.querySelectorAll(".app-sidebar:not(.app-sidebar-end) .expand")
      );
      if (elms) {
        elms.map(function (elm) {
          elm.classList.remove("expand");
        });
      }
    }
  }

  @HostListener("scroll", ["$event"])
  onScroll(event) {
    this.scrollTop = this.appSettings.appSidebarMinified
      ? event.srcElement.scrollTop + 40
      : 0;
    if (typeof Storage !== "undefined") {
      localStorage.setItem("sidebarScroll", event.srcElement.scrollTop);
    }
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    if (window.innerWidth <= 767) {
      this.mobileMode = true;
      this.desktopMode = false;
    } else {
      this.mobileMode = false;
      this.desktopMode = true;
    }
  }

  ngAfterViewChecked() {
    if (typeof Storage !== "undefined" && localStorage.sidebarScroll) {
      if (this.sidebarScrollbar && this.sidebarScrollbar.nativeElement) {
        this.sidebarScrollbar.nativeElement.scrollTop =
          localStorage.sidebarScroll;
      }
    }
  }

  ngAfterViewInit() {
    var handleSidebarMenuToggle = function (menus, expandTime) {
      menus.map(function (menu) {
        menu.onclick = function (e) {
          e.preventDefault();
          var target = this.nextElementSibling;

          menus.map(function (m) {
            var otherTarget = m.nextElementSibling;
            if (otherTarget !== target) {
              slideUp(otherTarget, expandTime);
              otherTarget.closest(".menu-item").classList.remove("expand");
              otherTarget.closest(".menu-item").classList.add("closed");
            }
          });

          var targetItemElm = target.closest(".menu-item");

          if (
            targetItemElm.classList.contains("expand") ||
            (targetItemElm.classList.contains("active") &&
              !target.style.display)
          ) {
            targetItemElm.classList.remove("expand");
            targetItemElm.classList.add("closed");
            slideToggle(target, expandTime);
          } else {
            targetItemElm.classList.add("expand");
            targetItemElm.classList.remove("closed");
            slideToggle(target, expandTime);
          }
        };
      });
    };

    var targetSidebar = document.querySelector(
      ".app-sidebar:not(.app-sidebar-end)"
    );
    var expandTime =
      targetSidebar &&
      targetSidebar.getAttribute("data-disable-slide-animation")
        ? 0
        : 300;
    var disableAutoCollapse =
      targetSidebar && targetSidebar.getAttribute("data-disable-auto-collapse")
        ? 1
        : 0;

    var menuBaseSelector = ".app-sidebar .menu > .menu-item.has-sub";
    var submenuBaseSelector = " > .menu-submenu > .menu-item.has-sub";

    // menu
    var menuLinkSelector = menuBaseSelector + " > .menu-link";
    var menus = [].slice.call(document.querySelectorAll(menuLinkSelector));
    handleSidebarMenuToggle(menus, expandTime);

    // submenu lvl 1
    var submenuLvl1Selector = menuBaseSelector + submenuBaseSelector;
    var submenusLvl1 = [].slice.call(
      document.querySelectorAll(submenuLvl1Selector + " > .menu-link")
    );
    handleSidebarMenuToggle(submenusLvl1, expandTime);

    // submenu lvl 2
    var submenuLvl2Selector =
      menuBaseSelector + submenuBaseSelector + submenuBaseSelector;
    var submenusLvl2 = [].slice.call(
      document.querySelectorAll(submenuLvl2Selector + " > .menu-link")
    );
    handleSidebarMenuToggle(submenusLvl2, expandTime);
  }

  async ngOnInit() {
    const helper = new JwtHelperService();
    const token = sessionStorage.getItem(environment.TOKEN_NAME);

    if (token) {
      const decodedToken = helper.decodeToken(token);
      this.username = decodedToken.sub;
      this.userRol = decodedToken.role;

      if (this.username) {
        this.userService
          .getUserByUsername(this.username)
          .pipe(
            tap((response) => {
              if (response?.success && response?.data?.photo_url) {
                this.profileImageUrl = response.data.photo_url;
              } else {
                console.warn(
                  "⚠️ No se encontró la foto del usuario en BD. Usando imagen por defecto."
                );
                this.profileImageUrl = "assets/img/user/user-1.jpg";
              }
            })
          )
          .subscribe();
      }
    } else {
      console.error("Token no encontrado");
    }

    // Cargar el menu estatico para pruebas
    //this.menus = this.appMenuService.getAppMenus();

    // Cargar los menús usando el servicio
    await this.loadMenus();
  }

  async loadMenus(): Promise<void> {
    try {
      const data = await firstValueFrom(
        this.appMenuService.getAppMenus2(this.username)
      );
      this.menus = this.appMenuService.filterMenus(data);
      //console.log("Menús filtrados:", JSON.stringify(this.menus, null, 2));
    } catch (error) {
      //console.error("Error al cargar los menús desde el servidor:", error);
      this.menus = this.appMenuService.getAppMenus(); // Cargar menús locales
      //console.log("Menús fuente local:", JSON.stringify(this.menus, null, 2));
    }
    this.cdr.detectChanges();
  }

  constructor(
    private eRef: ElementRef,
    public appSettings: AppSettings,
    private appMenuService: AppMenuService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private userService: UserService
  ) {
    if (window.innerWidth <= 767) {
      this.mobileMode = true;
      this.desktopMode = false;
    } else {
      this.mobileMode = false;
      this.desktopMode = true;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}

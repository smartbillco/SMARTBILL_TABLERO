import { Component,signal } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-network-status",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./network-status.component.html",
  styleUrls: ["./network-status.component.scss"],
})
export class NetworkStatusComponent  {
  isOnline = signal(navigator.onLine);

  constructor() {
    window.addEventListener('online', () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));
  }

}

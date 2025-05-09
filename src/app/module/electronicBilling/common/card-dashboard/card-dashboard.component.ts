import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-card-dashboard",
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: "./card-dashboard.component.html",
  styleUrl: "./card-dashboard.component.scss",
})
export class CardDashboardComponent {
  cards: any[] = [
    {
      title: "Card 1",
      image: "/assets/img/login-bg/login-bg-10-thumb.jpg",
    },
    {
      title: "Card 2",
      image: "/assets/img/login-bg/login-bg-7-thumb.jpg",
    },
  ];

  onCardClick(card: any) {
    alert("Tarjeta seleccionada:" + card.title);
  }
}

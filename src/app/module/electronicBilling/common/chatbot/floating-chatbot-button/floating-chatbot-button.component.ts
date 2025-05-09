import { Component, ElementRef, EventEmitter, HostListener, Output, Renderer2, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-floating-chatbot-button',
  templateUrl: './floating-chatbot-button.component.html',
  styleUrls: ['./floating-chatbot-button.component.scss']
})
export class FloatingChatbotButtonComponent implements AfterViewInit {

  @Output() toggleChat = new EventEmitter<void>(); 
  
  @ViewChild('chatbotButton', { static: false }) chatbotButton!: ElementRef;

  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;
  private startX = 0;
  private startY = 0;
  private dragThreshold = 5;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    setTimeout(() => {
      if (!this.chatbotButton || !this.chatbotButton.nativeElement) {
        console.error("Error: No se pudo obtener el botón del chatbot.");
      } else {
        //console.log("Botón del chatbot cargado correctamente:", this.chatbotButton.nativeElement);
      }
    }, 0);
  }

  startDrag(event: MouseEvent) {
    if (!this.chatbotButton) {
      console.error("Error: chatbotButton es undefined.");
      return;
    }

    const button = this.chatbotButton.nativeElement;

    this.isDragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.offsetX = event.clientX - button.offsetLeft;
    this.offsetY = event.clientY - button.offsetTop;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging && this.chatbotButton) {
      const button = this.chatbotButton.nativeElement;
      let x = event.clientX - this.offsetX;
      let y = event.clientY - this.offsetY;

      const maxX = window.innerWidth - button.offsetWidth;
      const maxY = window.innerHeight - button.offsetHeight;
      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(0, Math.min(y, maxY));

      this.renderer.setStyle(button, 'left', `${x}px`);
      this.renderer.setStyle(button, 'top', `${y}px`);
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.isDragging) {
      const deltaX = Math.abs(event.clientX - this.startX);
      const deltaY = Math.abs(event.clientY - this.startY);
  
      // Solo emitir evento si el movimiento fue menor al umbral (es decir, un clic real)
      if (deltaX < this.dragThreshold && deltaY < this.dragThreshold) {
        //console.log("Botón clickeado: emitiendo evento");
        this.toggleChat.emit();
      }
    }
    this.isDragging = false;
  }
  
}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingChatbotButtonComponent } from './floating-chatbot-button.component';

describe('FloatingChatbotButtonComponent', () => {
  let component: FloatingChatbotButtonComponent;
  let fixture: ComponentFixture<FloatingChatbotButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingChatbotButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloatingChatbotButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

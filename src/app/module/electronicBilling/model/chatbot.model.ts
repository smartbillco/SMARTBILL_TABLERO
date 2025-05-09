export interface ChatbotMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  userName: string;
  userPhoto: string;
  audioUrl?: string; // Propiedad opcional para la URL del audio
}
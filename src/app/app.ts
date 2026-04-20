import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AiHelpChatComponent } from './core/ai-help-chat/ai-help-chat.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AiHelpChatComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('SistemaDeFacturacion2');
}
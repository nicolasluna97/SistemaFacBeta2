import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AiHelpChatService } from './ai-help-chat.service';
import { AiHelpSource } from './ai-help-chat.models';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  sources?: AiHelpSource[];
}

@Component({
  selector: 'app-ai-help-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-help-chat.component.html',
  styleUrl: './ai-help-chat.component.css',
})
export class AiHelpChatComponent {
  private readonly aiHelpChatService = inject(AiHelpChatService);

  isOpen = signal(false);
  isLoading = signal(false);
  question = signal('');

  messages = signal<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hola. Soy el asistente de ayuda de la aplicación. Podés preguntarme cómo registrar una venta, cómo crear un cliente, cómo ver el stock o cómo consultar movimientos.',
    },
  ]);

  toggleChat(): void {
    this.isOpen.update((value) => !value);
  }

  closeChat(): void {
    this.isOpen.set(false);
  }

  sendMessage(): void {
    const value = this.question().trim();

    if (!value || this.isLoading()) {
      return;
    }

    this.messages.update((messages) => [
      ...messages,
      {
        role: 'user',
        text: value,
      },
    ]);

    this.question.set('');
    this.isLoading.set(true);

    this.aiHelpChatService
      .ask(value)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.messages.update((messages) => [
            ...messages,
            {
              role: 'assistant',
              text: response.answer,
              sources: response.sources,
            },
          ]);
        },
        error: () => {
          this.messages.update((messages) => [
            ...messages,
            {
              role: 'assistant',
              text: 'Ocurrió un error al consultar la ayuda. Intentá nuevamente en unos segundos.',
            },
          ]);
        },
      });
  }

  handleEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
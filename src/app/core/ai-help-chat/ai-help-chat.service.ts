import { Injectable, inject } from '@angular/core';
import { HttpClienc } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AiHelpChatResponse } from './ai-help-chat.models';

@Injectable({
  providedIn: 'root',
})
export class AiHelpChatService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = '/api/ai-help/chat';

  ask(question: string): Observable<AiHelpChatResponse> {
    return this.http.post<AiHelpChatResponse>(this.apiUrl, { question });
  }
}
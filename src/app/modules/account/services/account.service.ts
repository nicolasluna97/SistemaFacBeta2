import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AccountMe {
  id: string;
  email: string;
  fullName: string;
  verified: boolean;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseUrl}/account`;

  getMe(): Observable<AccountMe> {
    return this.http.get<AccountMe>(`${this.baseUrl}/me`);
  }

  updateProfile(payload: { fullName: string }): Observable<any> {
    // el backend espera { username }
    return this.http.patch<any>(`${this.baseUrl}/profile`, {
      username: payload.fullName,
    });
  }

  // ====== EMAIL ======

  requestEmailChange(payload: { newEmail: string }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/email/change-request`, payload);
  }

  confirmEmailChange(payload: {
    newEmail: string;
    code: string;
  }): Observable<{ email: string }> {
    return this.http.post<{ email: string }>(
      `${this.baseUrl}/email/change-confirm`,
      payload,
    );
  }

  resendEmailChangeCode(payload: { newEmail: string }): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/email/change-resend`,
      payload,
    );
  }

  // ====== PASSWORD ======

  changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.baseUrl}/password/change`,
      payload,
    );
  }
}

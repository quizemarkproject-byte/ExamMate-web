import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly USER_ID_KEY = 'app_user_id';

  constructor() {}

  getUserId(): string {
    let userId = localStorage.getItem(this.USER_ID_KEY);

    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem(this.USER_ID_KEY, userId);
    }

    return userId;
  }
}

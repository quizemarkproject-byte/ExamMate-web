import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly USER_ID_KEY = 'app_user_id';

  constructor() {}

  // getUserId(): string {
  //   let userId = localStorage.getItem(this.USER_ID_KEY);

  //   if (!userId) {
  //     userId = uuidv4();
  //     localStorage.setItem(this.USER_ID_KEY, userId);
  //   }

  //   return userId;
  // }
}

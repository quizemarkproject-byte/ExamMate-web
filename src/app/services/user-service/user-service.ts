import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../../environments/environment.production';
import { Observable } from 'rxjs';
import { UserModel } from '../../models/user-service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  private adminUserService = environment.backend_url + '/api/v1/admin/users';

  adminGetAllUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(this.adminUserService);
  }
}

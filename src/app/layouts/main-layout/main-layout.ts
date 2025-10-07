import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { SideBar } from '../../components/side-bar/side-bar';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [RouterModule, Header, SideBar],
  templateUrl: './main-layout.html',
})
export class MainLayout {

}

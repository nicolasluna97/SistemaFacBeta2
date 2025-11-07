import { Component } from '@angular/core';
import { Sidenav } from "../sidenav/sidenav";
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-home',
  imports: [Sidenav, Navbar],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {

}

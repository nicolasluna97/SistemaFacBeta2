import { Component } from '@angular/core';
import { Sidenav } from '../../../core/sidenav/sidenav';
import { Navbar } from '../../../core/navbar/navbar';

@Component({
  selector: 'app-sales.component',
  imports: [Sidenav, Navbar],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent {

}

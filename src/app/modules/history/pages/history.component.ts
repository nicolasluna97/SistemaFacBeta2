import { Component } from '@angular/core';
import { Sidenav } from '../../../core/sidenav/sidenav';
import { Navbar } from '../../../core/navbar/navbar';

@Component({
  selector: 'app-history.component',
  imports: [Sidenav, Navbar],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent {

}

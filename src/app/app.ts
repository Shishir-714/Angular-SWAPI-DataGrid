import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ShowStarshipResponse } from "./show-starship-response/show-starship-response";

@Component({
  selector: 'app-root',
  imports: [ShowStarshipResponse],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('SWAPI_Starships');
}

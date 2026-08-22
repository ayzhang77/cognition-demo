import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navigation } from './layout/navigation';
import { UserSwitcher } from './layout/user-switcher';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navigation, UserSwitcher],
  templateUrl: './app.html',
})
export class App {}

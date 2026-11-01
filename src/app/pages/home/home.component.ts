import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { IconComponent } from '../../components/icon/icon.component';
import { SessionService } from '../../core/session.service';
import { HOME_SECTIONS } from './home-sections';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, AppShellComponent, IconComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly sections = HOME_SECTIONS;
  readonly firstName = inject(SessionService).firstName;
}

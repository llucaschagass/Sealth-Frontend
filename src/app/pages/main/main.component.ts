import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';
import { LogoComponent } from '../../components/logo/logo.component';
import { ABOUT_TEXT, CONTACT, SERVICES } from './main-content';

@Component({
  selector: 'app-main',
  imports: [RouterLink, LogoComponent, IconComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  readonly services = SERVICES;
  readonly contact = CONTACT;
  readonly aboutText = ABOUT_TEXT;
  readonly year = new Date().getFullYear();
}

import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { IconComponent } from '../../components/icon/icon.component';
import { INFO_ARTICLES } from './info-articles';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [NgOptimizedImage, AppShellComponent, IconComponent],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss',
})
export class InfoComponent {
  readonly articles = INFO_ARTICLES;

  imageSrc(name: string): string {
    return `/assets/images/info/${name}.webp`;
  }
}

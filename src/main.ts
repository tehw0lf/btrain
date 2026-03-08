import { provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {...appConfig, providers: [provideZoneChangeDetection(), ...appConfig.providers]}).catch((err) =>
  console.error(err)
);

window.addEventListener('message', (e) => {
  if (e.origin !== 'https://tehwolf.de') return;
  if (e.data?.type !== 'theme') return;
  document.body.classList.toggle('dark', e.data.theme === 'dark');
});

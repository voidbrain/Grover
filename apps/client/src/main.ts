import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));

// Installable app (F-019): the service worker keeps the app's own files, never the hub's data. Not in development,
// where the dev server's files change on every save.
if (!isDevMode() && 'serviceWorker' in navigator)
  navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('service worker not registered', err));

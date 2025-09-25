import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([], withComponentInputBinding()),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(FormsModule),
  ],
}).catch((err) => console.error(err));
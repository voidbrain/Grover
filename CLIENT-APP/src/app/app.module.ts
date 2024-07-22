import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { Device } from '@ionic-native/device';
import { AppVersion } from '@ionic-native/app-version';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { BrowserModule } from '@angular/platform-browser';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule, Storage } from '@ionic/storage';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import {MomentModule} from 'angular2-moment';


import { DbProvider } from '../providers/providers';

import { LocalNotifications } from '@ionic-native/local-notifications';
import { Network } from '@ionic-native/network';
import { PipesModule } from '../pipes/pipes.module';
import { Connectivity } from '../providers/connectivity';
//import { ProgressBarComponent } from '../components/progress-bar/progress-bar';
import { MyApp } from './app.component';

// The translate loader needs to know where to load i18n files
// in Ionic's static asset pipeline.
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// export function provideSettings(storage: Storage) {
//   *
//    * The Settings provider takes a set of default settings for your app.
//    *
//    * You can add new settings options at any time. Once the settings are saved,
//    * these values will not overwrite the saved values (this can be done manually if desired).
   
//   return new Settings(storage, { option1: 0 });
// }

@NgModule({
  declarations: [
    MyApp
    //DetailComponent,
    
  ],
  imports: [
    BrowserModule,
    PipesModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot(MyApp),
    MomentModule,
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    
  ],
  providers: [
    DbProvider,
    Device,
    AppVersion,
    InAppBrowser,
    SplashScreen,
    StatusBar,
    LocalNotifications,
    Network,
    Connectivity,
    //{ provide: Settings, useFactory: provideSettings, deps: [Storage] },
    // Keep this to enable Ionic's runtime error handling during development
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }

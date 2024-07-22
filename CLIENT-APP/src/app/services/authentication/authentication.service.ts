import { Platform }        from '@ionic/angular';
import { Injectable }      from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SettingsService } from '../settings/settings.service';
 
const TOKEN_KEY = 'auth-token';
 
@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
 
    authenticationState = new BehaviorSubject(false);

    constructor(
        private plt: Platform,
        private appSettings: SettingsService,
    ) { 
        this.plt.ready().then(() => {
            this.checkToken();
        });
    }

    checkToken() {
        let res = localStorage.getItem(this.appSettings.appName+'_'+TOKEN_KEY);
        if (res) {
            this.authenticationState.next(true);
        }
    }

    login() {
        localStorage.setItem(this.appSettings.appName+'_'+TOKEN_KEY, 'Bearer 1234567');
        return this.authenticationState.next(true);
    }

    logout() {
        localStorage.removeItem(this.appSettings.appName+'_'+TOKEN_KEY);
        return this.authenticationState.next(false);
    }

    isAuthenticated() {
        return this.authenticationState.value;
    }
 
}
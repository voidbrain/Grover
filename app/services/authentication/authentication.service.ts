import { SettingsService } from '../settings/settings.service';

const TOKEN_KEY = 'auth-token';

export class AuthenticationService {

    authenticationState;

    constructor(
        private appSettings: SettingsService,
    ) {
        this.checkToken();
    }

    checkToken() {
        const res = localStorage.getItem(this.appSettings.appName+'_'+TOKEN_KEY);
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

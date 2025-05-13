const TOKEN_KEY = "auth-token";
export class AuthenticationService {
    constructor(settings) {
        this.settings = settings;
        this.checkToken();
    }
    checkToken() {
        const res = localStorage.getItem(this.settings.getAppName() + "_" + TOKEN_KEY);
        if (res) {
            this.authenticationState.next(true);
        }
    }
    login() {
        localStorage.setItem(this.settings.getAppName() + "_" + TOKEN_KEY, "Bearer 1234567");
        return this.authenticationState.next(true);
    }
    logout() {
        localStorage.removeItem(this.settings.getAppName() + "_" + TOKEN_KEY);
        return this.authenticationState.next(false);
    }
    isAuthenticated() {
        return this.authenticationState.value;
    }
}

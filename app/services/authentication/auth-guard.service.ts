import { AuthenticationService } from './authentication.service';

export class AuthGuardService {
    constructor(public auth: AuthenticationService) {} 
    // canActivate(): boolean {
    //     return this.auth.isAuthenticated();
    // }
}

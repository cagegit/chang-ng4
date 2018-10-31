import {AuthGuard} from "../auth-guard.service";
import {AuthService} from "../auth.service";


export const authProviders = [
  AuthGuard,
  AuthService
];



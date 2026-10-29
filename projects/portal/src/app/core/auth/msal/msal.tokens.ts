import { InjectionToken } from '@angular/core';
import { type IPublicClientApplication } from '@azure/msal-browser';

/** The MSAL client (PublicClientApplication). Only exists in the MsalLoader injector. */
export const MSAL = new InjectionToken<IPublicClientApplication>('MSAL');

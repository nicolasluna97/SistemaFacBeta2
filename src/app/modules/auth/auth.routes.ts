import { Routes } from "@angular/router";
import {AuthLayoutComponent } from "./layout/auth-layout/auth-layout";
import { LoginComponent } from "./pages/login/login.component";
import { RegisterPageComponent } from "./pages/register-page.component/register-page.component";



export const authRoutes: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            {
            path: 'login',
            component: LoginComponent
            },
            {
            path: 'register',
            component: RegisterPageComponent
            },
            {
            path: '**',
            redirectTo: 'login'
            },
        ],
    },
];

export default authRoutes;
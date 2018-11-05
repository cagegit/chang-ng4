import './rxjs-extensions';
/*
 * Platform and Environment providers/directives/pipes
 */
import { environment } from 'environments/environment';
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule, BrowserXhr } from '@angular/http';
import { LoginComponent } from './login/login.component';
import { LoginDomainComponent } from './login/login-domain.component';
import { DashboardService } from './common/service/dashboard.service';
import { LogService } from './common/service/log.service';
import { LogRecentlyComponent } from './home/log.recently.component';
import { AppWebSocketService } from './common/service/app.websocket.service';
import { MessageListComponent } from './message/message-list.component';
import { ErrorPageComponent } from './error/error-page.component';
import { CommonErrorHandler } from './common/CommonErrorHandler';
import { AppComponent } from './app.component';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { AppState, InternalStateType } from './app.service';
import { HomeComponent } from './home/home.component';
import { NoContentModule } from './common/module/no-content.module';
import { AppContext } from './common/AppContext';
import { AppNotification } from './app.notification';
import { AppRightComponent } from './common/module/app-right/app-right.component';
import { TenantComponent } from './tenant/TenantComponent';
import { MainComponent } from './main/main.component';
import { CookieModule } from 'ngx-cookie';
import { NgProgressModule, NgProgressBrowserXhr } from 'ngx-progressbar';
import { RegModule } from './module/reg';
import { GridsterModule } from './gridster/gridster.module';
import { SharedModule } from './common/module/shared.module';
import { TableRelationModule } from './module/relation/tableRelation.module';
import { AuthService } from './auth.service';
import { appRoutingProviders, routing } from './app.routing';
import { ModalModule } from 'ngx-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ContactComponent } from './contact';
import { WelcomeComponent } from './module/welcome/welcome.component';
import { LayoutModule } from './layout/layout.module';
import { ChangModule } from './changan/chang.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LocationStrategy, PathLocationStrategy, HashLocationStrategy } from '@angular/common';
import { DataCenterModule } from './module/data-center/data-center.module';
import { LoginLocalComponent } from './login/login-local.component';
import { HttpClientInterceptor } from './common/http-client.interceptor';
import { CarSearchComponent } from './changan/car-activity/car-search.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { DataHandleService } from './changan/data.handle.service';
// import { ENV_PROVIDERS } from './environment';

const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState,
  AppContext,
  AppNotification,
  LogService,
  DashboardService,
  AppWebSocketService,
  AuthService
];

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};
export  const strategy1 = {provide: LocationStrategy, useClass: PathLocationStrategy};
export  const strategy2 = {provide: LocationStrategy, useClass: HashLocationStrategy};
/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [
    AppComponent,
    // NoContentComponent,
    LoginComponent,
    LoginDomainComponent,
    LoginLocalComponent,
    MainComponent,
    HomeComponent,
    TenantComponent,
    LogRecentlyComponent, 
    MessageListComponent,
    ErrorPageComponent,
    AppRightComponent,
    ContactComponent,
    WelcomeComponent,
    CarSearchComponent
  ],
  imports: [ // import Angular's modules
    BrowserAnimationsModule,
    LayoutModule,
    BrowserModule,
    HttpModule,
    HttpClientModule,
    ModalModule.forRoot(),
    // RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules }),
    RegModule,
    routing,
    SharedModule,
    NoContentModule,
    TableRelationModule,
    GridsterModule,
    NgProgressModule,
    ChangModule,
    DataCenterModule,
    NgZorroAntdModule,
    CookieModule.forRoot()
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    appRoutingProviders,
    environment.ENV_PROVIDERS,
    APP_PROVIDERS,
    DataHandleService,
    { provide: BrowserXhr, useClass: NgProgressBrowserXhr },
    { provide: ErrorHandler, useClass: CommonErrorHandler },
    ENV === 'development' ? strategy2 : strategy1,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpClientInterceptor,
      multi: true
    }
  ]
})
export class AppModule {}

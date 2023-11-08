import { waitForAsync, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SendMaterialComponent } from './send-material.component';
import {
    AlertModule,
    CloudAppEventsService,
    CloudAppConfigService,
    MaterialModule,
    AlertService
} from '@exlibris/exl-cloudapp-angular-lib';
import {BrowserModule, By} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {AppRoutingModule} from "../app-routing.module";
import {HttpClientModule} from "@angular/common/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CONFIG, EMPTY_CONFIG, INIT_DATA} from "../shared/test-data";
import {of} from "rxjs";
import {MainComponent} from "../main/main.component";
describe('SendMaterialComponent', () => {
    let component: SendMaterialComponent;
    let fixture: ComponentFixture<SendMaterialComponent>;
    let eventsService: CloudAppEventsService;
    let configService: CloudAppConfigService;
    let alertService: AlertService;
    let spyEvent: jasmine.Spy;
    let spyConfig: jasmine.Spy;
    let spyAlert: jasmine.Spy;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialModule,
                BrowserModule,
                BrowserAnimationsModule,
                AppRoutingModule,
                HttpClientModule,
                AlertModule,
                FormsModule,
                ReactiveFormsModule
            ],
            declarations: [ SendMaterialComponent ],
            providers: [
                CloudAppEventsService,
                CloudAppConfigService,
                AlertService
            ]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(SendMaterialComponent);
        component = fixture.componentInstance;

        component.deskConfig = CONFIG.desks[4];
        component.libCode= INIT_DATA.user.currentlyAtLibCode;
        component.institution= INIT_DATA.instCode;
        component.almaUrl= INIT_DATA.urls.alma;
        component.inputLabel= 'Barcode or field583x';
    });

    describe('should create ', () => {
        it('send component', () => {
            fixture.detectChanges();
            expect(component).toBeTruthy();
        });
    });

});
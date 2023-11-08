import { waitForAsync, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReceiveMaterialComponent } from './receive-material.component';
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
describe('ReceiveMaterialComponent', () => {
    let component: ReceiveMaterialComponent;
    let fixture: ComponentFixture<ReceiveMaterialComponent>;
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
            declarations: [ ReceiveMaterialComponent ],
            providers: [
                CloudAppEventsService,
                CloudAppConfigService,
                AlertService
            ]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(ReceiveMaterialComponent);
        component = fixture.componentInstance;

        component.deskConfig = CONFIG.desks[4];
        component.libCode= INIT_DATA.user.currentlyAtLibCode;
        component.institution= INIT_DATA.instCode;
        component.almaUrl= INIT_DATA.urls.alma;
        component.inputLabel= 'Barcode or field583x';
    });

    describe('should create ', () => {
        it('receive component', () => {
            fixture.detectChanges();
            expect(component).toBeTruthy();
        });
    });

    // describe('should input label ', () => {
    //     it('be "Barcode" if "useMarcField" is "false".', (() => {
    //         let config = CONFIG;
    //         config.desks[4].useMarcField = false;
    //         spyConfig.and.returnValue(of(config));
    //
    //         fixture.detectChanges();
    //
    //         expect(component.inputLabel).toBe(`Barcode`);
    //     }));
    //
    //     it('be "Barcode or field583x" if "useMarcField" is "true".', (() => {
    //         let config = CONFIG;
    //         config.desks[4].useMarcField = true;
    //         spyConfig.and.returnValue(of(config));
    //
    //         fixture.detectChanges();
    //
    //         expect(component.inputLabel).toBe(`Barcode or field583x`);
    //     }));
    // });
})
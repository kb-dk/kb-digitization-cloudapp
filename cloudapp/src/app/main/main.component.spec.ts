import { waitForAsync, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MainComponent } from './main.component';
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
import {Component} from "@angular/core";
describe('MainComponent', () => {
    let component: MainComponent;
    let fixture: ComponentFixture<MainComponent>;
    let eventsService: CloudAppEventsService;
    let configService: CloudAppConfigService;
    let alert: AlertService;
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
            declarations: [ MainComponent ],
            providers: [
                CloudAppEventsService,
                CloudAppConfigService,
                AlertService
            ]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(MainComponent);
        component = fixture.componentInstance;

        eventsService = fixture.debugElement.injector.get(CloudAppEventsService);
        spyEvent = spyOn<any>(eventsService, 'getInitData').and.callFake(() => {
            return of(INIT_DATA);
        });

        configService = fixture.debugElement.injector.get(CloudAppConfigService);
        spyConfig = spyOn<any>(configService, 'get').and.callFake(() => {
            return of(CONFIG);
        });

        alert = fixture.debugElement.injector.get(AlertService);
        spyAlert = spyOn<any>(alert, 'alert').and.callFake(() => {
            return of('');
        });
    });

    describe('should create ', () => {
        it('main component', () => {
            fixture.detectChanges();
            expect(component).toBeTruthy();
        });
    });

    describe('should show an alert with error if ', () => {

        it('desk is not chosen in Alma', () => {
            let init_data = INIT_DATA;
            init_data.user.currentlyAtDept = undefined;
            spyEvent.and.returnValue(of(init_data));

            fixture.detectChanges();

            expect(spyAlert).toHaveBeenCalled();
        });

        it('desk is not defined in App configuration', () => {
            let init_data = INIT_DATA;
            init_data.user.currentlyAtDept = 'NotDefinedInConfig';
            spyEvent.and.returnValue(of(init_data));

            fixture.detectChanges();

            expect(spyAlert).toHaveBeenCalled();
        });

        it('config is empty', () => {
            spyConfig.and.returnValue(of(EMPTY_CONFIG));

            fixture.detectChanges();

            expect(spyAlert).toHaveBeenCalled();
        });

    });

    describe('should input label ', () => {
        it('be "Barcode" if "useMarcField" is "false".', () => {
            let config = CONFIG;
            config.desks[4].useMarcField = false;
            spyConfig.and.returnValue(of(config));

            fixture.detectChanges();

            expect(component.inputLabel).toBe(`Barcode`);
        });

        it('be "Barcode or field583x" if "useMarcField" is "true".', () => {
            let config = CONFIG;
            config.desks[4].useMarcField = true;
            spyConfig.and.returnValue(of(config));

            fixture.detectChanges();

            expect(component.inputLabel).toBe(`Barcode or field583x`);
        });
    });
})
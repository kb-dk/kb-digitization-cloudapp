import {waitForAsync, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {MainComponent} from './main.component';
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
import {Component, NO_ERRORS_SCHEMA} from "@angular/core";
import {SendMaterialComponent} from "../send-material/send-material.component";
import {ReceiveMaterialComponent} from "../receive-material/receive-material.component";
import {DigitizationService} from "../shared/digitization.service";
import {Alert} from "@exlibris/exl-cloudapp-angular-lib/angular/ui/components/alerts/alert.model";

describe('MainComponent', () => {
    let component: MainComponent;
    let fixture: ComponentFixture<MainComponent>;
    let mockEventsService: CloudAppEventsService;
    let mockConfigService: CloudAppConfigService;
    let mockAlertService: AlertService;
    let spyEvent: jasmine.Spy;
    let spyConfig: jasmine.Spy;
    let spyAlertServiceError: jasmine.Spy;

    class FakeEventsService {
        getInitData = () => of(INIT_DATA);
    }

    class FakeConfigService {
        get = () => of(CONFIG);
    }

    class FakeAlertService {
        success = (message: string, options?: Partial<Alert>) => {};
        error = (message: string, options?: Partial<Alert>) => {};
    }

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
            declarations: [MainComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                {provide: CloudAppEventsService, useClass: FakeEventsService},
                {provide: CloudAppConfigService, useClass: FakeConfigService},
                {provide: AlertService, useClass: FakeAlertService}
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MainComponent);
        component = fixture.componentInstance;

        mockEventsService = fixture.debugElement.injector.get(CloudAppEventsService);
        spyEvent = spyOn<any>(mockEventsService, 'getInitData').and.callThrough();

        mockConfigService = fixture.debugElement.injector.get(CloudAppConfigService);
        spyConfig = spyOn<any>(mockConfigService, 'get').and.callThrough();

        mockAlertService = fixture.debugElement.injector.get(AlertService);
        spyAlertServiceError = spyOn<any>(mockAlertService, 'error').and.callThrough();
    });

    it('should create main component', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should show an alert with error if desk is not chosen in Alma', () => {
        let init_data = JSON.parse(JSON.stringify(INIT_DATA));
        init_data.user.currentlyAtDept = undefined;
        spyEvent.and.returnValue(of(init_data));

        fixture.detectChanges();

        expect(spyAlertServiceError).toHaveBeenCalledWith("Please select a Desk in Alma first.");
    });

    it('should show an alert with error if desk is not defined in App configuration', () => {
        let init_data = JSON.parse(JSON.stringify(INIT_DATA));
        init_data.user.currentlyAtDept = 'NotDefinedInConfig';
        spyEvent.and.returnValue(of(init_data));

        fixture.detectChanges();

        expect(spyAlertServiceError).toHaveBeenCalledWith('The desk you are at ( with desk code: "NotDefinedInConfig" ), is not defined in the app.');
    });

    it('should show an alert with error if config is empty', () => {
        spyConfig.and.returnValue(of(EMPTY_CONFIG));

        fixture.detectChanges();

        expect(spyAlertServiceError).toHaveBeenCalledWith("Please ask an Admin to configure this App.");
    });

    it('should input label be "Barcode" if "useMarcField" is "false".', () => {
        let config = JSON.parse(JSON.stringify(CONFIG));
        config.desks[4].useMarcField = false;
        spyConfig.and.returnValue(of(config));

        fixture.detectChanges();

        expect(component.inputLabel).toBe(`Barcode`);
    });

    it('should input label be "Barcode or field583x" if "useMarcField" is "true".', () => {
        let config = JSON.parse(JSON.stringify(CONFIG));
        config.desks[4].useMarcField = true;
        spyConfig.and.returnValue(of(config));

        fixture.detectChanges();

        expect(component.inputLabel).toBe(`Barcode or field583x`);
    });

    afterEach(() => {
        spyConfig.calls.reset();
        spyAlertServiceError.calls.reset();
        spyEvent.calls.reset();
    });
})
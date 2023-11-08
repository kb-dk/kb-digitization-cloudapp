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
describe('MainComponent', () => {
    let component: MainComponent;
    let fixture: ComponentFixture<MainComponent>;
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

        alertService = fixture.debugElement.injector.get(AlertService);
        spyAlert = spyOn<any>(alertService, 'alert').and.callFake(() => {
            return of('');
        });
    });

    describe('should create ', () => {
        it('main component', () => {
            fixture.detectChanges();
            expect(component).toBeTruthy();
        });
    });

    describe('should show a message if ', () => {
        it('config is empty', fakeAsync(() => {
            spyConfig.and.returnValue(of(EMPTY_CONFIG));
            fixture.detectChanges();

            const emptyConfigMessage = fixture.debugElement.query(By.css(".empty-config"));
            expect(emptyConfigMessage.nativeElement.innerText).toContain('Please ask an Admin to configure this App');
        }));
    });

    describe('should show an error message if ', () => {
        xit('desk is not chosen in Alma', fakeAsync(() => {
            // Problem with alertservice
            let init_data = INIT_DATA;
            init_data.user.currentlyAtDept = undefined;
            spyEvent.and.returnValue(of(init_data));
            fixture.detectChanges();

            const alertBox = fixture.debugElement.query(By.css(".alert-danger"));
            expect(alertBox?.nativeElement?.innerText).toContain('Please select a Desk in Alma first.');
        }));

        xit('desk is not defined in App configuration', fakeAsync(() => {
            // Problem with alertservice
            let init_data = INIT_DATA;
            init_data.user.currentlyAtDept = 'NotDefinedInConfig';
            spyEvent.and.returnValue(of(init_data));
            fixture.detectChanges();

            const alertBox = fixture.debugElement.query(By.css(".alert-danger"));
            expect(alertBox?.nativeElement?.innerText).toContain(`The desk you are at ( with desk code: "${init_data.user.currentlyAtDept}" ), is not defined in the app.`);
        }));
    });

    describe('should input label ', () => {
        it('be "Barcode" if "useMarcField" is "false".', (() => {
            let config = CONFIG;
            config.desks[4].useMarcField = false;
            spyConfig.and.returnValue(of(config));

            fixture.detectChanges();

            expect(component.inputLabel).toBe(`Barcode`);
        }));

        it('be "Barcode or field583x" if "useMarcField" is "true".', (() => {
            let config = CONFIG;
            config.desks[4].useMarcField = true;
            spyConfig.and.returnValue(of(config));

            fixture.detectChanges();

            expect(component.inputLabel).toBe(`Barcode or field583x`);
        }));
    });

})
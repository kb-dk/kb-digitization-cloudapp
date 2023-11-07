import { waitForAsync, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MainComponent } from './main.component';
import {AlertModule, CloudAppEventsService, CloudAppConfigService, MaterialModule} from '@exlibris/exl-cloudapp-angular-lib';
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
    let spyEvent: jasmine.Spy;
    let spyConfig: jasmine.Spy;

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
                CloudAppConfigService
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
        // fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show a message if config is empty', fakeAsync(() => {
        spyConfig.and.returnValue(of(EMPTY_CONFIG));
        fixture.detectChanges();

        const emptyConfigMessage = fixture.debugElement.query(By.css(".empty-config"));
        expect(emptyConfigMessage.nativeElement.innerText).toContain('Please ask an Admin to configure this App');
    }));
})
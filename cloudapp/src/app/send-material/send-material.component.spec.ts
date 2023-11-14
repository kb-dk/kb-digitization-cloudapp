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
import {
    CONFIG,
    DOD_ITEM_WITH_REQUEST,
    INIT_DATA,
    REQUEST_RESPONSE_DOD_WITH_REQUEST_AND_COMMENT,
    REQUEST_RESPONSE_DOD_WITHOUT_REQUEST,
    DOD_ITEM_WITHOUT_REQUEST,
    WORK_ORDER_ITEM_WITH_REQUEST,
    REQUEST_RESPONSE_WORK_ORDER_WITH_REQUEST_AND_COMMENT, REQUEST_RESPONSE_WORK_ORDER_WITHOUT_REQUEST
} from "../shared/test-data";
import {of, Subject} from "rxjs";
import {MainComponent} from "../main/main.component";
import {AlmaService} from "../shared/alma.service";
import {MatDialog} from "@angular/material/dialog";
describe('SendMaterialComponent', () => {
    let component: SendMaterialComponent;
    let fixture: ComponentFixture<SendMaterialComponent>;

    let mockAlmaService: AlmaService;
    let spyAlmaServiceGetItemFromAlma: jasmine.Spy;
    let spyAlmaServiceGetField583x: jasmine.Spy;
    let spyAlmaServiceGetRequestsFromItem: jasmine.Spy;

    let mockAlertService: AlertService;
    let SpyAlertServiceAlert: jasmine.Spy;

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
                AlmaService,
                AlertService,
                MatDialog
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SendMaterialComponent);
        component = fixture.componentInstance;

        mockAlmaService = fixture.debugElement.injector.get(AlmaService);

        mockAlertService = fixture.debugElement.injector.get(AlertService);
        SpyAlertServiceAlert = spyOn<any>(mockAlertService, 'alert').and.callFake(() => {
            return of('alert');
        });
        spyOn<any>(mockAlertService, 'success').and.callFake(() => {
            return of('success');
        });

        component.institution= INIT_DATA.instCode;
        component.almaUrl= INIT_DATA.urls.alma;

    });

    describe('should create ', () => {
        it('send component', () => {
            component.deskConfig = CONFIG.desks[4];
            component.libCode= INIT_DATA.user.currentlyAtLibCode;
            component.inputLabel= 'Barcode or field583x';

            fixture.detectChanges();
            expect(component).toBeTruthy();
        });
    });

    describe('DOD: ', () => {

        beforeEach(() => {

            component.deskConfig = CONFIG.desks[2];
            component.libCode= "DIGINAT";
            component.inputLabel= 'Barcode';

            spyAlmaServiceGetField583x = spyOn<any>(mockAlmaService, 'getField583x').and.callFake(() => {
                return of('');
            });
            fixture.detectChanges();
        })

        it('should not fail when there is at least one request:', () => {
            spyAlmaServiceGetItemFromAlma = spyOn<any>(mockAlmaService, 'getItemFromAlma').and.callFake(() => {
                return of(DOD_ITEM_WITH_REQUEST);
            });
            spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.callFake(() => {
                return of(REQUEST_RESPONSE_DOD_WITH_REQUEST_AND_COMMENT);
            });

            const inputBox = fixture.debugElement.nativeElement.querySelector("input");
            const sendButton = fixture.debugElement.nativeElement.querySelector("#send");
            inputBox.value = "KB756571";
            sendButton.click();

            fixture.detectChanges();

            expect(SpyAlertServiceAlert).not.toHaveBeenCalledWith(jasmine.objectContaining({ message: 'There is no request on this item!' }));
        });

        it('should throw error if there is no request:', () => {
            spyAlmaServiceGetItemFromAlma = spyOn<any>(mockAlmaService, 'getItemFromAlma').and.callFake(() => {
                return of(DOD_ITEM_WITHOUT_REQUEST);
            });
            spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.callFake(() => {
                return of(REQUEST_RESPONSE_DOD_WITHOUT_REQUEST);
            });

            const inputBox = fixture.debugElement.nativeElement.querySelector("input");
            const sendButton = fixture.debugElement.nativeElement.querySelector("#send");
            inputBox.value = "KB759030";
            sendButton.click();

            fixture.detectChanges();

            expect(SpyAlertServiceAlert).toHaveBeenCalledWith(jasmine.objectContaining({ message: 'There is no request on this item!' }));
        });

        it("should throw error if current desk is not matching destination department of the request (if there is a request) .", () => {
            spyAlmaServiceGetItemFromAlma = spyOn<any>(mockAlmaService, 'getItemFromAlma').and.callFake(() => {
                return of(WORK_ORDER_ITEM_WITH_REQUEST);
            });
            spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.callFake(() => {
                return of(REQUEST_RESPONSE_WORK_ORDER_WITH_REQUEST_AND_COMMENT);
            });

            const inputBox = fixture.debugElement.nativeElement.querySelector("input");
            const sendButton = fixture.debugElement.nativeElement.querySelector("#send");
            inputBox.value = "400021689597";
            sendButton.click();

            fixture.detectChanges();

            expect(SpyAlertServiceAlert).toHaveBeenCalledWith(jasmine.objectContaining({ message: "Desk code (The Black Diamond, Copenhagen - Nationalbibliotekets digitalisering) doesn't match destination department of the request (Lindhardt og Ringhof uden Alma publicering_10068)." }));
        });

        it("should show a confirm-dialog box if there is a comment", () => {
            spyAlmaServiceGetItemFromAlma = spyOn<any>(mockAlmaService, 'getItemFromAlma').and.callFake(() => {
                return of(DOD_ITEM_WITH_REQUEST);
            });
            spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.callFake(() => {
                return of(REQUEST_RESPONSE_DOD_WITH_REQUEST_AND_COMMENT);
            });
            let mockDialogService: MatDialog = fixture.debugElement.injector.get(MatDialog);
            let SpyDialogService: jasmine.Spy = spyOn<any>(mockDialogService, 'open').and.callFake(() => {
                return of('opened');
            });
            component.checkComments = true;
            const inputBox = fixture.debugElement.nativeElement.querySelector("input");
            const sendButton = fixture.debugElement.nativeElement.querySelector("#send");
            inputBox.value = "KB756571";
            sendButton.click();

            fixture.detectChanges();

            expect(SpyDialogService).toHaveBeenCalled();
        });
    });

    describe("Work orders: ", () => {

        beforeEach(() => {
            component.deskConfig = CONFIG.desks[1];
            component.libCode= "Digiproj_10068";
            component.inputLabel= 'Barcode';

            spyAlmaServiceGetField583x = spyOn<any>(mockAlmaService, 'getField583x').and.callFake(() => {
                return of('');
            });

            fixture.detectChanges();
        })

        it("should throw error if current desk is not matching destination department of the request (if there is a request) .", () => {
            spyAlmaServiceGetItemFromAlma = spyOn<any>(mockAlmaService, 'getItemFromAlma').and.callFake(() => {
                return of(DOD_ITEM_WITH_REQUEST);
            });
            spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.callFake(() => {
                return of(REQUEST_RESPONSE_DOD_WITH_REQUEST_AND_COMMENT);
            });

            const inputBox = fixture.debugElement.nativeElement.querySelector("input");
            const sendButton = fixture.debugElement.nativeElement.querySelector("#send");
            inputBox.value = "400021689597";
            sendButton.click();

            fixture.detectChanges();

            expect(SpyAlertServiceAlert).toHaveBeenCalledWith(jasmine.objectContaining({ message: "Desk code (Lindhardt og Ringhof uden Alma publicering_10068) doesn't match destination department of the request (Nationalbibliotekets digitalisering)." }));
        });

        it("should show a confirm-dialog box if there is a comment", () => {
            spyAlmaServiceGetItemFromAlma = spyOn<any>(mockAlmaService, 'getItemFromAlma').and.callFake(() => {
                return of(WORK_ORDER_ITEM_WITH_REQUEST);
            });
            spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.callFake(() => {
                return of(REQUEST_RESPONSE_WORK_ORDER_WITH_REQUEST_AND_COMMENT);
            });
            let mockDialogService: MatDialog = fixture.debugElement.injector.get(MatDialog);
            let SpyDialogService: jasmine.Spy = spyOn<any>(mockDialogService, 'open').and.callFake(() => {
                return of('opened');
            });
            component.checkComments = true;
            const inputBox = fixture.debugElement.nativeElement.querySelector("input");
            const sendButton = fixture.debugElement.nativeElement.querySelector("#send");
            inputBox.value = "KB756571";
            sendButton.click();

            fixture.detectChanges();

            expect(SpyDialogService).toHaveBeenCalled();
        });
    });
});
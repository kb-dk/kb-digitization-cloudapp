import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { SendMaterialComponent } from './send-material.component';
import {
    AlertModule,
    MaterialModule,
    AlertService
} from '@exlibris/exl-cloudapp-angular-lib';
import {BrowserModule} from "@angular/platform-browser";
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
    REQUEST_RESPONSE_WORK_ORDER_WITH_REQUEST_AND_COMMENT,
    REQUEST_RESPONSE_WORK_ORDER_WITHOUT_REQUEST,
    MAESTRO_CREATED_RECORD_BEFORE_NEXT_STEP,
    MAESTRO_CREATED_RECORD_AFTER_NEXT_STEP,
    DOD_ITEM_WITH_REQUEST_AFTER_SCANNING
} from "../shared/test-data";
import {Observable, of} from "rxjs";
import {AlmaService} from "../shared/alma.service";
import {MatDialog} from "@angular/material/dialog";
import {DigitizationService} from "../shared/digitization.service";
import {Alert} from "@exlibris/exl-cloudapp-angular-lib/angular/ui/components/alerts/alert.model";
import {NO_ERRORS_SCHEMA} from "@angular/core";
describe('SendMaterialComponent', () => {
    let component: SendMaterialComponent;
    let fixture: ComponentFixture<SendMaterialComponent>;

    let spyAlmaServiceGetItemFromAlma: jasmine.Spy;
    let spyAlmaServiceGetRequestsFromItem: jasmine.Spy;

    let mockDigitizationService: DigitizationService;
    let spyDigitizationServiceSend: jasmine.Spy;
    let spyDigitizationServiceCheck: jasmine.Spy;
    let spyDigitizationServiceCallApi: jasmine.Spy;
    let spyDigitizationServiceGoToNextStep: jasmine.Spy;

    let stubAlertService: AlertService;
    let mockAlmaService: AlmaService;

    stubAlertService = jasmine.createSpyObj<AlertService>(
        // @ts-ignore
        'AlertService',
        {
            success: (alert: Alert) => { console.log('success');},
            error: (message: string, options?: Partial<Alert>) => { console.log('error')},
        }
    );

    class MockAlmaService{
            scanInItem = (itemLink: string, params: any): Observable<any> => { console.log(itemLink, params); return of('ok')};
            getField583x = (link) => { console.log('getField583x:', link); return of('')};
            getItemFromAlma = (useField583x, barcodeOrField583x, institution, almaUrl) => { console.log(useField583x, barcodeOrField583x, institution, almaUrl); return of('')};
            getRequestsFromItem = (link) => { console.log(link); return of('')};
            checkIfdeskCodeIsDestination = (request, deskCode): boolean => {
                if (request.user_request && request.user_request[0]?.target_destination?.value) {
                    return request.user_request[0]?.target_destination?.value === deskCode;
                }
                return true;
            }
            sendToDigi = (itemLink:string, library: string, department:string, work_order_type:string=null, institution: string) => {
                let params = {'op': 'scan','department' : department};
                if (work_order_type) {
                    params['work_order_type'] = work_order_type;
                    params['status'] = 'digitaliseret1';
                }
                if (!this.libraryEqualsInstitution(library, institution)) {
                    params['library'] = library;
                }
                return this.scanInItem(itemLink,params);
            }
            private libraryEqualsInstitution = (libCode: string, institution: string) => libCode === institution;

    }

    const stubDialogRef = {
        afterClosed: () => of(true)
    };

    const stubDialog = { open: () => stubDialogRef };

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
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                DigitizationService,
                {provide: AlertService, useValue: stubAlertService},
                {provide: AlmaService, useClass: MockAlmaService},
                { provide: MatDialog,  useValue: stubDialog }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SendMaterialComponent);
        component = fixture.componentInstance;

        mockAlmaService = fixture.debugElement.injector.get(AlmaService);

        mockDigitizationService = fixture.debugElement.injector.get(DigitizationService);
        spyDigitizationServiceSend = spyOn<any>(mockDigitizationService, 'send').and.callFake(() => {
            return of('{"message":"Add document ok"}');
        });
        spyDigitizationServiceCheck = spyOn<any>(mockDigitizationService, 'check').and.callFake(() => {
            return of(MAESTRO_CREATED_RECORD_BEFORE_NEXT_STEP);
        });

        spyDigitizationServiceGoToNextStep = spyOn<any>(mockDigitizationService, 'goToNextStep').and.callFake(() => {
            return of('{"message":"Action ok"}');
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

            fixture.detectChanges();
        })

        it('should not fail when there is at least one request:', () => {
            spyOn<any>(mockAlmaService, 'getItemFromAlma').and.returnValue(of(DOD_ITEM_WITH_REQUEST));
            spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.returnValue(of(REQUEST_RESPONSE_DOD_WITH_REQUEST_AND_COMMENT));

            const inputBox = fixture.debugElement.nativeElement.querySelector("input");
            const sendButton = fixture.debugElement.nativeElement.querySelector("#send");
            inputBox.value = "KB756571";
            sendButton.click();

            fixture.detectChanges();
            expect(stubAlertService.error).not.toHaveBeenCalledWith( 'There is no request on this item!');
        });

        it('should throw error if there is no request:', () => {
            spyOn<any>(mockAlmaService, 'getItemFromAlma').and.returnValue(of(DOD_ITEM_WITHOUT_REQUEST));
            spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.returnValue(of(REQUEST_RESPONSE_DOD_WITHOUT_REQUEST));

            const inputBox = fixture.debugElement.nativeElement.querySelector("input");
            const sendButton = fixture.debugElement.nativeElement.querySelector("#send");
            inputBox.value = "KB759030";
            sendButton.click();

            fixture.detectChanges();

            expect(stubAlertService.error).toHaveBeenCalledWith('There is no request on this item!');
        });

        it("should throw error if current desk is not matching destination department of the request (if there is a request) .", () => {

            spyOn<any>(mockAlmaService, 'getItemFromAlma').and.returnValue(of(WORK_ORDER_ITEM_WITH_REQUEST));
            spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.returnValue(of(REQUEST_RESPONSE_WORK_ORDER_WITH_REQUEST_AND_COMMENT));


            const inputBox = fixture.debugElement.nativeElement.querySelector("input");
            const sendButton = fixture.debugElement.nativeElement.querySelector("#send");
            inputBox.value = "400021689597";
            sendButton.click();

            fixture.detectChanges();

            expect(stubAlertService.error).toHaveBeenCalledWith("Desk code (The Black Diamond, Copenhagen - Nationalbibliotekets digitalisering) doesn't match destination department of the request (Lindhardt og Ringhof uden Alma publicering_10068)." );
        });

        it("should show a confirm-dialog box if there is a comment", () => {
            spyOn<any>(mockAlmaService, 'getItemFromAlma').and.returnValue(of(DOD_ITEM_WITH_REQUEST));
            spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.returnValue(of(REQUEST_RESPONSE_DOD_WITH_REQUEST_AND_COMMENT));

            let SpyDialogServiceOpen: jasmine.Spy = spyOn<any>(stubDialog, 'open');
            component.checkComments = true;
            const inputBox = fixture.debugElement.nativeElement.querySelector("input");
            const sendButton = fixture.debugElement.nativeElement.querySelector("#send");
            inputBox.value = "KB756571";
            sendButton.click();

            fixture.detectChanges();
            console.log(component);

            expect(SpyDialogServiceOpen).toHaveBeenCalled();
        });

        it("should change the item status from 'Item in place' to 'Not Available' after sending to Alma", () => {
            // Status cannot really be tested in a unit test, since it is something that
            // happens in the Alma with call for Scan-in api
            // We check that the API is called with the correct parameters

            spyOn<any>(mockAlmaService, 'getItemFromAlma').and.returnValue(of(DOD_ITEM_WITH_REQUEST));
            spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.returnValue(of(REQUEST_RESPONSE_DOD_WITH_REQUEST_AND_COMMENT));

            let SpyAlmaServiceScanInItem: jasmine.Spy = spyOn<any>(mockAlmaService, 'scanInItem');

            const inputBox = fixture.debugElement.nativeElement.querySelector("input");
            const sendButton = fixture.debugElement.nativeElement.querySelector("#send");
            inputBox.value = "KB756571";
            sendButton.click();

            fixture.detectChanges();

            expect(SpyAlmaServiceScanInItem).toHaveBeenCalledWith( '/almaws/v1/bibs/99124813044205763/holdings/222248397400005763/items/232248397380005763', Object({ op: 'scan', department: 'DIGINAT', library: 'DIGINAT' }));

        });

        afterEach(() => {
        });
    });

    describe("Work orders: ", () => {

        beforeEach(() => {
            component.deskConfig = CONFIG.desks[1];
            component.libCode= "Digiproj_10068";
            component.inputLabel= 'Barcode';

            spyAlmaServiceGetItemFromAlma = spyOn<any>(mockAlmaService, 'getItemFromAlma').and.returnValue(of(WORK_ORDER_ITEM_WITH_REQUEST));
            spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.returnValue(of(REQUEST_RESPONSE_WORK_ORDER_WITH_REQUEST_AND_COMMENT));

            fixture.detectChanges();
        })

        it("should throw error if current desk is not matching destination department of the request (if there is a request) .", () => {
            spyAlmaServiceGetItemFromAlma.and.returnValue(of(DOD_ITEM_WITH_REQUEST));
            spyAlmaServiceGetRequestsFromItem.and.returnValue(of(REQUEST_RESPONSE_DOD_WITH_REQUEST_AND_COMMENT));

            const inputBox = fixture.debugElement.nativeElement.querySelector("input");
            const sendButton = fixture.debugElement.nativeElement.querySelector("#send");
            inputBox.value = "400021689597";
            sendButton.click();

            fixture.detectChanges();

            expect(stubAlertService.error).toHaveBeenCalledWith("Desk code (Lindhardt og Ringhof uden Alma publicering_10068) doesn't match destination department of the request (Nationalbibliotekets digitalisering).");
        });

        it("should show a confirm-dialog box if there is a comment", () => {
            let SpyDialogServiceOpen: jasmine.Spy = spyOn<any>(stubDialog, 'open');
            component.checkComments = true;
            const inputBox = fixture.debugElement.nativeElement.querySelector("input");
            const sendButton = fixture.debugElement.nativeElement.querySelector("#send");
            inputBox.value = "KB756571";
            sendButton.click();

            fixture.detectChanges();

            expect(SpyDialogServiceOpen).toHaveBeenCalled();
        });

        it("should change the item status from 'Item in place' to 'Not Available' after sending to Alma", () => {
            // Status cannot really be tested in a unit test, since it is something that
            // happens in the Alma with call for Scan-in api
            // We check that the API is called with the correct parameters
            let SpyAlmaServiceScanInItem: jasmine.Spy = spyOn<any>(mockAlmaService, 'scanInItem');

            const inputBox = fixture.debugElement.nativeElement.querySelector("input");
            const sendButton = fixture.debugElement.nativeElement.querySelector("#send");
            inputBox.value = "KB756571";
            sendButton.click();

            fixture.detectChanges();

            expect(SpyAlmaServiceScanInItem).toHaveBeenCalledWith( '/almaws/v1/bibs/99122132364105763/holdings/221701562620005763/items/231701562580005763', Object({ op: 'scan', department: 'Digiproj_10068', work_order_type: 'Digiproj', status: 'digitaliseret1', library: 'Digiproj_10068' }));
        });

        afterEach(() => {
        });
    });
});
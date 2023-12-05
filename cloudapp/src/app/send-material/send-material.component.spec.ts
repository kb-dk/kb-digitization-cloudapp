import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {SendMaterialComponent} from './send-material.component';
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
    MAESTRO_CREATED_DOD_BEFORE_NEXT_STEP,
    WORK_ORDER_ITEM_WITHOUT_REQUEST,
    MAESTRO_CREATED_WORK_ORDER_BEFORE_NEXT_STEP,
    REQUEST_RESPONSE_WORK_ORDER_WITHOUT_REQUEST,
    HOLDING,
    HOLDINGWITHMULTI583X,
    TWOITEMSFROMONEHOLDING,
    HOLDING_222233636110005763, HOLDING_222233636140005763, BIBRECORDWITHMULTIPLEHOLDING,
} from "../shared/test-data";
import {Observable, of} from "rxjs";
import {AlmaService} from "../shared/alma.service";
import {MatDialog} from "@angular/material/dialog";
import {DigitizationService} from "../shared/digitization.service";
import {Alert} from "@exlibris/exl-cloudapp-angular-lib/angular/ui/components/alerts/alert.model";
import {NO_ERRORS_SCHEMA} from "@angular/core";

describe('SendMaterialComponent:', () => {
    let component: SendMaterialComponent;
    let fixture: ComponentFixture<SendMaterialComponent>;

    let fakeAlertService: AlertService;
    let mockAlmaService: AlmaService;
    let mockDigitizationService: DigitizationService;

    let isDod: boolean;
    let hasRequestAndComment: boolean;
    let DODBarcode: string;
    let WorkOrderBarcode: string;

    let spyAlmaServiceGetItemFromAlma: jasmine.Spy;
    let spyAlmaServiceGetRequestsFromItem: jasmine.Spy;
    let spyAlmaServiceScanInItem: jasmine.Spy;
    let SpyAlmaServiceGetHolding: jasmine.Spy;
    let SpyAlmaServiceGetMmsIdAndHoldingIdFromField583x: jasmine.Spy;
    let spyDigitizationServiceCheck: jasmine.Spy;
    let spyAlertServiceError: jasmine.Spy;

    let findElement = (query) => fixture.debugElement.nativeElement.querySelector(query);

    let click = (query) => {
        const element = findElement(query);
        element.click();
    }

    let startWith = (barcodeOrField583x) => {
        const inputBox = findElement("input");
        inputBox.value = barcodeOrField583x;
        click("#send");
    }

    class FakeAlertService {
        success = (message: string, options?: Partial<Alert>) => {
        };
        error = (message: string, options?: Partial<Alert>) => {
        };
    }

    class FakeAlmaService {
        getField583x = (link) => of('');
        isField583xUnique = (fieldContent, institution, almaUrl): Observable<boolean> => of(true);
        getItemFromAlma = (useField583x, barcodeOrField583x, institution, almaUrl) => {
            if (isDod) {
                if (hasRequestAndComment) {
                    return of(DOD_ITEM_WITH_REQUEST);
                } else {
                    return of(DOD_ITEM_WITHOUT_REQUEST);
                }
            }
            else{
                if (hasRequestAndComment) {
                    return of(WORK_ORDER_ITEM_WITH_REQUEST);
                } else {
                    return of(WORK_ORDER_ITEM_WITHOUT_REQUEST);
                }
            }
        };
        getRequestsFromItem = (link) => {
            if (isDod) {
                if (hasRequestAndComment) {
                    return of(REQUEST_RESPONSE_DOD_WITH_REQUEST_AND_COMMENT);
                } else {
                    return of(REQUEST_RESPONSE_DOD_WITHOUT_REQUEST);
                }
            }
            else{
                if (hasRequestAndComment) {
                    return of(REQUEST_RESPONSE_WORK_ORDER_WITH_REQUEST_AND_COMMENT);
                } else {
                    return of(REQUEST_RESPONSE_WORK_ORDER_WITHOUT_REQUEST);
                }
            }
        };
        checkIfdeskCodeIsDestination = (request, deskCode): boolean => true;
        sendToDigi = (itemLink: string, library: string, department: string, work_order_type: string = null, institution: string) => of('ok');
    }

    class FakeDigitizationService {
        send = (barcode: string, deskConfig: any, fraktur: boolean, multiVolume: boolean, title: string) => of('{"message":"Add document ok"}');
        check = (barcode: string, deskConfig: any): Observable<any> => {
            if (isDod){
                return of(MAESTRO_CREATED_DOD_BEFORE_NEXT_STEP);
            } else {
                return of(MAESTRO_CREATED_WORK_ORDER_BEFORE_NEXT_STEP);
            }
        };
        goToNextStep = (barcode: string, currentStep: any) => of('{"message":"Action ok"}');
        isBarcodeNew = (data) => true;
    }

    const FakeDialogRef = {afterClosed: () => of(true)};

    const FakeDialog = {open: () => FakeDialogRef};

    const FakeItemListDialogRef = {afterClosed: () => of(false)};

    const FakeItemListDialog = {open: () => FakeItemListDialogRef};

    describe('Unit test:', () => {
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
                declarations: [SendMaterialComponent],
                schemas: [NO_ERRORS_SCHEMA],
                providers: [
                    {provide: AlertService, useClass: FakeAlertService},
                    {provide: AlmaService, useClass: FakeAlmaService},
                    {provide: DigitizationService, useClass: FakeDigitizationService},
                    {provide: MatDialog, useValue: FakeDialog}
                ]
            })
                .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(SendMaterialComponent);
            component = fixture.componentInstance;

            mockAlmaService = fixture.debugElement.injector.get(AlmaService);
            fakeAlertService = fixture.debugElement.injector.get(AlertService);
            mockDigitizationService = fixture.debugElement.injector.get(DigitizationService);

            component.institution = INIT_DATA.instCode;
            component.almaUrl = INIT_DATA.urls.alma;

            DODBarcode = "KB756571";
            WorkOrderBarcode = "400021689597";
        });

        describe('DOD: ', () => {

            beforeEach(() => {
                component.deskConfig = CONFIG.desks[2];
                component.libCode = "DIGINAT";
                component.inputLabel = 'Barcode';
                isDod = true;
                hasRequestAndComment = true;
                fixture.detectChanges();
                spyAlmaServiceGetItemFromAlma = spyOn<any>(mockAlmaService, 'getItemFromAlma').and.callThrough();
                spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.callThrough();
            })

            it('should create send component', () => {
                fixture.detectChanges();
                expect(component).toBeTruthy();
            });

            it('should not fail when there is at least one request', () => {
                hasRequestAndComment = true;
                let spyAlertServiceError = spyOn<any>(fakeAlertService, 'error');
                startWith(DODBarcode);

                fixture.detectChanges();

                expect(spyAlertServiceError).not.toHaveBeenCalledWith('There is no request on this item!');

                spyAlertServiceError.calls.reset();
            });

            it('should throw error if there is no request.', () => {
                hasRequestAndComment = false;
                let spyAlertServiceError = spyOn<any>(fakeAlertService, 'error');
                startWith(DODBarcode);

                fixture.detectChanges();

                expect(spyAlertServiceError).toHaveBeenCalledWith('There is no request on this item!');

                spyAlertServiceError.calls.reset();
            });

            it("should show a confirm-dialog box if there is a comment", () => {
                let SpyDialogServiceOpen: jasmine.Spy = spyOn<any>(FakeDialog, 'open');
                component.checkComments = true;
                startWith(DODBarcode);

                fixture.detectChanges();

                expect(SpyDialogServiceOpen).toHaveBeenCalled();
            });

            afterEach(() => {
                spyAlmaServiceGetItemFromAlma.calls.reset();
                spyAlmaServiceGetRequestsFromItem.calls.reset();
            })
        });

        describe("Work orders: ", () => {

            beforeEach(() => {
                component.deskConfig = CONFIG.desks[1];
                component.libCode = "Digiproj_10068";
                component.inputLabel = 'Barcode';
                isDod = false;
                hasRequestAndComment = true;
                fixture.detectChanges();
                spyAlmaServiceGetItemFromAlma = spyOn<any>(mockAlmaService, 'getItemFromAlma').and.callThrough();
                spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.callThrough();
            })

            it('should create send component', () => {
                fixture.detectChanges();
                expect(component).toBeTruthy();
            });

            it("should show a confirm-dialog box if there is a comment", () => {
                hasRequestAndComment = true;
                let SpyDialogServiceOpen: jasmine.Spy = spyOn<any>(FakeDialog, 'open');
                component.checkComments = true;
                startWith(WorkOrderBarcode);

                fixture.detectChanges();

                expect(SpyDialogServiceOpen).toHaveBeenCalled();

            });

            it("should use field583x instead of barcode if 'use useMarcField' is true and there is a field583x in the marc record", () => {
                let SpyAlmaServiceIsField583xUnique = spyOn<any>(mockAlmaService, 'isField583xUnique').and.callThrough();
                let SpyAlmaServiceGetField583x = spyOn<any>(mockAlmaService, 'getField583x');
                spyDigitizationServiceCheck = spyOn<any>(mockDigitizationService, 'check').and.callThrough();
                component.deskConfig.useMarcField = false;

                startWith(WorkOrderBarcode);
                fixture.detectChanges();

                expect(SpyAlmaServiceGetField583x).not.toHaveBeenCalled();
                expect(SpyAlmaServiceIsField583xUnique).not.toHaveBeenCalled();

                let field583x = 'xxx';
                SpyAlmaServiceGetField583x.and.returnValue(of(field583x));
                component.deskConfig.useMarcField = true;
                startWith(WorkOrderBarcode);
                fixture.detectChanges();

                expect(SpyAlmaServiceGetField583x).toHaveBeenCalled();
                expect(SpyAlmaServiceIsField583xUnique).toHaveBeenCalled();
                expect(spyDigitizationServiceCheck).toHaveBeenCalledWith(field583x, component.deskConfig);

                SpyAlmaServiceIsField583xUnique.calls.reset();
                SpyAlmaServiceGetField583x.calls.reset();
                spyDigitizationServiceCheck.calls.reset();
            });

            afterEach(() => {
                spyAlmaServiceGetItemFromAlma.calls.reset();
                spyAlmaServiceGetRequestsFromItem.calls.reset();            })
        });
    });

    describe('Integration test:', () => {
        // Uses the original Alma Service, with fake calls to APIs using spies
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
                declarations: [SendMaterialComponent],
                schemas: [NO_ERRORS_SCHEMA],
                providers: [
                    {provide: AlertService, useClass: FakeAlertService},
                    AlmaService, // Using the real AlmaService
                    {provide: DigitizationService, useClass: FakeDigitizationService},
                    {provide: MatDialog, useValue: FakeDialog}
                ]
            })
                .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(SendMaterialComponent);
            component = fixture.componentInstance;

            mockAlmaService = fixture.debugElement.injector.get(AlmaService);
            fakeAlertService = fixture.debugElement.injector.get(AlertService);
            mockDigitizationService = fixture.debugElement.injector.get(DigitizationService);

            component.institution = INIT_DATA.instCode;
            component.almaUrl = INIT_DATA.urls.alma;

            DODBarcode = "KB756571";
            WorkOrderBarcode = "400021689597";

            spyAlmaServiceScanInItem = spyOn<any>(mockAlmaService, 'scanInItem').and.returnValue (of('ok'));
            SpyAlmaServiceGetHolding = spyOn<any>(mockAlmaService, 'getHolding').and.returnValue (of(HOLDING));
            SpyAlmaServiceGetMmsIdAndHoldingIdFromField583x = spyOn<any>(mockAlmaService, 'getMmsIdAndHoldingIdFromField583x').and.returnValue(of(['1111', '1111']));
            spyOn<any>(mockAlmaService, 'isField583xUnique').and.returnValue(of(true));
            spyAlertServiceError = spyOn<any>(fakeAlertService, 'error').and.callThrough();
        });

        describe('DOD: ', () => {
            beforeEach(() => {

                component.deskConfig = CONFIG.desks[2];
                component.libCode = "DIGINAT";
                component.inputLabel = 'Barcode';
                fixture.detectChanges();

                spyDigitizationServiceCheck = spyOn<any>(mockDigitizationService, 'check').and.returnValue(of(MAESTRO_CREATED_DOD_BEFORE_NEXT_STEP));
            })

            it("should throw error if current desk is not matching destination department of the request (if there is a request)", () => {

                let spyAlmaServiceGetItemFromAlma = spyOn<any>(mockAlmaService, 'getItemFromAlma').and.returnValue(of(WORK_ORDER_ITEM_WITH_REQUEST));
                let spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.returnValue(of(REQUEST_RESPONSE_WORK_ORDER_WITH_REQUEST_AND_COMMENT));

                startWith(WorkOrderBarcode);

                fixture.detectChanges();

                expect(spyAlertServiceError).toHaveBeenCalledWith("Desk code (The Black Diamond, Copenhagen - Nationalbibliotekets digitalisering) doesn't match destination department of the request (Lindhardt og Ringhof uden Alma publicering_10068).");

                spyAlmaServiceGetItemFromAlma.calls.reset();
                spyAlmaServiceGetRequestsFromItem.calls.reset();
                spyAlertServiceError.calls.reset();

            });

            it("should change the item status from 'Item in place' to 'Not Available' after sending to Alma", () => {
                // Status cannot really be tested in a unit test, since it is something that
                // happens in the Alma with call for Scan-in api
                // We check that the API is called with the correct parameters

                let spyAlmaServiceGetItemFromAlma = spyOn<any>(mockAlmaService, 'getItemFromAlma').and.returnValue(of(DOD_ITEM_WITH_REQUEST));
                let spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.returnValue(of(REQUEST_RESPONSE_DOD_WITH_REQUEST_AND_COMMENT));

                startWith(DODBarcode);

                fixture.detectChanges();

                expect(spyAlmaServiceScanInItem).toHaveBeenCalledWith('/almaws/v1/bibs/99124813044205763/holdings/222248397400005763/items/232248397380005763', Object({
                    op: 'scan',
                    department: 'DIGINAT',
                    library: 'DIGINAT'
                }));

                spyAlmaServiceGetItemFromAlma.calls.reset();
                spyAlmaServiceGetRequestsFromItem.calls.reset();
                spyAlmaServiceScanInItem.calls.reset();

            });

            afterEach(() => {
                spyAlmaServiceScanInItem.calls.reset();
            })
        });

        describe("Work orders: ", () => {
            beforeEach(() => {
                component.deskConfig = CONFIG.desks[1];
                component.libCode = "Digiproj_10068";
                component.inputLabel = 'Barcode';
                fixture.detectChanges();
                spyDigitizationServiceCheck = spyOn<any>(mockDigitizationService, 'check').and.returnValue(of(MAESTRO_CREATED_WORK_ORDER_BEFORE_NEXT_STEP));
            })

            it("should throw error if current desk is not matching destination department of the request (if there is a request)", () => {
                let spyAlmaServiceGetItemFromAlma = spyOn<any>(mockAlmaService, 'getItemFromAlma').and.returnValue(of(DOD_ITEM_WITH_REQUEST));
                let spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.returnValue(of(REQUEST_RESPONSE_DOD_WITH_REQUEST_AND_COMMENT));

                startWith(DODBarcode);

                fixture.detectChanges();

                expect(spyAlertServiceError).toHaveBeenCalledWith("Desk code (Lindhardt og Ringhof uden Alma publicering_10068) doesn't match destination department of the request (Nationalbibliotekets digitalisering).");

                spyAlmaServiceGetItemFromAlma.calls.reset();
                spyAlmaServiceGetRequestsFromItem.calls.reset();
                spyAlertServiceError.calls.reset();

            });

            it("should change the item status from 'Item in place' to 'Not Available' after sending to Alma", () => {
                // Status cannot really be tested in a unit test, since it is something that
                // happens in the Alma with call for Scan-in api
                // We check that the API is called with the correct parameters
                let spyAlmaServiceGetItemFromAlma = spyOn<any>(mockAlmaService, 'getItemFromAlma').and.returnValue(of(WORK_ORDER_ITEM_WITH_REQUEST));
                let spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.returnValue(of(REQUEST_RESPONSE_WORK_ORDER_WITH_REQUEST_AND_COMMENT));

                startWith(WorkOrderBarcode);

                fixture.detectChanges();

                expect(spyAlmaServiceScanInItem).toHaveBeenCalledWith('/almaws/v1/bibs/99122132364105763/holdings/221701562620005763/items/231701562580005763', Object({
                    op: 'scan',
                    department: 'Digiproj_10068',
                    work_order_type: 'Digiproj',
                    status: 'digitaliseret1',
                    library: 'Digiproj_10068'
                }));

                spyAlmaServiceGetItemFromAlma.calls.reset();
                spyAlmaServiceGetRequestsFromItem.calls.reset();
            });

            it("should use input-box content as Maestro-barcode, if 'use useMarcField' is true and there is one item but multiple field583x", () => {
                let spyAlmaServiceGetItemFromAlma = spyOn<any>(mockAlmaService, 'getItemFromAlma').and.returnValue(of(WORK_ORDER_ITEM_WITH_REQUEST));
                let spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.returnValue(of(REQUEST_RESPONSE_WORK_ORDER_WITH_REQUEST_AND_COMMENT));
                let SpyAlmaServiceGetField583x = spyOn<any>(mockAlmaService, 'getField583x').and.callThrough();
                SpyAlmaServiceGetHolding.and.returnValue(of(HOLDINGWITHMULTI583X));

                let field583x = new DOMParser().parseFromString(HOLDINGWITHMULTI583X.anies[0], "application/xml").querySelectorAll(`datafield[tag='583'] subfield[code='x']`)[1].textContent;
                component.deskConfig.useMarcField = true;
                startWith(field583x);

                fixture.detectChanges();

                expect(SpyAlmaServiceGetField583x).toHaveBeenCalled();
                expect(spyDigitizationServiceCheck).toHaveBeenCalledWith(field583x, component.deskConfig);

                SpyAlmaServiceGetField583x.calls.reset();
                spyAlmaServiceGetItemFromAlma.calls.reset();
                spyAlmaServiceGetRequestsFromItem.calls.reset();

            });

            it("should show a list of the items to choose from, if there are multiple items on one holding", () => {
                hasRequestAndComment = true;
                spyOn<any>(mockAlmaService, 'getItemsFromBarcode').and.returnValue(of('Barcode not found'));
                spyOn<any>(mockAlmaService, 'getItemFromHolding').and.returnValue(of(TWOITEMSFROMONEHOLDING));

                let SpyAlmaServiceItemShowItemListDialog: jasmine.Spy = spyOn<any>(mockAlmaService, 'showItemListDialog');

                startWith(WorkOrderBarcode);
                fixture.detectChanges();

                expect(SpyAlmaServiceItemShowItemListDialog).toHaveBeenCalled();
            });

            it("should choose the relevant holding, if there are multiple holdings on one bib-record.", () => {
                // Call for SRU api with field583x gives you a marc record, which contains a list of holdings,
                // but no indication of which holding have this field content.
                // So after getting a list of the holdings, another call is needed to check which one is relevant.

                hasRequestAndComment = true;
                spyOn<any>(mockAlmaService, 'getItemsFromBarcode').and.returnValue(of('Barcode not found'));
                spyOn<any>(mockAlmaService, 'getItemsFromField583x').and.callThrough();
                SpyAlmaServiceGetMmsIdAndHoldingIdFromField583x.and.callThrough();
                spyOn<any>(mockAlmaService, 'getBibRecordFromField583x').and.returnValue(of(BIBRECORDWITHMULTIPLEHOLDING));
                let SpyAlmaServiceGetItemFromHolding = spyOn<any>(mockAlmaService, 'getItemFromHolding');
                SpyAlmaServiceGetHolding.and.callFake((holdingLink) => {
                    if (holdingLink === `/almaws/v1/bibs/99124397539805763/holdings/222233636110005763`){
                        return of(HOLDING_222233636110005763);
                    }
                    if (holdingLink === `/almaws/v1/bibs/99124397539805763/holdings/222233636140005763`){
                        return of(HOLDING_222233636140005763);
                    }
                });

                let SpyAlmaServiceItemShowItemListDialog: jasmine.Spy = spyOn<any>(mockAlmaService, 'showItemListDialog');

                startWith('ark_59701');
                fixture.detectChanges();

                expect(SpyAlmaServiceGetHolding).toHaveBeenCalledWith('/almaws/v1/bibs/99124397539805763/holdings/222233636110005763');
                expect(SpyAlmaServiceGetHolding).toHaveBeenCalledWith('/almaws/v1/bibs/99124397539805763/holdings/222233636140005763');
                expect(SpyAlmaServiceGetItemFromHolding).toHaveBeenCalledWith('/almaws/v1/bibs/99124397539805763/holdings/222233636140005763/items');

                SpyAlmaServiceGetHolding.calls.reset();

            });

            afterEach(() => {
                spyAlmaServiceScanInItem.calls.reset();
            })
        });
    });

});
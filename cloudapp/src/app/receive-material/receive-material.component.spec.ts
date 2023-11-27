import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {ReceiveMaterialComponent} from './receive-material.component';
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
    REQUEST_RESPONSE_WORK_ORDER_WITHOUT_REQUEST, HOLDING,
} from "../shared/test-data";
import {Observable, of} from "rxjs";
import {AlmaService} from "../shared/alma.service";
import {MatDialog} from "@angular/material/dialog";
import {DigitizationService} from "../shared/digitization.service";
import {Alert} from "@exlibris/exl-cloudapp-angular-lib/angular/ui/components/alerts/alert.model";
import {NO_ERRORS_SCHEMA} from "@angular/core";

describe('ReceiveMaterialComponent:', () => {
    let component: ReceiveMaterialComponent;
    let fixture: ComponentFixture<ReceiveMaterialComponent>;

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
    let spyAlmaServiceRemoveTemporaryLocation: jasmine.Spy;
    let spyAlertServiceError: jasmine.Spy;
    let spyDigitizationServiceCheck: jasmine.Spy;
    let spyDigitizationServiceIsBarcodeNew: jasmine.Spy;
    let spyDigitizationServiceReceive: jasmine.Spy;

    let findElement = (query) => fixture.debugElement.nativeElement.querySelector(query);

    let click = (query) => {
        const element = findElement(query);
        element.click();
    }

    let startWith = (barcode) => {
        const inputBox = findElement("input");
        inputBox.value = barcode;
        click("#receive");
    }

    class FakeAlertService {
        success = (message: string, options?: Partial<Alert>) => {
        };
        error = (message: string, options?: Partial<Alert>) => {
        };
    }

    class FakeAlmaService {
        receiveFromDigi = (itemLink:string, library: string, department:string,work_order_type:string=null, institution: string) => of('ok');
        removeTemporaryLocation = (itemFromApi) => of('ok');
        getField583x = (link) => {
            return of('');
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

    }

    class FakeDigitizationService {
        check = (barcode: string, deskConfig: any): Observable<any> => {
            if (isDod){
                return of(MAESTRO_CREATED_DOD_BEFORE_NEXT_STEP);
            } else {
                return of(MAESTRO_CREATED_WORK_ORDER_BEFORE_NEXT_STEP);
            }
        };
        isBarcodeNew = (data) => false;
        isInFinishStep = (data, maestroFinishStep) => true;
        receive = (barcode:string,deskConfig:any) => of('ok');
    }

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
                declarations: [ReceiveMaterialComponent],
                schemas: [NO_ERRORS_SCHEMA],
                providers: [
                    {provide: AlertService, useClass: FakeAlertService},
                    {provide: AlmaService, useClass: FakeAlmaService},
                    {provide: DigitizationService, useClass: FakeDigitizationService}
                ]
            })
                .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(ReceiveMaterialComponent);
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

            it('should create receive component', () => {
                fixture.detectChanges();
                expect(component).toBeTruthy();
            });

            it("should remove temporary location if it is true in the desk config", () => {
                let spyAlmaServiceRemoveTemporaryLocation = spyOn<any>(mockAlmaService, 'removeTemporaryLocation').and.callThrough();

                component.deskConfig.removeTempLocation = false;
                startWith(WorkOrderBarcode);
                fixture.detectChanges();

                expect(spyAlmaServiceRemoveTemporaryLocation).not.toHaveBeenCalled();

                component.deskConfig.removeTempLocation = true;
                startWith(WorkOrderBarcode);

                fixture.detectChanges();

                expect(spyAlmaServiceRemoveTemporaryLocation).toHaveBeenCalled();
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

            it('should create receive component', () => {
                fixture.detectChanges();
                expect(component).toBeTruthy();
            });

            it("should use field583x instead of barcode if 'use useMarcField' is true and there is a field583x in the marc record", () => {
                let SpyAlmaServiceGetField583x = spyOn<any>(mockAlmaService, 'getField583x').and.callThrough();
                spyDigitizationServiceCheck = spyOn<any>(mockDigitizationService, 'check').and.callThrough();

                component.deskConfig.useMarcField = false;

                startWith(WorkOrderBarcode);
                fixture.detectChanges();

                expect(SpyAlmaServiceGetField583x).not.toHaveBeenCalled();

                let field583x = 'xxx';
                SpyAlmaServiceGetField583x.and.returnValue(of(field583x));
                component.deskConfig.useMarcField = true;
                startWith(WorkOrderBarcode);
                fixture.detectChanges();

                expect(SpyAlmaServiceGetField583x).toHaveBeenCalled();
                expect(spyDigitizationServiceCheck).toHaveBeenCalledWith(field583x, component.deskConfig);

                SpyAlmaServiceGetField583x.calls.reset();
                spyDigitizationServiceCheck.calls.reset();
            });

            it("should remove temporary location if it is true in the desk config", () => {
                let spyAlmaServiceRemoveTemporaryLocation = spyOn<any>(mockAlmaService, 'removeTemporaryLocation').and.callThrough();

                component.deskConfig.removeTempLocation = false;
                startWith(WorkOrderBarcode);
                fixture.detectChanges();

                expect(spyAlmaServiceRemoveTemporaryLocation).not.toHaveBeenCalled();

                component.deskConfig.removeTempLocation = true;
                startWith(WorkOrderBarcode);

                fixture.detectChanges();

                expect(spyAlmaServiceRemoveTemporaryLocation).toHaveBeenCalled();
            });

            afterEach(() => {
                spyAlmaServiceGetItemFromAlma.calls.reset();
                spyAlmaServiceGetRequestsFromItem.calls.reset();
            })
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
                declarations: [ReceiveMaterialComponent],
                schemas: [NO_ERRORS_SCHEMA],
                providers: [
                    {provide: AlertService, useClass: FakeAlertService},
                    AlmaService, // Using the real AlmaService
                    {provide: DigitizationService, useClass: FakeDigitizationService}
                ]
            })
                .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(ReceiveMaterialComponent);
            component = fixture.componentInstance;

            mockAlmaService = fixture.debugElement.injector.get(AlmaService);
            fakeAlertService = fixture.debugElement.injector.get(AlertService);
            mockDigitizationService = fixture.debugElement.injector.get(DigitizationService);

            component.institution = INIT_DATA.instCode;
            component.almaUrl = INIT_DATA.urls.alma;

            DODBarcode = "KB756571";
            WorkOrderBarcode = "400021689597";

            spyAlmaServiceScanInItem = spyOn<any>(mockAlmaService, 'scanInItem').and.returnValue (of('ok'));
            spyOn<any>(mockAlmaService, 'getHolding').and.returnValue (of(HOLDING));
            spyOn<any>(mockAlmaService, 'getMmsIdAndHoldingIdFromField583x').and.returnValue(of(['1111', '1111']));
            spyOn<any>(mockAlmaService, 'isField583xUnique').and.returnValue(of(true));
            spyAlmaServiceRemoveTemporaryLocation = spyOn<any>(mockAlmaService, 'removeTemporaryLocation').and.returnValue(of('ok'));
            spyDigitizationServiceReceive = spyOn<any>(mockDigitizationService, 'receive').and.returnValue(of('ok'));
            spyDigitizationServiceIsBarcodeNew = spyOn<any>(mockDigitizationService, 'isBarcodeNew').and.returnValue(false);

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

                expect(spyAlertServiceError).toHaveBeenCalledWith("Error: Desk code (The Black Diamond, Copenhagen - Nationalbibliotekets digitalisering) doesn't match destination department of the request (Lindhardt og Ringhof uden Alma publicering_10068).");

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
                    library: 'DIGINAT',
                    done: 'true'
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

                expect(spyAlertServiceError).toHaveBeenCalledWith("Error: Desk code (Lindhardt og Ringhof uden Alma publicering_10068) doesn't match destination department of the request (Nationalbibliotekets digitalisering).");

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
                    status: 'digitaliseret2',
                    library: 'Digiproj_10068',
                    done: 'true'
                }));

                spyAlmaServiceGetItemFromAlma.calls.reset();
                spyAlmaServiceGetRequestsFromItem.calls.reset();
            });

            afterEach(() => {
                spyAlmaServiceScanInItem.calls.reset();
            })
        });
    });
});
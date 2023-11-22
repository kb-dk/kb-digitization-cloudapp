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
    MAESTRO_CREATED_DOD_BEFORE_NEXT_STEP, WORK_ORDER_ITEM_WITHOUT_REQUEST, MAESTRO_CREATED_WORK_ORDER_BEFORE_NEXT_STEP,
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
    let hasRequest: boolean;
    let DODBarcode: string;
    let WorkOrderBarcode: string;

    let spyAlmaServiceGetItemFromAlma: jasmine.Spy;

    let findElement = (query) => fixture.debugElement.nativeElement.querySelector(query);
    let click = (query) => {
        const element = findElement(query);
        element.click();
    }
    let startWith = (barcode) => {
        const inputBox = findElement("input");
        inputBox.value = barcode;
        click("#send");
    }

    class FakeAlertService {
        success = (message: string, options?: Partial<Alert>) => {
        };
        error = (message: string, options?: Partial<Alert>) => {
        };
    }

    class MockAlmaService {
        getField583x = (link) => of('');
        isField583xUnique = (fieldContent, institution, almaUrl): Observable<boolean> => of(true);
        getItemFromAlma = (useField583x, barcodeOrField583x, institution, almaUrl) => {
            if (isDod) {
                if (hasRequest) {
                    console.log('dod with request');
                    return of(DOD_ITEM_WITH_REQUEST);
                } else {
                    console.log('dod without request');
                    return of(DOD_ITEM_WITHOUT_REQUEST);
                }
            }
            else{
                if (hasRequest) {
                    console.log('work order with request');
                    return of(WORK_ORDER_ITEM_WITH_REQUEST);
                } else {
                    console.log('work order without request');
                    return of(WORK_ORDER_ITEM_WITHOUT_REQUEST);
                }
            }

        };
        getRequestsFromItem = (link) => of('');
        checkIfdeskCodeIsDestination = (request, deskCode): boolean => true;
        sendToDigi = (itemLink: string, library: string, department: string, work_order_type: string = null, institution: string) => of('ok');
    }

    class MockDigitizationService {
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

    const stubDialogRef = {afterClosed: () => of(true)};

    const stubDialog = {open: () => stubDialogRef};

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
                    {provide: AlmaService, useClass: MockAlmaService},
                    {provide: DigitizationService, useClass: MockDigitizationService},
                    {provide: MatDialog, useValue: stubDialog}
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
                hasRequest = true;
                fixture.detectChanges();

                spyAlmaServiceGetItemFromAlma = spyOn<any>(mockAlmaService, 'getItemFromAlma').and.callThrough();
            })

            it('should create send component', () => {
                fixture.detectChanges();
                expect(component).toBeTruthy();
            });

            it('should not fail when there is at least one request', () => {
                hasRequest = true;
                let spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.returnValue(of(REQUEST_RESPONSE_DOD_WITH_REQUEST_AND_COMMENT));
                let spyAlertServiceError = spyOn<any>(fakeAlertService, 'error');

                startWith(DODBarcode);

                fixture.detectChanges();

                expect(spyAlertServiceError).not.toHaveBeenCalledWith('There is no request on this item!');

                spyAlertServiceError.calls.reset();
                spyAlmaServiceGetRequestsFromItem.calls.reset();
            });

            it('should throw error if there is no request.', () => {
                hasRequest = false;
                let spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.returnValue(of(REQUEST_RESPONSE_DOD_WITHOUT_REQUEST));

                let spyAlertServiceError = spyOn<any>(fakeAlertService, 'error');

                startWith(DODBarcode);

                fixture.detectChanges();

                expect(spyAlertServiceError).toHaveBeenCalledWith('There is no request on this item!');

                spyAlertServiceError.calls.reset();
                spyAlmaServiceGetRequestsFromItem.calls.reset();
            });

            it("should show a confirm-dialog box if there is a comment", () => {

                let spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.returnValue(of(REQUEST_RESPONSE_DOD_WITH_REQUEST_AND_COMMENT));
                let SpyDialogServiceOpen: jasmine.Spy = spyOn<any>(stubDialog, 'open');
                component.checkComments = true;
                startWith(DODBarcode);

                fixture.detectChanges();

                expect(SpyDialogServiceOpen).toHaveBeenCalled();

                spyAlmaServiceGetRequestsFromItem.calls.reset();
            });

            afterEach(() => {
                spyAlmaServiceGetItemFromAlma.calls.reset();
            })
        });

        describe("Work orders: ", () => {

            beforeEach(() => {
                component.deskConfig = CONFIG.desks[1];
                component.libCode = "Digiproj_10068";
                component.inputLabel = 'Barcode';
                isDod = false;
                hasRequest = true;
                fixture.detectChanges();
            })

            it('should create send component', () => {
                fixture.detectChanges();
                expect(component).toBeTruthy();
            });

            it("should show a confirm-dialog box if there is a comment", () => {
                let spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.returnValue(of(REQUEST_RESPONSE_WORK_ORDER_WITH_REQUEST_AND_COMMENT));
                let SpyDialogServiceOpen: jasmine.Spy = spyOn<any>(stubDialog, 'open');
                component.checkComments = true;
                startWith(WorkOrderBarcode);

                fixture.detectChanges();

                expect(SpyDialogServiceOpen).toHaveBeenCalled();

                spyAlmaServiceGetRequestsFromItem.calls.reset();
            });

            it("should use field583x instead of barcode if 'use useMarcField' is true and there is a field583x in the marc record", () => {
                let spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.returnValue(of(REQUEST_RESPONSE_WORK_ORDER_WITH_REQUEST_AND_COMMENT));
                let SpyAlmaServiceIsField583xUnique = spyOn<any>(mockAlmaService, 'isField583xUnique').and.callThrough();
                let SpyAlmaServiceGetField583x = spyOn<any>(mockAlmaService, 'getField583x');
                let SpyDigitizationServiceCheck = spyOn<any>(mockDigitizationService, 'check').and.callThrough();

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
                expect(SpyDigitizationServiceCheck).toHaveBeenCalledWith(field583x, component.deskConfig);

                SpyAlmaServiceIsField583xUnique.calls.reset();
                SpyAlmaServiceGetField583x.calls.reset();
                SpyDigitizationServiceCheck.calls.reset();
                spyAlmaServiceGetRequestsFromItem.calls.reset();
            });


            afterEach(() => {
                spyAlmaServiceGetItemFromAlma.calls.reset();
            })
        });
    });

    describe('Integration test:', () => {

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
                    {provide: DigitizationService, useClass: MockDigitizationService},
                    {provide: MatDialog, useValue: stubDialog}
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

                fixture.detectChanges();
            })

            it("should throw error if current desk is not matching destination department of the request (if there is a request)", () => {

                let spyAlmaServiceGetItemFromAlma = spyOn<any>(mockAlmaService, 'getItemFromAlma').and.returnValue(of(WORK_ORDER_ITEM_WITH_REQUEST));
                let spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.returnValue(of(REQUEST_RESPONSE_WORK_ORDER_WITH_REQUEST_AND_COMMENT));
                let spyAlertServiceError = spyOn<any>(fakeAlertService, 'error').and.callThrough();

                const inputBox = findElement("input");
                inputBox.value = WorkOrderBarcode;
                click("#send");

                fixture.detectChanges();

                expect(spyAlertServiceError).toHaveBeenCalledWith("Desk code (The Black Diamond, Copenhagen - Nationalbibliotekets digitalisering) doesn't match destination department of the request (Lindhardt og Ringhof uden Alma publicering_10068).");

                spyAlmaServiceGetItemFromAlma.calls.reset();
                spyAlmaServiceGetRequestsFromItem.calls.reset();
                spyAlertServiceError.calls.reset();

            });

        });

        describe("Work orders: ", () => {
            beforeEach(() => {
                component.deskConfig = CONFIG.desks[1];
                component.libCode = "Digiproj_10068";
                component.inputLabel = 'Barcode';

                fixture.detectChanges();
            })
            it("should throw error if current desk is not matching destination department of the request (if there is a request)", () => {
                let spyAlmaServiceGetItemFromAlma = spyOn<any>(mockAlmaService, 'getItemFromAlma').and.returnValue(of(DOD_ITEM_WITH_REQUEST));
                let spyAlmaServiceGetRequestsFromItem = spyOn<any>(mockAlmaService, 'getRequestsFromItem').and.returnValue(of(REQUEST_RESPONSE_DOD_WITH_REQUEST_AND_COMMENT));
                let spyAlertServiceError = spyOn<any>(fakeAlertService, 'error').and.callThrough();

                startWith(DODBarcode);

                fixture.detectChanges();

                expect(spyAlertServiceError).toHaveBeenCalledWith("Desk code (Lindhardt og Ringhof uden Alma publicering_10068) doesn't match destination department of the request (Nationalbibliotekets digitalisering).");

                spyAlmaServiceGetItemFromAlma.calls.reset();
                spyAlmaServiceGetRequestsFromItem.calls.reset();
                spyAlertServiceError.calls.reset();
            });
        });
    });

});
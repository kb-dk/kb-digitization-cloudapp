import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {AlertService, CloudAppEventsService} from '@exlibris/exl-cloudapp-angular-lib'
import {AlmaService} from "../shared/alma.service";
import {DigitizationService} from "../shared/digitization.service";
import {concatMap, map, tap} from "rxjs/operators";
import {Observable, of, throwError} from "rxjs";

import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";

@Component({
    selector: 'app-send-material',
    templateUrl: './send-material.component.html',
    styleUrls: ['./send-material.component.scss']
})
export class SendMaterialComponent {
    itemFromAlma: any = null;
    barcodeForMaestro: string = null;
    isFraktur: boolean = false;
    isMultivolume: boolean = false;
    isSending: boolean = false;
    note: string = "";
    successMessage: string[] = [];
    checkComments: boolean = false;
    @Input() inputLabel: string = '';
    @Input() libCode: string = null;
    @Input() institution: string = null;
    @Input() almaUrl: string = null;
    @Input() deskConfig: any = null;
    @Output() loading = new EventEmitter<boolean>();
    @ViewChild('barcode', {static: false}) barcode: ElementRef;

    constructor(
        private eventService: CloudAppEventsService,
        private almaService: AlmaService,
        private alert: AlertService,
        private digitizationService: DigitizationService,
        public dialog: MatDialog
    ) {
    }

    sendToDigitization() {
        let inputText = this.barcode.nativeElement.value;
        if (inputText) {
            // TODO: Add this to desk config in configuration
            let checkRequestBeforeSending: boolean = this.deskConfig.deskCode === 'DIGINAT';

            if (!this.isSending) {
                this.isSending = true;
                this.loading.emit(true);
                this.checkBarcodeStatusInAlmaAndMaestro(inputText)
                    .pipe(
                        concatMap(() => this.almaService.getRequestsFromItem(this.itemFromAlma.link)),
                        // Check if there is a request (only for DIGINAT)
                        // and if there is a request check if the destination department matches the current desk
                        map((request) => checkRequestBeforeSending ? this.throwErrorIfDoNotHaveRequest(request) : request),
                        map((request) => [request, this.almaService.checkIfdeskCodeIsDestination(request, this.deskConfig?.deskCode)]),
                        map(([request, isDeskCodeCorrect]) => {
                            if (!isDeskCodeCorrect) {
                                throw new Error(`Desk code (${this.deskConfig.deskName}) doesn't match destination department of the request (${request.user_request[0]?.target_destination?.desc}).`);
                            }
                            return request
                        }),
                        concatMap(request => this.checkComments && request?.user_request[0]?.comment ? this.showCommentDialog(request.user_request[0].comment) : of(true)),
                    )
                    .pipe(
                        concatMap((canContinue) => canContinue ? this.sendToDigi() : of("Canceled"))
                    )
                    .subscribe(
                        (response) => {
                            response === "Canceled" ? null : this.showSuccessMessage();
                            this.resetForm();
                        },
                        error => {
                            if (error.message && error.message.includes("Http failure response for") && error.message.includes(this.deskConfig.url)) {
                                error.message = "Cannot connect to digitization system. Please check your network connection!";
                            }
                            this.alert.error(error.message);
                            this.resetForm();
                            throwError(() => new Error(error.message));
                        }
                    );
            }
        }
    }

    // Three things happen here:
    // 1- Create the document in Maestro.
    // 2- Set the document in the next step in Maestro workflow.
    // 3- Call Scan in item API in Alma which sets the item in the relevant status in Alma.
    private sendToDigi() {
        return this.digitizationService.send(this.barcodeForMaestro, this.deskConfig, this.isFraktur, this.isMultivolume, this.note)
            .pipe(
                // Check if the document is created
                concatMap(() => this.digitizationService.check(this.barcodeForMaestro, this.deskConfig)),
                concatMap(data => {
                    // Set the document to next step in Maestro only if it is created
                    if (data.hasOwnProperty('barcode') && data.barcode === this.barcodeForMaestro) {
                        this.successMessage = ['Maestro'];
                        if (data.hasOwnProperty('step_title') && data['step_title'].trim() === this.deskConfig.maestroStartStep.trim()) {
                            return this.digitizationService.goToNextStep(this.barcodeForMaestro, this.deskConfig.maestroStartStep.trim())
                        } else {
                            this.alert.error(`Error setting record to the next step. Ask an admin to check "Maestro start step" in App configuration for current desk.`);
                            return of({message: 'Error setting the document in the next step in Maestro'});
                        }
                    } else {
                        data.hasOwnProperty('error') ? this.alert.error('Error creating the document in Maestro. ', data.error) : null;
                        return of({message: 'Error creating the document in Maestro'});
                    }
                }),
                concatMap(() => this.almaService.sendToDigi(this.itemFromAlma.link, this.libCode, this.deskConfig.deskCode.trim(), this.deskConfig.workOrderType.trim(), this.institution.trim())),
                tap(() => this.successMessage.push(`Alma`))
            )
    }

    checkBarcodeStatusInAlmaAndMaestro(inputText) {
        return this.getItemFromAlma(inputText)
            .pipe(
                tap(AlmaItem => this.itemFromAlma = AlmaItem),
                tap(AlmaItem => this.barcodeForMaestro = AlmaItem.item_data.barcode.toString()),
                concatMap((AlmaItem): Observable<string> => {
                        if (this.deskConfig.useMarcField) {
                            let field583x = '';
                            return this.almaService.getField583x(AlmaItem.holding_data.link).pipe(
                                tap(response => field583x = response),
                                concatMap(response => response === '' ? of(true) : this.almaService.isField583xUnique(response, this.institution, this.almaUrl)),
                                map((isField583xUnique: boolean): string => {
                                    if (!isField583xUnique) {
                                        let message = "Field 583x is not unique.";
                                        throw new Error(message);
                                    }
                                    return field583x;
                                }),
                                tap(field583x => field583x ? this.barcodeForMaestro = field583x : null),
                                map(() => this.barcodeForMaestro),
                            )
                        }
                        return of(this.barcodeForMaestro);
                    }
                ),
                concatMap(barcodeForMaestro => this.checkStatusInDigitization(barcodeForMaestro))
            );
    }

    resetForm() {
        this.loading.emit(false);
        this.isSending = false;
        this.itemFromAlma = null;
        this.barcode.nativeElement.value = "";
        this.barcodeForMaestro = "";
    }

    getItemFromAlma(barcodeOrField583x) {
        return this.almaService.getItemFromAlma(this.deskConfig.useMarcField, barcodeOrField583x, this.institution, this.almaUrl).pipe(
        );
    }

    private checkStatusInDigitization(barcode: string) {
        return this.digitizationService.check(barcode, this.deskConfig)
            .pipe(
                tap(data => {
                    if (!this.digitizationService.isBarcodeNew(data)) {
                        throw new Error(`Barcode "${barcode}" already exists in Maestro.`);
                    }
                }),
            );
    }

    private showSuccessMessage() {
        const title: string = this.itemFromAlma?.bib_data?.title;
        this.alert.success(`${this.barcodeForMaestro} ${title ? `with the title "${title}"` : ''} is successfully sent to ${this.successMessage.join(' and ')}.`, {delay: 5000});
        this.successMessage = [];
    }

    private throwErrorIfDoNotHaveRequest(request) {
        if (request.total_record_count < 1) {
            throw new Error("There is no request on this item!");
        }
        return request;
    }

    private showCommentDialog(comment: string): Observable<boolean> {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '26.5rem',
            data: {
                dialogTitle: 'Comment:',
                dialogMessageLine1: `${comment}`,
                yesButtonText: 'Send anyway',
                noButtonText: "Don't send"
            }
        });

        return dialogRef.afterClosed();
    }
}

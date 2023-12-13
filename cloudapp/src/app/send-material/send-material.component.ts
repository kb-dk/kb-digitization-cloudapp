import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {AlertService, CloudAppEventsService} from '@exlibris/exl-cloudapp-angular-lib'
import {AlmaService} from "../shared/alma.service";
import {DigitizationService} from "../shared/digitization.service";
import {catchError, concatMap, map, tap} from "rxjs/operators";
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

    sendItem(inputText: string) {
        let barcodeStatus = this.checkBarcodeStatusInAlmaAndMaestro(inputText);
        let canContinue = this.checkItem(barcodeStatus);
        return canContinue.pipe(concatMap(canContinue => canContinue ? this.sendToDigi() : of("Canceled")));
    }

    private checkItem(barcodeStatus: Observable<any>) {
        let itemRequests = barcodeStatus.pipe(concatMap(() => this.almaService.getRequestsFromItem(this.itemFromAlma.link)));
        itemRequests = this.checkRequests(this.deskConfig.checkRequests, itemRequests);
        itemRequests = this.checkDesk(itemRequests);
        return this.checkComment(itemRequests);

    }

    private sendToDigi() {
        return this.digitizationService.send(this.barcodeForMaestro, this.deskConfig, this.isFraktur, this.isMultivolume, this.note)
            .pipe(
                concatMap(() => this.digitizationService.check(this.barcodeForMaestro, this.deskConfig)),
                concatMap(documentFromMaestro => this.checkAndSetDocumentInNextStepInMaestro(documentFromMaestro)),
                concatMap(() => this.almaService.markItemAsUnavailable(this.itemFromAlma.link, this.libCode, this.deskConfig.deskCode.trim(), this.deskConfig.workOrderType.trim(), this.institution.trim())),
                tap(() => this.successMessage.push(`Alma`))
            )
    }

    checkBarcodeStatusInAlmaAndMaestro(inputText) {
        let item = this.getItemFromAlma(inputText);
        return item
            .pipe(
                concatMap(item => this.getBarcodeForMaestro(item, inputText)),
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
            tap(AlmaItem => this.itemFromAlma = AlmaItem)
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

    sendRelatedItem(item) {
        return this.checkAndSendItem(item);
    }

    private getItemFromMMSID(mmsid) {
        const bibPost = this.getBibPostFromMMSID(mmsid).pipe(tap(() => this.barcodeForMaestro = mmsid));
        const barcode = bibPost.pipe(map(bibPost => this.getBarcodeFromBibPost(bibPost)));
        const itemOrError = barcode.pipe(concatMap(barcode => this.almaService.getItemsFromBarcode(barcode)));
        return itemOrError.pipe(catchError(() => of('Input is not MMSID')));
    }

    private checkAndSendItem(item) {
        this.itemFromAlma = item;
        return this.checkStatusInDigitization(this.barcodeForMaestro).pipe(
            concatMap(data => this.sendToDigi()),
        );
    }

    private getBibPostFromMMSID(mmsid: string) {
        return this.almaService.getBibPostFromMMSID(mmsid).pipe(
            catchError(()=> {
                throw new Error(`MMSID not found`);
            })
        )
    }

    private getBarcodeFromBibPost(bibPost: Observable<any>) {
        const xmlDoc = this.almaService.getXmlDocFromResult(bibPost);
        return this.almaService.getField773wgFromBibPost(xmlDoc);
    }

    private subscribeAndHandleResult(result: Observable<any>) {
        result.subscribe(
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
        )
    }

    private checkRequests(checkRequests: string, itemRequests: Observable<any>) {
        if (this.deskConfig.checkRequests){
            itemRequests = itemRequests.pipe(map((request) => this.throwErrorIfDoNotHaveRequest(request)))
        }
        return itemRequests;
    }

    private checkDesk(itemRequests: Observable<any>) {
        return itemRequests.pipe(
            map(requests => {
                // Check if there is a request
                // and if there is a request check if the destination department matches the current desk
                let isDeskCodeCorrect = this.almaService.checkIfdeskCodeIsDestination(requests, this.deskConfig?.deskCode);
                if (!isDeskCodeCorrect) {
                    throw new Error(`Desk code (${this.deskConfig.deskName}) doesn't match destination department of the request (${requests.user_request[0]?.target_destination?.desc}).`);
                }
                return requests;
            }),
        );
    }

    private checkComment(itemRequests: Observable<any>) {
        if(this.checkComments){
            return itemRequests.pipe(concatMap(request =>  request?.user_request[0]?.comment ? this.showCommentDialog(request.user_request[0].comment) : of(true)))
        }
        return itemRequests.pipe(map(() => true));
    }

    private getBarcodeForMaestro(AlmaItem, inputText) {
        this.barcodeForMaestro = AlmaItem.item_data.barcode.toString();
        if (this.deskConfig.useMarcField) {
            return this.getField583x(AlmaItem, inputText);
        }
        return of(this.barcodeForMaestro);
    }

    private getField583x(AlmaItem, inputText) {
        let field583x = '';
        return this.almaService.getField583x(AlmaItem.holding_data.link, inputText).pipe(
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

    private checkAndSetDocumentInNextStepInMaestro(document) {
        if (this.isDocumentCreated(document)) {
            this.successMessage = ['Maestro'];
            return this.setDocumentInNextStep(document);
        } else {
            return this.throwDocumentNotCreatedError();
        }
    }

    private throwDocumentNotCreatedError() {
        let message = 'Error creating the document in Maestro';
        return this.throwErrorWithAlert(message);
    }

    private setDocumentInNextStep(document) {
        if (this.isDocumentInStartStep(document)) {
            return this.digitizationService.goToNextStep(this.barcodeForMaestro, this.deskConfig.maestroStartStep.trim())
        } else {
            return this.throwProblemsettingDocumentInNextStepError();
        }
    }

    private isDocumentInStartStep(document) {
        return document.hasOwnProperty('step_title') && document['step_title'].trim() === this.deskConfig.maestroStartStep.trim();
    }

    private throwProblemsettingDocumentInNextStepError() {
        let message = `Error setting record to the next step. Ask an admin to check "Maestro start step" in App configuration for current desk`;
        return this.throwErrorWithAlert(message);
    }

    private throwErrorWithAlert(message: string) {
        this.alert.error(message);
        return of({message: message});
    }

    private isDocumentCreated = (document) => document.hasOwnProperty('barcode') && document.barcode === this.barcodeForMaestro;


    send() {
        const inputBox = this.barcode.nativeElement.value;
        if (inputBox && !this.isSending) {
            this.isSending = true;
            this.loading.emit(true);

            let itemOrError = this.getItemFromMMSID(inputBox);
            const result = itemOrError.pipe(
                concatMap(item => item === 'Input is not MMSID' ? this.sendItem(inputBox) : this.sendRelatedItem(item))
            )

            this.subscribeAndHandleResult(result);

        }
    }
}

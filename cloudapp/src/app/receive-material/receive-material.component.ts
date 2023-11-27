import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {AlertService} from '@exlibris/exl-cloudapp-angular-lib'
import {concatMap, map, tap} from "rxjs/operators";
import { DigitizationService } from "../shared/digitization.service";
import {AlmaService} from "../shared/alma.service";
import {Result} from "../models/Result";
import {Observable, of} from "rxjs";

@Component({
  selector: 'app-receive-material',
  templateUrl: './receive-material.component.html',
  styleUrls: ['./receive-material.component.scss']
})
export class ReceiveMaterialComponent{
  itemFromAlma: any = null;
  barcodeForMaestro: string = "";
  isReceiving: boolean = false;
  successMessage: string[] = [];
  @Input() inputLabel: string = '';
  @Input() deskConfig: any = null;
  @Input() institution: string = '';
  @Input() almaUrl: string = null;
  @Input() libCode: string = null;
  @Output() loading = new EventEmitter<boolean>();
  @ViewChild('barcode', {static: false}) barcode: ElementRef;

    constructor(
      private digitizationService: DigitizationService,
      private almaService: AlmaService,
      private alert: AlertService
    ) {}

    receiveFromDigitization() {
        if (!this.isReceiving) {
            this.loading.emit(true);
            this.isReceiving = true;
            this.checkBarcodeStatusInAlmaAndMaestro().pipe(
                concatMap(() => this.receiveFromDigi())
            )
                .subscribe(
                    () => {
                        this.resetForm(new Result(true, "Received from digitization"));
                    },
                    error => {
                        let message = error.hasOwnProperty('message') ? error.message : error;
                        this.resetForm(new Result(false, error.toString()));
                    }
                );
        }
    }

    // Three things happen here:
    // 1- Set the document in the next step in Maestro workflow (if it has the correct step for finishing).
    // 2- Call Scan in item API in Alma which sets the item in the relevant status in Alma.
    // 3- Remove "Temporary location" in Alma, if relevant.
    private receiveFromDigi() {
        return this.digitizationService.receive(this.barcodeForMaestro, this.deskConfig)
            .pipe(
                tap(() => this.successMessage = ['Maestro']),
                concatMap (() => this.almaService.receiveFromDigi(this.itemFromAlma.link, this.libCode, this.deskConfig.deskCode.trim(), this.deskConfig.workOrderType.trim(), this.institution.trim())),
                tap(() => this.successMessage.push('Alma')),
                concatMap ((): Observable<any> => {
                    if (this.deskConfig.removeTempLocation) {
                        return this.almaService.removeTemporaryLocation(this.itemFromAlma);
                    }
                    return of('NoTemp');
                }),
                tap(result => result !== 'NoTemp' ? this.successMessage.push('temporary location is removed.') : null),
            )
    }

    private checkBarcodeStatusInAlmaAndMaestro() {
        let inputText = this.barcode.nativeElement.value;
        return this.getItemFromAlma(this.barcode.nativeElement.value)
            .pipe(
                tap(AlmaItem => this.itemFromAlma = AlmaItem),
                tap(AlmaItem => this.barcodeForMaestro = AlmaItem.item_data.barcode.toString()),
                concatMap(AlmaItem => this.deskConfig.useMarcField ? this.almaService.getField583x(AlmaItem.holding_data.link, inputText) : of('')),
                tap(field583x => field583x ? this.barcodeForMaestro = field583x : null),
                concatMap(() => this.checkStatusInDigitization(this.barcodeForMaestro)),
                concatMap(() => this.almaService.getRequestsFromItem(this.itemFromAlma.link)),
                map((request) => [request, this.almaService.checkIfdeskCodeIsDestination(request, this.deskConfig?.deskCode)]),
                map(([request, isDeskCodeCorrect]) => {
                    if (!isDeskCodeCorrect) {
                        throw new Error(`Desk code (${this.deskConfig.deskName}) doesn't match destination department of the request (${request.user_request[0]?.target_destination?.desc}).`);
                    }
                    return 'ok'
                }),
            );
    }

    private checkStatusInDigitization(barcode: string) {
        return this.digitizationService.check(barcode,this.deskConfig)
            .pipe(
                tap(data => {
                    if (this.digitizationService.isBarcodeNew(data)){
                        throw new Error(`There is no document with this Barcode in Maestro.`);
                    }
                }),
                map(data => {
                    return this.digitizationService.isInFinishStep(data, this.deskConfig.maestroFinishStep);
                }),
                tap(isInFinishStep=> {
                    if (!isInFinishStep){
                        throw new Error(`Document is not in finish step in Maestro. Please contact digitization department.`);
                    }
                })
            );
    }

    getItemFromAlma(barcodeOrField583x) {
        return this.almaService.getItemFromAlma(this.deskConfig.useMarcField, barcodeOrField583x, this.institution, this.almaUrl);
    }

  resetForm(status) {
      status.ok ? this.showSuccessMessage() : this.alert.error(status.hasOwnProperty('message') ? status.message : status);
      this.loading.emit(false);
      this.isReceiving = false;
      this.itemFromAlma=null;
      this.barcode.nativeElement.value = "";
      this.barcodeForMaestro = "";
  }

    private showSuccessMessage() {
        const title : string = this.itemFromAlma?.bib_data?.title;
        this.alert.success(`${this.barcodeForMaestro} ${title ? `with the title "${title}"` : ''} is successfully received in ${this.successMessage.join(' and ')}.`, { delay: 10000});
        this.successMessage = [];
    }
}

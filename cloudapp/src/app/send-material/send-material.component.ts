import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {AlertService, CloudAppEventsService} from '@exlibris/exl-cloudapp-angular-lib'
import {AlmaService} from "../shared/alma.service";
import {DigitizationService} from "../shared/digitization.service";
import {catchError, concatMap, switchMap, tap} from "rxjs/operators";
import {EMPTY, throwError} from "rxjs";

@Component({
  selector: 'app-send-material',
  templateUrl: './send-material.component.html',
  styleUrls: ['./send-material.component.scss']
})
export class SendMaterialComponent{
    itemFromAlma: any = null;
    barcodeForMaestro: string = null;
    isFraktur: boolean = false;
    isMultivolume: boolean = false;
    isSending: boolean = false;
    note: string = "";
    @Input() libCode: string = null;
    @Input() deskConfig: any = null;
    @Output() loading = new EventEmitter<boolean>();
    @ViewChild('barcode', {static: false}) barcode: ElementRef;

  constructor(
      private eventService: CloudAppEventsService,
      private almaService: AlmaService,
      private alert: AlertService,
      private digitizationService: DigitizationService
  )
  { }

  sendToDigitization() {
      if (!this.isSending) {
          this.isSending = true;
          this.loading.emit(true);
          this.checkBarcodeStatusInAlmaAndMaestro().subscribe(
              result => {
                  this.sendToDigi();
              },
              error => {
                  this.alert.error(error.message);
                  this.loading.emit(false);
                  this.isSending = false;
                  throwError(() => new Error(error.message));
              }
          );
      }
  }

    // Three things happen here:
    // 1- Create the document in Maestro.
    // 2- Set the document in the next step in Maestro workflow.
    // 3- Call Scan in item API in Alma which sets the item in the relevant status in Alma.
    private sendToDigi() {
        this.digitizationService.send(this.barcodeForMaestro, this.deskConfig, this.isFraktur, this.isMultivolume, this.note)
            .pipe(
                switchMap(data => {
                    // Set the document to next step in Maestro only if it is created
                    if (data.message === 'Add document ok') {
                        this.alert.success('Document is successfully added to Maestro.');
                        return this.digitizationService.goToNextStep(this.barcodeForMaestro, this.deskConfig.maestroStartStep.trim())
                    } else {
                        data.hasOwnProperty('error') ? this.alert.error('Error creating the document in Maestro. ', data.error) : null;
                        return EMPTY;
                    }
                }),
                switchMap(data => {
                    data.hasOwnProperty('error') ? this.alert.error( `Error setting record to the next step. Ask an admin to check "Maestro start step" in App configuration for current desk. ${data.error}`) : null;
                    return this.almaService.sendToDigi(this.itemFromAlma.link, this.libCode, this.deskConfig.deskCode.trim(), this.deskConfig.workOrderType.trim());
                }),
                catchError(err => {
                    console.log(err);
                    return EMPTY;
                })
            )
            .subscribe({
                next: result => {
                    this.loading.emit(false);
                    this.isSending = false;
                    this.alert.success(`Document is successfully scanned in Alma.`);
                    this.resetForm();
                },
                error: error => {
                    this.isSending = false;
                    this.loading.emit(false);
                    this.resetForm();
                }
            });
    }

    private checkBarcodeStatusInAlmaAndMaestro() {
        return this.getItemFromAlma(this.barcode.nativeElement.value)
            .pipe(
                concatMap((AlmaItem) => {
                    this.itemFromAlma = AlmaItem;
                    return this.getBarcodeOrField583x();
                }),
                concatMap(() => this.checkStatusInDigitization(this.barcodeForMaestro))
            );
    }

    resetForm() {
        this.itemFromAlma=null;
        this.barcode.nativeElement.value = "";
        this.barcodeForMaestro = "";
    }

    getItemFromAlma(barcode) {
        const encodedBarcode = encodeURIComponent(barcode).trim();
        return this.almaService.getItemsFromBarcode(encodedBarcode);
    }

    private async getBarcodeOrField583x() {
        this.barcodeForMaestro = this.itemFromAlma.item_data.barcode;
        if (this.deskConfig.useMarcField) {
            await this.almaService.getField583x(this.itemFromAlma.holding_data.link)
                .then(field583x => {
                    if (field583x) {
                        this.barcodeForMaestro = field583x;
                    } else {
                        console.log("field583x has no value");
                    }
                })
        }
        return Promise.resolve();
    }

    private checkStatusInDigitization(barcode: string) {
        return this.digitizationService.check(barcode,this.deskConfig)
            .pipe(
                tap(data => {
                    if(!this.digitizationService.isBarcodeNew(data)){
                        throw new Error(`Barcode already exists in Maestro.`);
                    }
                }),
            );
    }

    private handleError(error: any) {
        this.alert.error(error);
        return EMPTY;
    }
}

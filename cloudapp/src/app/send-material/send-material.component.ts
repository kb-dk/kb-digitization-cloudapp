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
      this.loading.emit(true);
      this.checkBarcodeStatusInAlmaAndMaestro().subscribe(
          result => {
              this.sendToDigi();
          },
          error => {
              this.alert.error(error.message);
              this.loading.emit(false);
              throwError(() => new Error(error.message));
          }
      );
  }

    private sendToDigi() {
        this.digitizationService.send(this.barcodeForMaestro, this.deskConfig, this.isFraktur, this.isMultivolume, this.note)
            .pipe(
                switchMap(data => {
                    // Go to next step only if it is created
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
                    this.alert.success(`"${this.itemFromAlma.bib_data.title}" is sent to digitization.`);
                    this.resetForm();
                },
                error: error => {
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
                concatMap(() => this.checkStatusInDigitization(this.barcodeForMaestro)),
                tap(() => this.loading.emit(false))
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
                tap( () =>this.loading.emit(false)),
                tap(data => {
                    if(!this.isBarcodeNew(data)){
                        throw new Error(`Barcode already exists in Maestro.`);
                    }
                }),
            );
    }

    private isBarcodeNew(data) {
        return data.hasOwnProperty('error') && data.error === 'No book found with the barcode';
    }

    private handleError(error: any) {
        this.alert.error(error);
        return EMPTY;
    }
}

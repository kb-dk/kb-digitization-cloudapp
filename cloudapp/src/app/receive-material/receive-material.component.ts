import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AlertService} from '@exlibris/exl-cloudapp-angular-lib'
import {concatMap, map, tap} from "rxjs/operators";
import { DigitizationService } from "../shared/digitization.service";
import {AlmaService} from "../shared/alma.service";
import {Result} from "../models/Result";
import {Observable, of, throwError} from "rxjs";

@Component({
  selector: 'app-receive-material',
  templateUrl: './receive-material.component.html',
  styleUrls: ['./receive-material.component.scss']
})
export class ReceiveMaterialComponent implements OnInit {
  itemFromAlma: any = null;
  barcodeForMaestro: string = "";
  isReceiving: boolean = false;
  successMessage: string[] = [];
  @Input() deskConfig: any = null;
  @Input() institution: string = '';
  @Input() libCode: string = null;
  @Output() loading = new EventEmitter<boolean>();
  @ViewChild('barcode', {static: false}) barcode: ElementRef;

    constructor(
      private digitizationService: DigitizationService,
      private almaService: AlmaService,
      private alert: AlertService
    ) {}
  ngOnInit(): void {
  }

    receiveFromDigitization() {
        if (!this.isReceiving) {
            this.loading.emit(true);
            this.isReceiving = true;
            this.checkBarcodeStatusInAlmaAndMaestro().pipe(
                concatMap(() => this.receiveFromDigi())
            )
                .subscribe(
                result => {
                    this.resetForm(new Result(true, "Received from digitization"));
                },
                error => {
                    this.resetForm(new Result(false, error));
                    console.log(error);
                    throwError(() => new Error(error.message));
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
                tap(data => this.successMessage = ['Maestro']),
                tap(data => console.log(this.deskConfig, this.institution.trim())),
                concatMap (() => this.almaService.receiveFromDigi(this.itemFromAlma.link, this.libCode, this.deskConfig.deskCode.trim(), this.deskConfig.workOrderType.trim(), this.institution.trim())),
                tap(() => this.successMessage.push('Alma')),
                concatMap ((): Observable<any> => {
                    if (this.deskConfig.removeTempLocation) {
                        return this.almaService.removeTemporaryLocation(this.itemFromAlma);
                    }
                    return of('');
                }),
                tap(result => result !== 'NoTemp' ? this.successMessage.push('temporary location is removed.') : null),
            )
    }

    private checkBarcodeStatusInAlmaAndMaestro() {
        return this.getItemFromAlma(this.barcode.nativeElement.value)
            .pipe(
                tap(AlmaItem => this.itemFromAlma = AlmaItem),
                concatMap((AlmaItem) => this.getBarcodeOrField583x()),
                concatMap(() => this.checkStatusInDigitization(this.barcodeForMaestro)),
            );
    }

    private checkStatusInDigitization(barcode: string) {
        return this.digitizationService.check(barcode,this.deskConfig)
            .pipe(
                tap(data => {
                    if (this.digitizationService.isBarcodeNew(data)){
                        const message = `There is no document with this Barcode in Maestro.`;
                        console.log(message)
                        throw new Error(message);
                    }
                }),
                map(data => {
                    console.log(this.digitizationService.isInFinishStep(data, this.deskConfig.maestroFinishStep), this.deskConfig.maestroFinishStep, data);
                    return this.digitizationService.isInFinishStep(data, this.deskConfig.maestroFinishStep);
                }),
                tap(isInFinishStep=> {
                    if (!isInFinishStep){
                        const message = `Document is not in finish step in Maestro. Please contact digitization department.`;
                        console.log(message)
                        throw new Error(message);
                    }
                })
            );
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

    getItemFromAlma(barcode) {
        const encodedBarcode = encodeURIComponent(barcode).trim();
        return this.almaService.getItemsFromBarcode(encodeURIComponent(barcode).trim());
    }

  resetForm(message) {
      message.ok ? this.showSuccessMessage() : this.alert.error(message);
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

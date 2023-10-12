import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AlertService} from '@exlibris/exl-cloudapp-angular-lib'
import {concatMap, switchMap, tap} from "rxjs/operators";
import { DigitizationService } from "../shared/digitization.service";
import {AlmaService} from "../shared/alma.service";
import {Result} from "../models/Result";
import {of, throwError} from "rxjs";

@Component({
  selector: 'app-receive-material',
  templateUrl: './receive-material.component.html',
  styleUrls: ['./receive-material.component.scss']
})
export class ReceiveMaterialComponent implements OnInit {
  itemFromAlma: any = null;
  barcodeForMaestro: string = "";
  isReceiving: boolean = false;
  @Input() deskConfig: any = null;
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
            this.checkBarcodeStatusInAlmaAndMaestro().subscribe(
                result => {
                    this.receiveFromDigi();
                },
                error => {
                    this.alert.error(error.message);
                    this.loading.emit(false);
                    this.isReceiving = false;
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
        this.digitizationService.receive(this.barcodeForMaestro, this.deskConfig)
            .pipe(
                tap(data => this.alert.success('Document is successfully finished in Maestro.')),
                switchMap(() => this.almaService.receiveFromDigi(this.itemFromAlma.link, this.libCode, this.deskConfig.deskCode.trim(), this.deskConfig.workOrderType.trim(), this.deskConfig.institution.trim())),
                tap(() => this.alert.success('Document is successfully scanned in Alma.')),
                switchMap(() => {
                    if (this.deskConfig.removeTempLocation) {
                        return this.almaService.removeTemporaryLocation(this.itemFromAlma);
                    } else {
                        return of('ok');
                    }
                },
                    tap(data => data === 'ok' ? null : this.alert.success('Temporary location is removed in Alma.')),
                    )
            )
            .subscribe({
                next: result => {
                    this.loading.emit(false);
                    this.isReceiving = false;
                    this.resetForm(new Result(true, "Received from digitization"));
                },
                error: error => {
                    this.loading.emit(false);
                    this.isReceiving = false;
                    this.resetForm(new Result(false, error));
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
            );
    }

    private checkStatusInDigitization(barcode: string) {
        return this.digitizationService.check(barcode,this.deskConfig)
            .pipe(
                tap(data => {
                    if(this.digitizationService.isBarcodeNew(data)){
                        throw new Error(`There is no document with this Barcode in Maestro.`);
                    }
                    if (!this.digitizationService.isInFinishStep(data, this.deskConfig.maestroFinishStep)){
                        throw new Error(`Document is not in finish step in Maestro. Please contact digitization department.`);
                    }
                }),
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
      this.itemFromAlma=null;
      this.barcode.nativeElement.value = "";
      this.barcodeForMaestro = "";
  }
}

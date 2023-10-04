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
      this.loading.emit(true);
      this.checkBarcodeStatusInAlmaAndMaestro().subscribe(
          result => {
              this.receiveFromDigi();
          },
          error => {
              this.alert.error(error.message);
              this.loading.emit(false);
              throwError(() => new Error(error.message));
          }
      );
  }

    // todo cleanup in the variables and functions
    private receiveFromDigi() {
        this.digitizationService.receive(this.barcodeForMaestro, this.deskConfig)
            .pipe(
                tap(data => data.hasOwnProperty('error') ? null :this.alert.success('Document is successfully finished in Maestro.')),
                switchMap(() => this.almaService.receiveFromDigi(this.itemFromAlma.link, this.libCode, this.deskConfig.deskCode.trim(), this.deskConfig.workOrderType.trim())),
                switchMap(() => {
                    if (this.deskConfig.removeTempLocation) {
                        return this.almaService.removeTemporaryLocation(this.itemFromAlma);
                    } else {
                        return of('ok');
                    }
                })
            )
            .subscribe({
                next: result => {
                    this.loading.emit(false);
                    this.resetForm(new Result(true, "Received from digitization"));
                },
                error: error => {
                    this.loading.emit(false);
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
                tap(() => this.loading.emit(false))
            );
    }


    private checkStatusInDigitization(barcode: string) {
        return this.digitizationService.check(barcode,this.deskConfig)
            .pipe(
                tap( () =>this.loading.emit(false)),
                tap(data => {
                    console.log(data);
                    if(this.isBarcodeNew(data)){
                        throw new Error(`There is no document with this Barcode in Maestro.`);
                    }
                    if (!this.isInFinishStep(data)){
                        throw new Error(`Document is not in finish step in Maestro. Please contact digitization department.`);
                    }
                }),
            );
    }


    isInFinishStep(data) {
        let finish_step = this.deskConfig.maestroFinishStep.trim();
        if (data.hasOwnProperty('step_title')) {
            return data.step_title === finish_step;
        }
    }

    private isBarcodeNew(data) {
        return data.hasOwnProperty('error') && data.error === 'No book found with the barcode';
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
        return this.almaService.getItemsFromBarcode(encodedBarcode);
    }
  resetForm(message) {
      this.itemFromAlma=null;
      this.barcode.nativeElement.value = "";
      this.barcodeForMaestro = "";
  }
}

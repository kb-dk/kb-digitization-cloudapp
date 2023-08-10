import {Component, Input, Output, EventEmitter} from '@angular/core';
import {
  AlertService,
  CloudAppEventsService
} from '@exlibris/exl-cloudapp-angular-lib'
import {AlmaService} from "../shared/alma.service";
import { DigitizationService } from "../shared/digitization.service";
import {switchMap} from "rxjs/operators";
import {Result} from "../models/Result";
import {throwError} from "rxjs";

@Component({
  selector: 'app-send-material',
  templateUrl: './send-material.component.html',
  styleUrls: ['./send-material.component.scss']
})
export class SendMaterialComponent{

  @Input() itemFromAlma: any = null;
  @Input() barcodeForMaestro: string = null;
  @Input() libCode: string = null;
  @Input() deskConfig: any = null;
  @Output() backToMainEvent = new EventEmitter();
  @Output() loading = new EventEmitter<boolean>();
  isFraktur: boolean = false;
  isMultivolume: boolean = false;

  constructor(
      private eventService: CloudAppEventsService,
      private almaService: AlmaService,
      private alert: AlertService,
      private digitizationService: DigitizationService
  )
  { }

  sendToDigitization() {
    this.loading.emit(true);
    this.digitizationService.send(this.barcodeForMaestro,this.deskConfig,this.isFraktur,this.isMultivolume)
        .pipe(
            switchMap(data => {
              if (!data.hasOwnProperty('error')) {
                return this.almaService.sendToDigi(this.itemFromAlma.link, this.libCode, this.deskConfig.deskCode.trim(), this.deskConfig.workOrderType.trim());
              } else {
                return throwError(data.error);
              }
            }),
            switchMap(data => {
                if (!data.hasOwnProperty('error')) {
                    return this.digitizationService.goToNextStep(this.barcodeForMaestro, this.deskConfig.maestroStartStep.trim())
                } else {
                    return throwError(data.error);
                }
            })
        )
        .subscribe({
          next: result => {
            this.loading.emit(false);
            this.backToMain(new Result(true,"Sent to digitization"));
          },
          error: error => {
            this.loading.emit(false);
            this.backToMain(new Result(false,error));
          }
        });
  }

  backToMain(message) {
    this.itemFromAlma=null;
    this.backToMainEvent.emit(message);
  }
}

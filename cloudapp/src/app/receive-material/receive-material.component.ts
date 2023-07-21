import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {switchMap, tap} from "rxjs/operators";
import { DigitizationService } from "../shared/digitization.service";
import {AlmaService} from "../shared/alma.service";
import {AlertService} from "@exlibris/exl-cloudapp-angular-lib";
import {Result} from "../models/Result";
import {throwError} from "rxjs";

@Component({
  selector: 'app-receive-material',
  templateUrl: './receive-material.component.html',
  styleUrls: ['./receive-material.component.scss']
})
export class ReceiveMaterialComponent implements OnInit {
  @Input() itemFromAlma: any = null;
  @Input() barcodeForMaestro: string = null;
  @Input() deskConfig: any = null;
  @Input() libCode: string = null;
  @Output() backToMainEvent = new EventEmitter();
  @Output() loading = new EventEmitter<boolean>();

    constructor(
      private digitizationService: DigitizationService,
      private almaService: AlmaService,
      private alert: AlertService,
    ) {}
  ngOnInit(): void {
  }

  receiveFromDigitization() {
    // TODO add finish step to config
    this.loading.emit(true);
    this.digitizationService.receive(this.barcodeForMaestro,this.deskConfig)
        .pipe(
            tap( data=> {console.log(data)}),
            switchMap(data => {
                if (!data.hasOwnProperty('error')) {
                    return this.almaService.receiveFromDigi(this.itemFromAlma.link,this.libCode,this.deskConfig.deskCode.trim(),this.deskConfig.workOrderType.trim());
                } else {
                    return throwError(data.error);
                }
            })
        )
        .subscribe({
            next: result => {
              this.loading.emit(false);
              this.backToMain(new Result(true,"Recieved from digitization"));
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

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {switchMap} from "rxjs/operators";
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
  @Input() itemFromAlma: any = null;
  @Input() barcodeForMaestro: string = null;
  @Input() deskConfig: any = null;
  @Input() libCode: string = null;
  @Output() backToMainEvent = new EventEmitter();
  @Output() loading = new EventEmitter<boolean>();

    constructor(
      private digitizationService: DigitizationService,
      private almaService: AlmaService
    ) {}
  ngOnInit(): void {
  }

  receiveFromDigitization() {
    this.loading.emit(true);
    this.digitizationService.receive(this.barcodeForMaestro,this.deskConfig)
        .pipe(
            switchMap(data => {
                if (!data.hasOwnProperty('error')) {
                    return this.almaService.receiveFromDigi(this.itemFromAlma.link,this.libCode,this.deskConfig.deskCode.trim(),this.deskConfig.workOrderType.trim());
                } else {
                    return throwError(data.error);
                }
            }),
            switchMap(data => {
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
              this.backToMain(new Result(true,"Received from digitization"));
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

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {switchMap, tap} from "rxjs/operators";
import { DigitizationService } from "../shared/digitization.service";
import {AlmaService} from "../shared/alma.service";
import {AlertService} from "@exlibris/exl-cloudapp-angular-lib";
import {Result} from "../models/Result";

@Component({
  selector: 'app-receive-material',
  templateUrl: './receive-material.component.html',
  styleUrls: ['./receive-material.component.scss']
})
export class ReceiveMaterialComponent implements OnInit {
  @Input() itemFromAlma: any = null;
  @Input() department: string = null;
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
    let step_name = 'KBH billedværk modtages (SAMLINGS-EJER)';
    const barcode = this.itemFromAlma.item_data.barcode;
    this.loading.emit(true);
    this.digitizationService.receive(`&barcode=${barcode}&step_name=${step_name}`)
        .pipe(
            tap( data=> {console.log(data)}),
            switchMap(() => {
                return this.almaService.sendToDigi(this.itemFromAlma.link,this.libCode,this.department);
            })
        )
        .subscribe({
            next: result => {
              this.loading.emit(false);
              this.backToMain(new Result(true,"Recieved from digitization"));
            },
            error: error => {
              this.loading.emit(false);
              this.backToMain(new Result(false,error.message));
            }
        });
  }

  backToMain(message) {
    this.itemFromAlma=null;
    this.backToMainEvent.emit(message);
  }
}

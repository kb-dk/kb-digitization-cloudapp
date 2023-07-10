import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {tap} from "rxjs/operators";
import { DigitizationService } from "../shared/digitization.service";
import {Result} from "../models/Result";

@Component({
  selector: 'app-receive-material',
  templateUrl: './receive-material.component.html',
  styleUrls: ['./receive-material.component.scss']
})
export class ReceiveMaterialComponent implements OnInit {
  @Input() itemFromAlma: any = null;
  @Output() backToMainEvent = new EventEmitter();

  constructor(
      private digitizationService: DigitizationService,
  ) {}
  ngOnInit(): void {
  }

  receiveFromDigitization() {
    // TODO add finish step to config
    let step_name = 'KBH billedværk modtages (SAMLINGS-EJER)';
    this.digitizationService.receive(`&barcode=${this.itemFromAlma.item_data.barcode}&step_name=${step_name}`)
        .pipe(
            tap( data=> {console.log(data)}),
            tap(() => this.backToMain())
        )
        .subscribe();
  }

  backToMain() {
    this.itemFromAlma=null;
    this.backToMainEvent.emit('Back');
  }
}

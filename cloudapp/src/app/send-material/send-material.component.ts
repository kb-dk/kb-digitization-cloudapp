import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {
  AlertService,
  CloudAppEventsService
} from '@exlibris/exl-cloudapp-angular-lib'
import {AlmaService} from "../shared/alma.service";
import { digitizationService } from "../shared/digitization.service";
import {Result} from "../models/Result";
import {tap} from "rxjs/operators";

@Component({
  selector: 'app-send-material',
  templateUrl: './send-material.component.html',
  styleUrls: ['./send-material.component.scss']
})
export class SendMaterialComponent implements OnInit {

  @Input() itemFromAlma: any = null;
  @Input() department: string = null;
  @Output() result = new EventEmitter<Result>();
  @Output() loading = new EventEmitter<boolean>();
  isFraktur: boolean;
  isMultivolume: boolean;

  constructor(
      private eventService: CloudAppEventsService,
      private almaService: AlmaService,
      private digitizationService: digitizationService
  )
  { }

  ngOnInit(): void {
    this.eventService.getInitData().subscribe(data=>{
      this.department = data.user['currentlyAtDept'];
    });
  }



  sendToDigitization() {
    // TODO: call maestro
    this.digitizationService.send(`&barcode=${this.itemFromAlma.item_data.barcode}&field[customer_id]=20&field[project_id]=37&field[job_id]=54&field[step_id]=73&field[title]=QUID:999999`)
        .pipe(
            tap( data=> {console.log(data)})
        )
        .subscribe();
    // TODO: fix hardcoded values
    /*
    this.almaService.scanInItem(this.itemFromAlma.link,this.department,"digitalisering2","Digiproj")
        .subscribe({
          next: result => {
            this.result.emit(new Result(true,"Everything is ok"));
           },
          error: error => {
            this.result.emit(new Result(false,error.message));
          }
        });
        */
  }

  cancel() {
    this.itemFromAlma=null;
    this.result.emit(new Result(true,"cancelled"));
  }
}

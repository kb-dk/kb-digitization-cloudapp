import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {
  AlertService,
  CloudAppEventsService
} from '@exlibris/exl-cloudapp-angular-lib'
import {AlmaService} from "../shared/alma.service";
import { DigitizationService } from "../shared/digitization.service";
import {switchMap, tap} from "rxjs/operators";
import {query} from "@angular/animations";
import {Result} from "../models/Result";

@Component({
  selector: 'app-send-material',
  templateUrl: './send-material.component.html',
  styleUrls: ['./send-material.component.scss']
})
export class SendMaterialComponent implements OnInit {

  @Input() itemFromAlma: any = null;
  @Input() department: string = null;
  @Input() libCode: string = null;
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

  ngOnInit(): void {
    this.eventService.getInitData().subscribe(data=>{
      this.department = data.user['currentlyAtDept'];
    });
  }



  sendToDigitization() {
    let queryParams = this.getQueryParams();
    this.loading.emit(true);
    this.digitizationService.send(queryParams)
        .pipe(
            tap(data => console.log(data)),
            switchMap(() => {
              return this.almaService.sendToDigi(this.itemFromAlma.link,this.libCode,this.department);
            })
        )
        .subscribe({
          next: result => {
            this.loading.emit(false);
            this.backToMain(new Result(true,"Sendt to digitization"));
          },
          error: error => {
            this.loading.emit(false);
            this.backToMain(new Result(false,error.message));
          }
        });
  }

  getQueryParams() {
    let result:string = `&barcode=${this.itemFromAlma.item_data.barcode}&field[customer_id]=20&field[project_id]=37&field[job_id]=54&field[step_id]=73&field[title]=QUID:999999`
    if(this.isFraktur) {
      result = result + `&field[Fraktur]=1`;
    }
    if (this.isMultivolume) {
      result = result + `&field[Multivolume]=1`;
    }
    return result;
  }

  backToMain(message) {
    this.itemFromAlma=null;
    this.backToMainEvent.emit(message);
  }
}

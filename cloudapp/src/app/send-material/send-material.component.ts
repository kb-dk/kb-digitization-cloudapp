import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {
  AlertService,
  CloudAppEventsService
} from '@exlibris/exl-cloudapp-angular-lib'
import {AlmaService} from "../shared/alma.service";
import {DigitizationDepartmentService} from "../shared/digitizationDepartment.service";
import {Result} from "../models/Result";

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
      private digitizationDepartmentService: DigitizationDepartmentService
      )
  { }

  ngOnInit(): void {
    this.eventService.getInitData().subscribe(data=>{
      this.department = data.user['currentlyAtDept'];
    });
  }



  sendToDigitization() {
    // TODO: call maestro
    // TODO: fix hardcoded values
    this.almaService.scanInItem(this.itemFromAlma.link,this.department,"digitalisering2","Digiproj")
        .subscribe({
          next: result => {
            this.result.emit(new Result(true,"Everything is ok"));
           },
          error: error => {
            this.result.emit(new Result(false,error.message));
          }
        });
  }

  cancel() {
    this.itemFromAlma=null;
    this.result.emit(new Result(true,"cancelled"));
  }
}

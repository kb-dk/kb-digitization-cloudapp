import { Component, OnInit, Input } from '@angular/core';
import {
  CloudAppEventsService
} from '@exlibris/exl-cloudapp-angular-lib'

@Component({
  selector: 'app-send-material',
  templateUrl: './send-material.component.html',
  styleUrls: ['./send-material.component.scss']
})
export class SendMaterialComponent implements OnInit {

  @Input() barcode: string = null;
  department: string = null;
  isFraktur: boolean;
  isMultivolume: boolean;
  constructor(private eventService: CloudAppEventsService) { }

  ngOnInit(): void {
    let pageMetadata = this.eventService.getPageMetadata();

    this.eventService.getInitData().subscribe(data=>{
      console.log("InitData: "  + JSON.stringify(data));
      this.department = data.user['currentlyAtDept'];
      console.log(this.department)
    });
  }
}

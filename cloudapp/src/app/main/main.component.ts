import { Component, ElementRef,ViewChild, OnInit, OnDestroy } from '@angular/core';
import { finalize } from "rxjs/operators";
import {
  CloudAppRestService, CloudAppEventsService, AlertService,
} from '@exlibris/exl-cloudapp-angular-lib';
import { MatRadioChange } from '@angular/material/radio';
import { DigitizationDepartmentService } from "../shared/digitizationDepartment.service";
import {CloudAppOutgoingEvents} from "@exlibris/exl-cloudapp-angular-lib/lib/events/outgoing-events";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  private currentlyAtLibCode: string;
  private currentlyAtDept: string;
  loading = false;
  itemLoaded: boolean = false;
  @ViewChild('barcode', {static: false}) barcode: ElementRef;
  itemFromApi: any;
  requests: any;

  constructor(
      private restService: CloudAppRestService,
      private eventsService: CloudAppEventsService,
      private alert: AlertService,
      private digitizationDepartmentService: DigitizationDepartmentService
  ) { }



  ngOnInit() {
    this.sendToDigitizationDepartment();
    let pageMetadata = this.eventsService.getPageMetadata();
    console.log('JJ: ' + JSON.stringify(pageMetadata));

    this.eventsService.getInitData().subscribe(data=>{
      this.currentlyAtLibCode = data.user.currentlyAtLibCode;
      this.currentlyAtDept = data.user['currentlyAtDept'];
      console.log("InitData: "  + JSON.stringify(data));
    })

  }




  ngOnDestroy(): void {
  }


  private tryParseJson(value: any) {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error(e);
    }
    return undefined;
  }

  scanBarcode() {
    console.log("barcode scanned "+this.barcode.nativeElement.value)
    this.loading=true;
    const barcode = this.barcode.nativeElement.value;
    const encodedBarcode = encodeURIComponent(barcode);
    this.restService.call(`/items?item_barcode=${encodedBarcode.trim()}`)
        .subscribe(
            result => {
              this.itemFromApi = result;
              this.getItemRequests(result.link);
            },
            error => this.alert.error('Failed to retrieve entity: ' + error.message)
        );
  }

  getItemRequests(itemLink:string) {

    this.restService.call<any>(itemLink+"/requests")
        .pipe(finalize(()=> {
          this.loading=false;
          this.itemLoaded = true;
          this.barcode.nativeElement.value = "";
        }))
        .subscribe(
            result => this.requests=result,
            error => this.requests=error
        );
  }


  sendToDigitizationDepartment(){
    this.digitizationDepartmentService.send("&action=book_add&barcode=130024100538&field[customer_id]=20&field[project_id]=37&field[job_id]=54&field[step_id]=69&field[title]=QUID:999999");
  }


  sendToDigitization() {

  }

  receiveFromDigitization() {

  }
}

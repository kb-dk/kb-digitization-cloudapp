import { Component, ElementRef,ViewChild, OnInit, OnDestroy } from '@angular/core';
import { finalize } from "rxjs/operators";
import {
  CloudAppRestService, CloudAppEventsService, AlertService, Request, HttpMethod, RestErrorResponse,
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
  @ViewChild('barcode', {static: false}) barcode: ElementRef;
  readyForDigitizationDept: boolean = true;
  returnFromDigitizationDept: boolean = false;

  /* TODO delete */
  itemLoaded: boolean = false;
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

  isDOD(): boolean {
    return this.itemFromApi != null;
  }

  hasRequests(): boolean {
    return this.requests != null && this.requests.total_record_count>0;
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

  scanInItem(department:string,status:string,workOrderType:string) {
    let request: Request = {
      url: this.itemFromApi.link + "?op=scan&department="+department+"&status="+status+"&work_order_type="+workOrderType,
      method: HttpMethod.POST,
    };
    this.restService.call(request)
        .subscribe({
          next: result => {
            this.eventsService.refreshPage().subscribe(
                ()=>this.alert.success('Success!')
            );
          },
          error: (e: RestErrorResponse) => {
            this.alert.error('Failed to update data: ' + e.message);
            console.error(e);
          }
        });
  }
}

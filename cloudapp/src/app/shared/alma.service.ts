import { Injectable } from '@angular/core';
import {
  AlertService,
  CloudAppRestService,
  HttpMethod,
  Request
} from "@exlibris/exl-cloudapp-angular-lib";

@Injectable({
  providedIn: 'root'
})
export class AlmaService {

  constructor(
      private restService: CloudAppRestService,
      private alert: AlertService,
  ) { }

  scanInItem(itemLink:string, department:string, status:string, workOrderType:string) {
    let params = { 'op': 'scan', 'department' : department, 'status': status, 'work_order_type' : workOrderType };
    let request: Request = {
      url: itemLink,
      method: HttpMethod.POST,
      queryParams:params
    };
    return this.restService.call(request);
  }

  getItemsFromBarcode(barcode:string) {
    return this.restService.call(`/items?item_barcode=${barcode.trim()}`);
  }

  handleResponse(reponse:any) {
    console.log(reponse);
  }
}
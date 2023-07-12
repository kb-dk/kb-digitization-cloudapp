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


  sendToDigi(itemLink:string, library: string, department:string) {
    let params = {'op': 'scan','status':'digitaliseret1'}
    if (department !== 'DIGINAT') {
      params['department'] = department;
      params['work_order_type'] = "Digiproj";
    }
    return this.scanInItem(itemLink,params);
  }

  receiveFromDigi(itemLink:string, library: string, department:string) {
    let params = {'op': 'scan','status':'digitaliseret2','done':'true'}
    if (department !== 'DIGINAT') {
      params['department'] = department;
      params['work_order_type'] = "Digiproj";
    }
    return this.scanInItem(itemLink,params);
  }

  scanInItem(itemLink:string, params:any) {
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

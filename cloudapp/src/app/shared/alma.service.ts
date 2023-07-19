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


  sendToDigi(itemLink:string, library: string, department:string, work_order_type:string=null) {
    let params = {'op': 'scan','department' : department};
    if (work_order_type) {
      params['work_order_type'] = work_order_type;
      params['status'] = 'digitaliseret1';
    }
    if (!this.libraryEqualsInstitution(library)) {
      params['library'] = library;
    }
    return this.scanInItem(itemLink,params);
  }

  receiveFromDigi(itemLink:string, library: string, department:string,work_order_type:string=null) {
    let params = {'op': 'scan','department' : department,'done':'true'};
    if (work_order_type)  {
      params['work_order_type'] = work_order_type;
      params['status'] = 'digitaliseret2';
    }
    if (!this.libraryEqualsInstitution(library)) {
      params['library'] = library;
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


  private isWorkOrderDepartment(department: string) {
      return department !== 'DIGINAT'
  }


  private libraryEqualsInstitution(department: string) {
    return department === '45KBDK_KGL';
  }
}

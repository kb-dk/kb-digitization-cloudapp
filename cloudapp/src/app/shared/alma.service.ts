import { Injectable } from '@angular/core';
import {
  AlertService,
  CloudAppRestService,
  HttpMethod,
  Request
} from "@exlibris/exl-cloudapp-angular-lib";
import {EMPTY, of} from "rxjs";

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
    console.log(itemLink,params);

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


  getField583x(holdingLink): Promise<string> {
    return new Promise((resolve, reject) => {
      this.restService.call(holdingLink).subscribe({
        next: data => {
          if (data.hasOwnProperty('anies') && Array.isArray(data.anies)) {
            let doc = new DOMParser().parseFromString(data.anies[0], "application/xml");
            let datafields = doc.getElementsByTagName('datafield');
            for (let i = 0; i < datafields.length; i++) {
              let datafield = datafields[i] as HTMLElement;
              if (datafield.hasAttribute('tag') && datafield.getAttribute('tag') === '583') {
                let subfields = datafield.getElementsByTagName('subfield');
                for (let j = 0; j < subfields.length; j++) {
                  let subfield = subfields[j] as HTMLElement;
                  if (subfield.hasAttribute('code') && subfield.getAttribute('code') === 'x') {
                    resolve(subfield.textContent);
                    return;
                  }
                }
              }
            }
          }
          resolve('');
        },
        error: err => {
          resolve('');
        }
      });
    });
  }

  removeTemporaryLocation(itemFromApi) {
    let updatedItem = itemFromApi;
    if (updatedItem.holding_data.in_temp_location) {
      updatedItem.holding_data.in_temp_location = false;
      let request: Request = {
        url: itemFromApi.link,
        method: HttpMethod.PUT,
        requestBody: updatedItem
      };
      return this.restService.call(request);
    } else {
      return of('No temporary location to remove.');
    }
  }


  private libraryEqualsInstitution(libCode: string) {
    return libCode === '45KBDK_KGL';
  }
}

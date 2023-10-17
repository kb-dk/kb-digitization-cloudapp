import { Injectable } from '@angular/core';
import {
  CloudAppRestService,
  HttpMethod,
  Request
} from "@exlibris/exl-cloudapp-angular-lib";
import {Observable, of, throwError} from "rxjs";
import {concatMap, map, tap} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AlmaService {

  constructor(
      private restService: CloudAppRestService,
      private http: HttpClient,
  ) { }


  sendToDigi(itemLink:string, library: string, department:string, work_order_type:string=null, institution: string) {

    let params = {'op': 'scan','department' : department};
    if (work_order_type) {
      params['work_order_type'] = work_order_type;
      params['status'] = 'digitaliseret2';
    }
    if (!this.libraryEqualsInstitution(library, institution)) {
      params['library'] = library;
    }
    return this.scanInItem(itemLink,params);
  }

  receiveFromDigi(itemLink:string, library: string, department:string,work_order_type:string=null, institution: string) {
    let params = {'op': 'scan','department' : department,'done':'true'};
    if (work_order_type)  {
      params['work_order_type'] = work_order_type;
      params['status'] = 'digitaliseret1';
    }
    if (!this.libraryEqualsInstitution(library, institution)) {
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

  getItemFromAlma(useField583x, barcodeOrField583x, institution, almaUrl){
    console.log(barcodeOrField583x);
    const encodedBarcodeOrField583x = encodeURIComponent(barcodeOrField583x).trim();
    if(useField583x){
      return this.getItemsFromField583x(encodedBarcodeOrField583x, institution, almaUrl);
    }else{
      return this.getItemsFromBarcode(encodedBarcodeOrField583x);
    }
  }
  getItemsFromBarcode(barcode:string) {
    return this.restService.call(`/items?item_barcode=${barcode.trim()}`);
  }

  getItemsFromField583x(field583x:string, institution, almaUrl) {
    return this.getMMSIDFromField583x(field583x, institution, almaUrl).pipe(
        concatMap(mmsid => this.getHoldingsFromMMSID(mmsid)),
        concatMap(holdings => this.getItemFromHolding(holdings)),
        map(items => items.item[0] && items.item[0].item_data && items.item[0].item_data.barcode ? items.item[0].item_data.barcode : undefined),
        map(barcodeOrUndefined => barcodeOrUndefined === 'undefined' ? throwError(() => new Error(`Barcode not found.`)) : barcodeOrUndefined),
        concatMap(barcode => this.getItemsFromBarcode(barcode)),
        tap(data => console.log('Item:', data))
    );
  }



  getMMSIDFromField583x(fieldContent: string, institution, almaUrl) {
    const url = `${almaUrl}/view/sru/${institution}?version=1.2&operation=searchRetrieve&recordSchema=marcxml&query=alma.all_for_ui=${fieldContent}`;
    return this.http.post(url,'',
        {
          responseType: 'text',
          withCredentials: false,
        }).pipe(
        map(data => {
          let parser = new DOMParser();
          return parser.parseFromString(data,"text/xml");
        }),
        map(xmlDoc => {
          console.log(xmlDoc);
          let numberOfRecords: number;
          numberOfRecords = parseInt(xmlDoc.getElementsByTagName("numberOfRecords")[0]?.innerHTML);
          switch (numberOfRecords) {
            case 1:
              return xmlDoc.getElementsByTagName("recordIdentifier")[0]?.innerHTML;
            case 0:
              throw new Error(`Barcode or Field583x not exists.`);
            default:
              throw new Error(`Field583x is not unique.`);
          }
        }),
        tap(data => console.log(data))
    );
  }


  getHoldingsFromMMSID(mmsid: string) {
    return this.restService.call(`/bibs/${mmsid.trim()}/holdings`);
  }

  getItemFromHolding(holdings) {
    console.log(holdings.holding[0].link);
    return this.restService.call(`${holdings.holding[0].link}/items`);
  }
  isField583xUnique(fieldContent, institution, almaUrl) : Observable<boolean>{
    const url = `${almaUrl}/view/sru/${institution}?version=1.2&operation=searchRetrieve&recordSchema=marcxml&query=alma.all_for_ui=${fieldContent}`;
    return this.http.post(url,'',
        {
          responseType: 'text',
          withCredentials: false,
        }).pipe(
        map(data => {
          let parser = new DOMParser();
          return parser.parseFromString(data,"text/xml");
        }),
        map(xmlDoc => xmlDoc.getElementsByTagName("numberOfRecords")[0]?.innerHTML === '1')
    );
}

  getField583x(holdingLink) {
    return this.restService.call(holdingLink).pipe(
        map(response => response.hasOwnProperty('anies') && Array.isArray(response.anies) ? response.anies[0] : ''),
        map(xmlDoc => {
          return this.getFieldContentFromXML(xmlDoc, '583', 'x');
        })
      )
  }

  private getFieldContentFromXML(xmlDoc, tag, code) {
    console.log(xmlDoc);
    let doc = new DOMParser().parseFromString(xmlDoc, "application/xml");
    let fieldContent = doc.querySelectorAll(`datafield[tag='${tag}'] subfield[code='${code}']`);
    console.log(fieldContent, fieldContent.length, fieldContent[0].innerHTML);
    if (fieldContent.length === 1) {
      return fieldContent[0].textContent;
    } else {
      return '';
    }
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
      return of('NoTemp');
    }
  }

  getBarcodeOrField583x(barcode, useMarcField, link): Observable<string> {
    let barcodeForMaestro = barcode;
    if (useMarcField) {
      return this.getField583x(link).pipe(
          map(field583x => {
                if (field583x) {
                  barcodeForMaestro = field583x;
                } else {
                  console.log("field583x has no value");
                }
                return barcodeForMaestro;
              }
          )
      )
    } else {
      return of(barcodeForMaestro);
    }
  }

  private libraryEqualsInstitution(libCode: string, institution: string) {
    return libCode === institution;
  }
}

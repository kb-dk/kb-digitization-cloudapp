import { Injectable } from '@angular/core';
import {
  CloudAppRestService,
  HttpMethod,
  Request
} from "@exlibris/exl-cloudapp-angular-lib";
import {Observable, of, throwError} from "rxjs";
import {catchError, concatMap, map, tap} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {MatDialog} from "@angular/material/dialog";
import {ItemListDialogComponent} from "../item-list-dialog/item-list-dialog.component";

@Injectable({
  providedIn: 'root'
})
export class AlmaService {

  constructor(
      private restService: CloudAppRestService,
      private http: HttpClient,
      public dialog: MatDialog
  ) { }


  sendToDigi = (itemLink:string, library: string, department:string, work_order_type:string=null, institution: string) => {
    let params = {'op': 'scan','department' : department};
    if (work_order_type) {
      params['work_order_type'] = work_order_type;
      params['status'] = 'digitaliseret1';
    }
    if (!this.libraryEqualsInstitution(library, institution)) {
      params['library'] = library;
    }
    return this.scanInItem(itemLink,params);
  }

  receiveFromDigi = (itemLink:string, library: string, department:string,work_order_type:string=null, institution: string) => {
    let params = {'op': 'scan','department' : department,'done':'true'};
    if (work_order_type)  {
      params['work_order_type'] = work_order_type;
      params['status'] = 'digitaliseret2';
    }
    if (!this.libraryEqualsInstitution(library, institution)) {
      params['library'] = library;
    }
    return this.scanInItem(itemLink,params);
  }

  scanInItem = (itemLink:string, params:any) => {
    let request: Request = {
      url: itemLink,
      method: HttpMethod.POST,
      queryParams:params
    };
    return this.restService.call(request);
  }

  getItemsFromAlma = (useField583x, barcodeOrField583x, institution, almaUrl) => {
    const encodedBarcodeOrField583x = encodeURIComponent(barcodeOrField583x).trim();
    if(useField583x){
      return this.getItemsFromBarcode(encodedBarcodeOrField583x)
          .pipe(
              catchError(error => error.message === `No items found for barcode ${encodedBarcodeOrField583x.trim()}.` ? of('Barcode not found') : error)
          )
          .pipe(
              concatMap(response => response === 'Barcode not found' ? this.getItemsFromField583x(encodedBarcodeOrField583x, institution, almaUrl) : of(response))
          )
    }else{
      return this.getItemsFromBarcode(encodedBarcodeOrField583x);
    }
  }

  getItemsFromBarcode = (barcode:string) => this.restService.call(`/items?item_barcode=${barcode.trim()}`);

  getItemsFromField583x = (field583x:string, institution, almaUrl) => this.getMmsIdAndHoldingIdFromField583x(field583x, institution, almaUrl).pipe(
      concatMap(([mms_id, holding_id]) => holding_id === '' ? this.getHoldingIdFromMMSID(mms_id) : of([mms_id, holding_id])),
      concatMap(([mms_id, holding_id]) => this.getItemFromHolding(`/almaws/v1/bibs/${mms_id}/holdings/${holding_id}/items`)),
      concatMap(items => {
        if (items.hasOwnProperty('item')) {
          items = items.item;
          switch (items.length) {
            case 0:
              throw new Error(`There is no item.`);
            case 1:
              return of(items[0]);
            default:
              return this.showItemListDialog(items);
          }
        } else {
          throw new Error(`There is no item.`);
        }
      }),
      map(item => {
        if (!item) {
          throw new Error(`No item is selected.`);
        } else {
          return item;
        }
      }),
  );

  getMmsIdAndHoldingIdFromField583x = (fieldContent: string, institution, almaUrl) => this.http.post(`${almaUrl}view/sru/${institution}?version=1.2&operation=searchRetrieve&recordSchema=marcxml&query=alma.action_note_note==${fieldContent}`,'',

        // Søg i mms_id og felt583x http://localhost:4200/view/sru/45KBDK_KGL?version=1.2&operation=searchRetrieve&recordSchema=marcxml&query=alma.action_note_note==TUESUNIKKE_filnavnssyntax%20or%20alma.mms_id==99124929653105763
        // Søg i alle marc felter plus barcode og mere   http://localhost:4200/view/sru/45KBDK_KGL?version=1.2&operation=searchRetrieve&recordSchema=marcxml&query=alma.all_for_ui=99122912149905763
        {
          responseType: 'text',
          withCredentials: false,
        }).pipe(
        map(data => new DOMParser().parseFromString(data,"text/xml")),
        map((xmlDoc: Document): [Document, string] => this.getMMSIDFromMarc(xmlDoc)),
        map(([xmlDoc, MMSID]): [string, string]=> [MMSID, this.getHoldingNrFromMarc(xmlDoc)])
    );

  getHoldingIdFromMMSID = (mmsid: string): Observable<[string, string]> => this.restService.call(`/bibs/${mmsid.trim()}/holdings`).pipe(
        map (holdings => holdings.hasOwnProperty('holding') && holdings['holding'][0] && holdings['holding'][0]['holding_id'] ? holdings['holding'][0]['holding_id'] : ''),
        map (holdingId => [mmsid, holdingId])
    );

  getItemFromHolding = (link) => this.restService.call(`${link}`);

  getRequestsFromItem = (link) => this.restService.call(`${link}/requests`);

  isField583xUnique = (fieldContent, institution, almaUrl) : Observable<boolean> => {
    const url = `${almaUrl}view/sru/${institution}?version=1.2&operation=searchRetrieve&recordSchema=marcxml&query=alma.all_for_ui=${fieldContent}`;
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

  getHolding = (holdingLink) => this.restService.call(holdingLink);

  getXmlDocFromHolding = (holding) => {
    const XMLText = holding.hasOwnProperty('anies') && Array.isArray(holding.anies) ? holding.anies[0] : '';
    return new DOMParser().parseFromString(XMLText, "application/xml");
  }

  getField583x(link, inputText) {
    return this.getHolding(link).pipe(
        map(holding => this.getXmlDocFromHolding(holding)),
        map(xmlDoc => this.getFieldContentArrayFromXML(xmlDoc, '583', 'x')),
        map(fieldContentArray => this.hasMultipleField583x(fieldContentArray) ? inputText : this.getFieldContentFromArray(fieldContentArray)),
        tap(field583x => {
          if (!field583x) {
            console.log("field583x has no value");
          }
        }),
    )
  }

  checkIfdeskCodeIsDestination(request, deskCode): boolean {
    if (request.user_request && request.user_request[0]?.target_destination?.value) {
      return request.user_request[0]?.target_destination?.value === deskCode;
    }
    return true;
  }

  isInLFDODTempLocation = (itemFromApi) => itemFromApi.holding_data?.temp_location?.value?.toString().trim().startsWith('LFDOD');

  removeTemporaryLocation = (itemFromApi) => {
    let updatedItem = itemFromApi;
    if (updatedItem.holding_data.in_temp_location) {
      updatedItem.holding_data.in_temp_location = false;
      updatedItem.holding_data.temp_location = {};
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

  hasMultipleField583x = (xmlDoc) => {
    return xmlDoc.length > 1;
  }

  private getFieldContentArrayFromXML = (xmlDoc, tag, code): string[] => {
    return xmlDoc.querySelectorAll(`datafield[tag='${tag}'] subfield[code='${code}']`);
  }

  private getMMSIDFromMarc = (xmlDoc: Document): [Document, string] => {
    if ((xmlDoc.getElementsByTagName("diagnostics")[0]?.innerHTML)){
      console.error(xmlDoc.getElementsByTagName("diagnostics")[0]?.innerHTML);
    }
    let numberOfRecords: number;
    numberOfRecords = parseInt(xmlDoc.getElementsByTagName("numberOfRecords")[0]?.innerHTML);
    switch (numberOfRecords) {
      case 1:
        let MMSID = xmlDoc.getElementsByTagName("recordIdentifier")[0]?.innerHTML;
        return [xmlDoc, MMSID];
      case 0:
        throw new Error(`Barcode or field 583x doesn't exist.`);
      default:
        throw new Error(`Field583x is not unique.`);
    }
  }

  private getHoldingNrFromMarc = (xmlDoc: Document): string => this.getFieldContentFromArray(this.getFieldContentArrayFromXML(xmlDoc, 'AVA', '8'));

  private libraryEqualsInstitution = (libCode: string, institution: string) => libCode === institution;

  private getFieldContentFromArray(fieldContent) {
    if (fieldContent.length === 1) {
      return fieldContent[0].textContent;
    } else {
      return '';
    }
  }

  private async showItemListDialog(itemList: any[]) {
    const dialogRef = this.dialog.open(ItemListDialogComponent, {
      width: '26.5rem',
      data: {
        dialogTitle: 'Choose an item:',
        items: itemList,
        yesButtonText: 'Continue',
        noButtonText: 'Cancel'
      }
    });

    return await dialogRef.afterClosed().toPromise();
  }
}

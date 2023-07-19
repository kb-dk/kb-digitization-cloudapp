import {Injectable} from '@angular/core';
import {CloudAppConfigService} from '@exlibris/exl-cloudapp-angular-lib';
import {HttpClient} from '@angular/common/http';
import {catchError, filter, map, tap} from "rxjs/operators";
import {EMPTY, Observable, throwError} from "rxjs";
import * as string_decoder from "string_decoder";

@Injectable({
    providedIn: 'root',
})
export class DigitizationService {
    config: any;

    constructor(private configService: CloudAppConfigService, private http: HttpClient) {
        configService.get().subscribe(config => {
            console.log("got config");
            console.log(config);
            this.config = config;
        })
    }

    check(barcode:string,deskConfig:any):Observable<any> {
        return this.callApi('book_info',`barcode=${barcode}`);
    }


    send(barcode:string, deskConfig:any, fraktur:boolean, multiVolume:boolean) {
        let queryParams = this.getDeskParams(deskConfig);
        queryParams = `barcode=${barcode}${queryParams}`;
        if (fraktur) {
            queryParams = `${queryParams}&field[Fraktur]=1`;
        }
        if (multiVolume) {
            queryParams = `${queryParams}&field[Multivolume]=1`;
        }
        return this.callApi('book_add',queryParams);
    }

    receive(barcode:string,deskConfig:any) {
        let queryParams= `barcode=${barcode}&step_name=${deskConfig.maestroFinishStep.trim()}`;
        return this.callApi('step_finish',queryParams);
    }

    private getDeskParams(deskConfig: any) {
        let params = ``;
        deskConfig.params.forEach((param,index) => {
            params = `${params}&${this.config.paramNames[index].trim()}=${param.value.trim()}`
        });
        return params;
    }

    private callApi(action:string,queryParams:string) {
        if (this.config.serviceUrl && this.config.apiKey) {
            let url = `${this.config.serviceUrl.trim()}?key=${this.config.apiKey.trim()}&action=${action}&${queryParams}`
            console.log(url);
            return this.http.post(url,'',
                {
                    responseType: 'text',
                    withCredentials: false,
                }).pipe(
                map(data => JSON.parse(data))
            );
        }
        return throwError("serviceURL or apiKey undefined");
    }


    // private handleError = (err: any) => {
    //     console.error(err.status);
    //     console.error(err);
    //     return throwError(err);
    // };

    // private handleMaestroError = (data: Object) => {
    //     console.log(data);
    //     if (data.hasOwnProperty('error')){
    //         this.barcodeIsAlreadyInUse(data);
    //     }
    // };
    //
    // private barcodeIsAlreadyInUse(data: Object) {
    //     if (data['error'].hasOwnProperty('barcode')) {
    //         let errorMessage = data['error']['barcode'][0];
    //         let barcode = errorMessage.substring(errorMessage.indexOf('"') + 1, errorMessage.lastIndexOf('"'));
    //         if (errorMessage.includes('has already been taken')) {
    //             console.error('This barcode cannot be added, since it already exists in Digitization department system.');
    //         }
    //     }
    // }
}

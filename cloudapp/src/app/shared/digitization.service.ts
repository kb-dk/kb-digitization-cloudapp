import {Injectable} from '@angular/core';
import {CloudAppConfigService} from '@exlibris/exl-cloudapp-angular-lib';
import {HttpClient} from '@angular/common/http';
import {catchError, filter, map, tap} from "rxjs/operators";
import {EMPTY, throwError} from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class DigitizationService {
    config = {api:{url:'http://mae-api-test-01.kb.dk/api/', key: 'key=ff74e7fb2254dd3ce3703ae049432615cb7a8c9cf3d947c5b99d846e6ee5073149932f2eec7f1585a8dd72f712a2864b0037f17dbf59dd86dc7773e687602692'}}

    constructor(private configService: CloudAppConfigService, private http: HttpClient) { }

    send(queryParams: string){
        if (this.config.api.url) {
            this.config.api.key = this.config.api.key ? this.config.api.key : '';
            return this.callApi(`${this.config.api.url}?${this.config.api.key}&action=book_add${queryParams}`);
        }
        return EMPTY;
    }

    check(queryParams: string){
        if (this.config.api.url) {
            this.config.api.key = this.config.api.key ? this.config.api.key : '';
            return this.callApi(`${this.config.api.url}?${this.config.api.key}&action=book_info${queryParams}`);
        }
        return EMPTY;
    }

    receive(queryParams: string){
        if (this.config.api.url) {
            this.config.api.key = this.config.api.key ? this.config.api.key : '';
            return this.callApi(`${this.config.api.url}?${this.config.api.key}&action=step_finish${queryParams}`);
        }
        return EMPTY;
    }

    private getConfig() {
        return this.configService.get()
            .pipe(
                catchError(error => {
                    console.log('Error getting configuration:', error);
                    return EMPTY;
                })
            );
    }

    private callApi(url: string) {
        return this.http.post(url,'',
            {
                responseType: 'text',
                withCredentials: false,
            }).pipe(
            map(data => JSON.parse(data)),
            // catchError(err => this.handleError(err))
        );
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
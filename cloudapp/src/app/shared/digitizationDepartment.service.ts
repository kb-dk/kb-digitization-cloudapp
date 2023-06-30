import {Injectable} from '@angular/core';
import {CloudAppConfigService} from '@exlibris/exl-cloudapp-angular-lib';
import {HttpClient} from '@angular/common/http';
import {catchError, filter, map, tap} from "rxjs/operators";
import {EMPTY, throwError} from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class DigitizationDepartmentService {

    constructor(private configService: CloudAppConfigService, private http: HttpClient) { }

    send(queryParams: string){
        let config = this.getConfig();
        config.subscribe(
            (config) => {
                if(config.api.url){
                    config.api.key = config.api.key ? config.api.key : '';
                    this.sendToDigitization(`${config.api.url}?${config.api.key}${queryParams}`);
                }
            }
        );
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

    private sendToDigitization(url: string) {
        console.log(url);
        return this.http.post(url,'',
            {
                responseType: 'text',
                withCredentials: false,
            }).pipe(
            map(data => JSON.parse(data)),
            tap(data => data.hasOwnProperty('error') ? this.handleMaestroError(data) : null),
            filter(data => !data.hasOwnProperty('error')),
            tap(data => console.log(data)),
            catchError(err => this.handleError(err))
        ).subscribe();
    }

    private handleError = (err: any) => {
        console.error(err.status);
        console.error(err);
        return throwError(err);
    };

    private handleMaestroError = (data: Object) => {
        if (data.hasOwnProperty('error')){
            this.barcodeIsAlreadyInUse(data);
        }
    };

    private barcodeIsAlreadyInUse(data: Object) {
        if (data['error'].hasOwnProperty('barcode')) {
            let errorMessage = data['error']['barcode'][0];
            let barcode = errorMessage.substring(errorMessage.indexOf('"') + 1, errorMessage.lastIndexOf('"'));
            if (errorMessage.includes('has already been taken')) {
                console.error('This barcode cannot be added, since it already exists in Digitization department system.');
            }
        }
    }
}
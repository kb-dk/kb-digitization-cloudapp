import {Injectable} from '@angular/core';
import {CloudAppConfigService} from '@exlibris/exl-cloudapp-angular-lib';
import {HttpClient} from '@angular/common/http';
import {catchError, filter, tap} from "rxjs/operators";
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
                this.sendToDigitization(`${config.api.url}?${config.api.key}${queryParams}`);
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
        return this.http.post(url,
            JSON.stringify({}),
            {
                responseType: 'json',
                withCredentials: false,
            }).pipe(
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
        console.log(data);
        if (data.hasOwnProperty('error')){
            if (data['error'].hasOwnProperty('barcode')){
                let errorMessage = data['error']['barcode'][0];
                console.log(errorMessage.substring(errorMessage.indexOf('"') + 1, errorMessage.lastIndexOf('"')))
            }
        }
        console.error(data);
    };
}
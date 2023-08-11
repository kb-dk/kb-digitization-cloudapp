import {Injectable} from '@angular/core';
import {CloudAppConfigService} from '@exlibris/exl-cloudapp-angular-lib';
import {HttpClient} from '@angular/common/http';
import {map} from "rxjs/operators";
import {Observable, throwError} from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class DigitizationService {
    config: any;

    constructor(private configService: CloudAppConfigService, private http: HttpClient) {
        configService.get().subscribe(config => {
            this.config = config;
        })
    }

    check(barcode:string,deskConfig:any):Observable<any> {
        return this.callApi('book_info',`barcode=${barcode}`);
    }


    send(barcode:string, deskConfig:any, fraktur:boolean, multiVolume:boolean, title: string) {
        let queryParams = this.getDeskParams(deskConfig);
        queryParams = `barcode=${barcode}${queryParams}`;
        if (fraktur) {
            queryParams = `${queryParams}&field[Fraktur]=1`;
        }
        if (multiVolume) {
            queryParams = `${queryParams}&field[Multivolume]=1`;
        }
        if (title !== "") {
            queryParams = `${queryParams}&field[title]=${title}`;
        }
        return this.callApi('book_add',queryParams);
    }

    receive(barcode:string,deskConfig:any) {
        return this.goToNextStep(barcode, deskConfig.maestroFinishStep);
    }

    goToNextStep(barcode: string, currentStep: any) {
        let queryParams = `barcode=${barcode}&step_name=${currentStep.trim()}`;
        return this.callApi('step_finish', queryParams);
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
}

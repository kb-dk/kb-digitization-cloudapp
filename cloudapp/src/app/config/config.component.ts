import {Component} from '@angular/core';
import {CloudAppConfigService} from '@exlibris/exl-cloudapp-angular-lib';
import {catchError, tap} from 'rxjs/operators';
import {EMPTY, Observable} from "rxjs";
import {ToastrService} from 'ngx-toastr';
import {Config} from "./config";

@Component({
    selector: 'app-config',
    templateUrl: './config.component.html',
    styleUrls: ['./config.component.scss']
})

export class ConfigComponent {

    loading: boolean = true;
    config: Config = {api: {
            url: "",
            key: ""
        }
    };

    config$: Observable<Config> = this.configService.get()
        .pipe(
            tap(config => this.config = Object.assign(this.config, config)),
            tap(() => this.loading = false),
            catchError(error => {
                console.log('Error getting configuration:', error);
                return EMPTY;
            })
        );

    constructor(private configService: CloudAppConfigService,
                private toastr: ToastrService) {
    }

    saveConfig = ($event, toastMessage) => {
        this.configService.set(this.config).pipe(
        ).subscribe(
            () => this.toastr.success(toastMessage, 'Config updated', {timeOut: 2000}),
            error => console.log('Error saving configuration:', error)
        )
    };
}


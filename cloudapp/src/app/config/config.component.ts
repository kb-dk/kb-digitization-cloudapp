import { Component, OnInit, Injectable } from '@angular/core';
import { AppService } from '../app.service';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import { CloudAppConfigService, CloudAppEventsService, CloudAppRestService, InitData, AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { CanActivate, Router } from '@angular/router';
import { Observable, iif, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-config',
    templateUrl: './config.component.html',
    styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {
    baseForm: FormGroup;
    saving = false;

    constructor(
        private appService: AppService,
        private formBuilder: FormBuilder,
        private configService: CloudAppConfigService,
        private alert: AlertService
    ) { }

    ngOnInit() {
        this.appService.setTitle('Configuration');
        this.baseForm = this.formBuilder.group({
            serviceUrl: this.formBuilder.control(''),
            apiKey: this.formBuilder.control(''),
            params: this.formBuilder.array([this.formBuilder.control('')]),
            deskCode: this.formBuilder.control(''),
            paramValues: this.formBuilder.array([this.formBuilder.control('')])
        });
        this.load();
    }

    params(): FormArray {
        return this.baseForm.get("params") as FormArray
    }

    paramValues(): FormArray {
        return this.baseForm.get("paramValues") as FormArray
    }
    load() {
        this.configService.getAsFormGroup().subscribe( config => {
            if (Object.keys(config.value).length!=0) {
                this.baseForm = config;
            }
        });
    }


    save() {
        //console.log("Dette gemmes: 0 " + JSON.stringify(this.baseForm.value))
        this.saving = true;
        this.configService.set(this.baseForm.value).subscribe(
            () => {
                this.alert.success('Configuration successfully saved.');
                this.baseForm.markAsPristine();
            },
            err => this.alert.error(err.message),
            ()  => this.saving = false
        );
    }

    removeAllConfigs() {
        this.configService.remove().subscribe( () => console.log('removed') );
    }

    removeParam(i: number) {
        this.params().removeAt(i);
    }

    addNewParam() {
        this.params().push(this.formBuilder.control(""));
    }

    showAddButton(i: number) {
        let showAddButton = this.params().length-1>i;
        //console.log(this.params().length + '  ' + i + ' ' + showAddButton );
        return showAddButton;
        
    }
}

@Injectable({
    providedIn: 'root',
})
export class ConfigurationGuard implements CanActivate {
    constructor (
        private eventsService: CloudAppEventsService,
        private restService: CloudAppRestService,
        private router: Router
    ) {}

    canActivate(): Observable<boolean> {
        return this.eventsService.getInitData().pipe(
            switchMap( initData => this.restService.call(`/users/${initData.user.primaryId}`)),
            map( user => {
                /*
                        if (!user.user_role.some(role=>role.role_type.value=='221')) {
                          this.router.navigate(['/error'],
                            { queryParams: { error: ErrorMessages.NO_ACCESS }});
                          return false;
                        }
                */
                return true;
            })
        );
    }

}


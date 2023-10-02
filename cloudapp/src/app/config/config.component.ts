import {Component, Injectable, OnInit} from '@angular/core';
import {AppService} from '../app.service';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {
    AlertService,
    CloudAppConfigService,
    CloudAppEventsService,
    CloudAppRestService
} from '@exlibris/exl-cloudapp-angular-lib';
import {CanActivate} from '@angular/router';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

@Component({
    selector: 'app-config',
    templateUrl: './config.component.html',
    styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {
    form: FormGroup;
    isSaving: boolean;
    rawValue = "";

    constructor(
        private appService: AppService,
        private fb: FormBuilder,
        private configService: CloudAppConfigService,
        private alert: AlertService
    ) { }

    ngOnInit() {
        this.isSaving = false;
        this.appService.setTitle('Configuration');
        this.form = this.fb.group({
            serviceUrl: this.fb.control(''),
            apiKey: this.fb.control(''),
            paramNames: this.fb.array([this.fb.control('')]),
            desks: this.initDeskGroup(),
        });
        this.load();
    }
    load() {
        this.configService.getAsFormGroup().subscribe(
            config => {
                if (Object.keys(config.value).length!=0) {
                    this.form = config;
                }
            });
    }

    save() {
        this.isSaving = true;
        console.log(this.form.value);
        this.configService.set(this.form.value).subscribe(
            () => {
                this.alert.success('Configuration successfully saved.');
                this.form.markAsPristine();
            },
            err => this.alert.error(err.message),
            ()  => this.isSaving = false
        );
    }

    //The call button is commented out in the html. Might come in handy during testing.
    removeAllConfigs() {
        this.configService.remove().subscribe();
    }

    removeParamName(i: number) {
        (< FormArray > this.form.get("paramNames")).removeAt(i);
        let desks = this.form.get("desks") as FormArray;
        for (let control of desks.controls) {
            (< FormArray > control.get("params")).removeAt(i);
        }
    }

    addNewParamName() {
        (< FormArray > this.form.get("paramNames")).push(this.fb.control(''));
        let desks = this.form.get("desks") as FormArray;
        for (let control of desks.controls) {
            (< FormArray > control.get("params")).push(this.createParamGroup(null));
        }
    }

    getParamsNames() {
        return this.form.get("paramNames") as FormArray;
    }


    removeDesk(i: number) {
        (< FormArray > this.form.get("desks")).removeAt(i);
    }

    addNewDesk() {
        let paramNames = this.form.get('paramNames') as FormArray;
        (< FormArray > this.form.get("desks")).push(this.createDesk(paramNames));
    }

    initDeskGroup() {
        return new FormArray([ this.createDesk(null)])
    }
    createDesk(paramNames: FormArray) {
        return new FormGroup({
            deskName: this.fb.control(''),
            deskCode: this.fb.control(''),
            workOrderType: this.fb.control(''),
            maestroStartStep: new FormControl(''),
            maestroFinishStep: new FormControl(''),
            multiform: new FormControl(''),
            frakture: new FormControl(''),
            showTitle: new FormControl(''),
            useMarcField: new FormControl(''),
            removeTempLocation: new FormControl(''),
            params: this.createParams(paramNames)
        })
    }

    createParams(paramNames: FormArray){
        let newParams = new FormArray([]);
        if (paramNames != null) {
            for (let control of paramNames.controls) {
                let newParamGroup = this.createParamGroup(control.value);
                newParams.push(newParamGroup);
            }
        } else {
            newParams.push(this.createParamGroup(""));
        }
        return newParams;
    }

    createParamGroup(paramName: string) {
        let paramGroup = new FormGroup({
            key: new FormControl(),
            value: new FormControl(),
        })
        let key = paramGroup.get("key") as FormControl
        key.setValue(paramName);
        let value = paramGroup.get("value") as FormControl
        value.setValue("");
        return paramGroup;
    }


    getParamNameForIndex(paramNameIndex: number) {
        try {
            let paramNames = this.form.get("paramNames") as FormArray;
            return paramNames.controls[paramNameIndex].value;
        } catch (e) {
            return 'no param name added'
        }
    }

    getDesks() {
        return this.form.get("desks") as FormArray;
    }

    getDeskFromIndex(deskIndex: number) {
        return this.getDesks()[deskIndex] as FormGroup;
    }

    getParamsFor(deskIndex: number) {
        var params = ( < FormArray > ( < FormArray > this.form.get('desks')).controls[deskIndex].get('params'));
        if(params != null) {
            return ( < FormArray > ( < FormArray > this.form.get('desks')).controls[deskIndex].get('params')).controls;
        }
        else {
            console.log("No params for desk no " + deskIndex);
        }
    }


}

@Injectable({
    providedIn: 'root',
})
export class ConfigurationGuard implements CanActivate {
    constructor (
        private eventsService: CloudAppEventsService,
        private restService: CloudAppRestService,
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


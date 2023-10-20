
import { Injectable } from '@angular/core';
import { InitService } from '@exlibris/exl-cloudapp-angular-lib';
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AppService {
    private title = new BehaviorSubject<string>('App title');
    private title$ = this.title.asObservable();

    constructor(private initService: InitService) {}

    setTitle(title: string) {
        this.title.next(title);
    }

    getTitle(): Observable<string> {
        return this.title$;
    }

}
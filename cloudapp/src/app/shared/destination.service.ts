import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DestinationService {

    constructor() { }

    send(){
        console.log('Sent!');
    }
}
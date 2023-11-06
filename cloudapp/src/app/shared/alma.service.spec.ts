// // Straight Jasmine testing without Angular's testing support
// import {AlmaService} from "./alma.service";
// import {TestBed} from "@angular/core/testing";
// import {CloudAppRestService, HttpMethod, Request} from "@exlibris/exl-cloudapp-angular-lib";
// import {HttpClient, HttpHandler} from "@angular/common/http";
//
// import {USER_REQUEST, HOLDING, INIT_DATA} from "./test-data";
//
// describe('AlmaService', () => {
//     let almaService: AlmaService;
//     beforeEach(() => {
//         TestBed.configureTestingModule({ providers: [AlmaService, CloudAppRestService, HttpClient, HttpHandler] });
//         almaService = TestBed.inject(AlmaService);
//
//         // let restService = CloudAppRestService;
//         // let create_request: Request = {
//         //     url: '/almaws/v1/bibs',
//         //     method: HttpMethod.POST,
//         //     requestBody: bib
//         // };
//         // restService.call(create_request).subscribe();
//
//
//         // function createBibRecord() {
//         //     let restService = CloudAppRestService;
//         //     let create_request: Request = {
//         //         url: '/almaws/v1/bibs',
//         //         method: HttpMethod.POST,
//         //         requestBody: bib
//         //     };
//         //     return restService.call(create_request);
//         // }
//     });
//
//     it('#getField583x should return value of Field583x from a holding',
//         () => {
//             expect(almaService.getField583xFromHolding(HOLDING)).toBe ('filnavnssyntax');
//         });
//
//     it('#checkIfdeskCodeIsDestination should return true',
//         () => {
//             expect(almaService.checkIfdeskCodeIsDestination(USER_REQUEST, 'Digiproj_1008')).toBeTruthy();
//         });
//
// });
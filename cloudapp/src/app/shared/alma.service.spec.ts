// Straight Jasmine testing without Angular's testing support
import {TestBed} from '@angular/core/testing';
import {CloudAppRestService} from '@exlibris/exl-cloudapp-angular-lib';
import {HttpClient} from '@angular/common/http';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Observable, of, throwError} from 'rxjs';
import {AlmaService, MAX_PAGES, PAGE_SIZE} from './alma.service';
import {TEST_ITEM, TEST_HOLDING, USER_REQUEST} from './test-data';

class FakeRestService {
    requests: any[] = [];
    records: any[] = [];
    totalRecordCount: number;

    constructor(private entityKey: string) {
    }

    withRecords(records: any[], totalRecordCount: number = records.length) {
        this.records = records;
        this.totalRecordCount = totalRecordCount;
        return this;
    }

    call = (request: any): Observable<any> => {
        this.requests.push(request);
        const offset = request.queryParams.offset;
        const limit = request.queryParams.limit;
        // Alma's offset is 0-based: offset 0 returns the first record
        const page = this.records.slice(offset, offset + limit);
        if (this.totalRecordCount === 1 && page.length === 1) {
            // Alma returns an object instead of an array when there is only one record
            return of({[this.entityKey]: page[0], total_record_count: this.totalRecordCount});
        }
        return of({[this.entityKey]: page, total_record_count: this.totalRecordCount});
    };

    offsets = () => this.requests.map(request => request.queryParams.offset);
    limits = () => this.requests.map(request => request.queryParams.limit);
}

class FakeMatDialog {
    open = (): MatDialogRef<any> => ({afterClosed: () => of('chosen')} as unknown as MatDialogRef<any>);
}

describe('AlmaService:', () => {
    let almaService: AlmaService;
    let fakeRestService: FakeRestService;

    let buildItems = (count: number) =>
        Array.from({length: count}, (unused, index) => {
            let item = JSON.parse(JSON.stringify(TEST_ITEM));
            item.item_data.barcode = `130023940${index}`;
            item.item_data.description = `Box ${index}`;
            return item;
        });

    let buildHoldings = (count: number) =>
        Array.from({length: count}, (unused, index) => {
            let holding = JSON.parse(JSON.stringify(TEST_HOLDING));
            holding.holding_id = `2220750333500057${index}`;
            return holding;
        });

    let buildRequests = (count: number) =>
        Array.from({length: count}, (unused, index) => {
            let request = JSON.parse(JSON.stringify(USER_REQUEST.user_request[0]));
            request.request_id = `487355628800057${index}`;
            return request;
        });

    let setupService = (entityKey: string, records: any[], totalRecordCount?: number) => {
        fakeRestService = new FakeRestService(entityKey).withRecords(records, totalRecordCount);
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [
                AlmaService,
                {provide: CloudAppRestService, useValue: fakeRestService},
                {provide: MatDialog, useValue: new FakeMatDialog()},
                {provide: HttpClient, useValue: {post: () => of('')}}
            ]
        });
        almaService = TestBed.inject(AlmaService);
    };

    describe('getItemFromHolding', () => {
        it('should request all pages when a holding has more items than one page', () => {
            setupService('item', buildItems(120));

            almaService.getItemFromHolding('/almaws/v1/bibs/123/holdings/456/items').subscribe(result => {
                expect(result.item.length).toBe(120);
                expect(result.total_record_count).toBe(120);
                expect(fakeRestService.requests.length).toBe(2);
                expect(fakeRestService.offsets()).toEqual([0, 100]);
                expect(fakeRestService.limits()).toEqual([PAGE_SIZE, PAGE_SIZE]);
            });
        });

        it('should include the first and last item and no duplicates across pages', () => {
            setupService('item', buildItems(120));

            almaService.getItemFromHolding('/almaws/v1/bibs/123/holdings/456/items').subscribe(result => {
                let descriptions = result.item.map(item => item.item_data.description);
                expect(descriptions[0]).toBe('Box 0');
                expect(descriptions[119]).toBe('Box 119');
                expect(new Set(descriptions).size).toBe(120);
            });
        });

        it('should stop requesting pages when a page comes back empty', () => {
            setupService('item', buildItems(50), 300);

            almaService.getItemFromHolding('/almaws/v1/bibs/123/holdings/456/items').subscribe(result => {
                expect(result.item.length).toBe(50);
                expect(fakeRestService.offsets()).toEqual([0, 100]);
            });
        });

        it('should request only one page when all items fit on it', () => {
            setupService('item', buildItems(9));

            almaService.getItemFromHolding('/almaws/v1/bibs/123/holdings/456/items').subscribe(result => {
                expect(result.item.length).toBe(9);
                expect(fakeRestService.requests.length).toBe(1);
                expect(fakeRestService.offsets()).toEqual([0]);
            });
        });

        it('should return an array of items when the holding has only one item', () => {
            setupService('item', buildItems(1));

            almaService.getItemFromHolding('/almaws/v1/bibs/123/holdings/456/items').subscribe(result => {
                expect(Array.isArray(result.item)).toBeTrue();
                expect(result.item.length).toBe(1);
            });
        });

        it('should return an empty array when the holding has no items', () => {
            setupService('item', []);

            almaService.getItemFromHolding('/almaws/v1/bibs/123/holdings/456/items').subscribe(result => {
                expect(result.item).toEqual([]);
                expect(result.total_record_count).toBe(0);
            });
        });

        it('should stop requesting pages after the maximum number of pages', () => {
            setupService('item', buildItems(MAX_PAGES * PAGE_SIZE), MAX_PAGES * PAGE_SIZE + 500);

            almaService.getItemFromHolding('/almaws/v1/bibs/123/holdings/456/items').subscribe(result => {
                expect(fakeRestService.requests.length).toBe(MAX_PAGES);
                expect(result.item.length).toBe(MAX_PAGES * PAGE_SIZE);
                expect(result.total_record_count).toBe(MAX_PAGES * PAGE_SIZE + 500);
            });
        });
    });

    describe('getRequestsFromItem', () => {
        it('should request all pages of requests on an item', () => {
            setupService('user_request', buildRequests(150));

            almaService.getRequestsFromItem('/almaws/v1/bibs/123/holdings/456/items/789').subscribe(result => {
                expect(result.user_request.length).toBe(150);
                expect(result.total_record_count).toBe(150);
                expect(fakeRestService.offsets()).toEqual([0, 100]);
            });
        });
    });

    describe('getHoldingsFromMMSID', () => {
        it('should request all pages of holdings on a bib record', () => {
            setupService('holding', buildHoldings(101));

            almaService.getHoldingsFromMMSID('99122282206105763').subscribe(result => {
                expect(result.holding.length).toBe(101);
                expect(fakeRestService.requests.length).toBe(2);
                expect(fakeRestService.requests[0].url).toBe('/bibs/99122282206105763/holdings');
            });
        });
    });

    describe('getItem', () => {
        it('should throw an error when there is no item', () => {
            setupService('item', []);
            expect(() => almaService.getItem({item: []})).toThrowError('There is no item.');
        });

        it('should return the only item without showing a dialog', async () => {
            setupService('item', []);
            let item = buildItems(1)[0];
            let spyShowItemListDialog = spyOn<any>(almaService, 'showItemListDialog');

            let AlmaItem = await almaService.getItem({item}).toPromise();
            expect(AlmaItem).toEqual(item);
            expect(spyShowItemListDialog).not.toHaveBeenCalled();
        });

        it('should show a list of items to choose from when there are multiple items', async () => {
            setupService('item', []);
            let items = buildItems(12);
            let spyShowItemListDialog = spyOn<any>(almaService, 'showItemListDialog').and.resolveTo(items[5]);

            let AlmaItem = await almaService.getItem({item: items}).toPromise();
            expect(spyShowItemListDialog).toHaveBeenCalledWith(items);
            expect(AlmaItem).toEqual(items[5]);
        });
    });

    describe('convertErrorBarcodeNotFoundToOkResponse', () => {
        it('should convert "No items found for barcode" into "Barcode not found"', () => {
            setupService('item', []);
            let result: any;
            almaService.convertErrorBarcodeNotFoundToOkResponse(
                throwError(new Error('No items found for barcode 123.')), '123'
            ).subscribe(value => result = value);
            expect(result).toBe('Barcode not found');
            expect(almaService.inputIsBarcode).toBeFalse();
        });

        it('should rethrow any other error as an error notification', () => {
            setupService('item', []);
            let nextValue: any;
            let caughtError: any;
            almaService.convertErrorBarcodeNotFoundToOkResponse(
                throwError(new Error('Some other error')), '123'
            ).subscribe(value => nextValue = value, error => caughtError = error);
            expect(nextValue).toBeUndefined();
            expect(caughtError.message).toBe('Some other error');
        });
    });
});

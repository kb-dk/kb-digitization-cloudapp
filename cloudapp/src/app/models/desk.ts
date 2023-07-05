export class Desk {
    DeskCode: string;
    paramList: { key: string, value: any }[];

    constructor(deskCode: string, paramList: { key: string, value: any }[]) {
        this.DeskCode = deskCode;
        this.paramList = paramList;
    }
}
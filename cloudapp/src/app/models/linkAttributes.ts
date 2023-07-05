export class Parameters {
    parameter: string[];
}export interface LinkAttribute {
    key: string;
    value: string;
}
export class LinkAttributes {
    name: string;
    almaDeskCode: string;
    linkAttributeList: LinkAttribute[] = [];


    constructor(name: string, almaDeskCode: string, linkAttributeList: LinkAttribute[]) {
        this.name = name;
        this.almaDeskCode = almaDeskCode;
        this.linkAttributeList = linkAttributeList;
    }
}
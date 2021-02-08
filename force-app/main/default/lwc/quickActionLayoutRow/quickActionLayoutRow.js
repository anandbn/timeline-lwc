import { api, LightningElement } from 'lwc';

export default class QuickActionLayoutRow extends LightningElement {

    @api layoutRow;

    @api parentRecordName;
    @api parentRecordId;
    @api parentRecordIcon;
    @api parentRecordColor;
    @api currentUsername;


    get hasEmptySpace(){
        return (this.layoutRow.layoutItems[0].label ==="" || this.layoutRow.layoutItems[1].label ==="" )
    }

    get firstColumnItem(){
        return this.layoutRow.layoutItems[0].layoutComponents[0];
    }

    get secondColumnItem(){
        return this.layoutRow.layoutItems[1].layoutComponents[0];
    }

    get layoutItems(){
        var items = new Array();
        if(!(this.layoutRow.layoutItems[0].label ==="")){
            items.push(this.layoutRow.layoutItems[0].layoutComponents[0].details);
        }
        if(!(this.layoutRow.layoutItems[1].label ==="")){
            items.push(this.layoutRow.layoutItems[1].layoutComponents[0].details);
        }
        return items;
    }

    get onlyItem(){
        if(!(this.firstColumnItem.label==="")){
            return this.firstColumnItem;
        }else{
            return this.secondColumnItem;
        }
    }

    handleSelect(event){
        this.dispatchEvent(new CustomEvent('select', {  bubbles:true, composite:true, detail: event.detail }));
    }
}
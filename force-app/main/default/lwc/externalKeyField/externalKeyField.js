import { LightningElement,api } from 'lwc';

export default class ExternalKeyField extends LightningElement {

    @api externalKey;

    externalKeyChanged(event){
        this.externalKey=event.target.value;
    }

}
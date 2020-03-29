import { LightningElement,api } from 'lwc';

export default class ApexVerifyStepItem extends LightningElement {
    @api verificationItem;

    get itemIconName(){
        return this.verificationItem.status?'action:check':'action:close';
    }

    get itemIconCssClass(){
        return this.verificationItem.status?'completed':'error';

    }

    get message(){
        return this.verificationItem.message;
    }
}
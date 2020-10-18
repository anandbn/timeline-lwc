import { LightningElement,api } from 'lwc';

export default class ReadonlyTextWithIcon extends LightningElement {

    @api label;
    @api displayText;
    @api iconImgUrl;
    @api iconBackgroundColor;
    @api iconName;
    @api iconSize="small";

    get iconStyle() {
        return this.iconBackgroundColor != null ? `background-color:#${this.iconBackgroundColor};` : '';
    }

    get iconImgCssClass(){
        return 'slds-avatar slds-avatar--'+this.iconSize;
    }

    get hasIcon(){
        return this.iconName!=null;
    }
}
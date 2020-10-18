import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'
import Toggle_details from '@salesforce/label/c.Toggle_details';

export default class TimelineItem extends NavigationMixin(LightningElement) {

    @api title;
    @api object;
    @api dateValue;
    @api expandedFieldsToDisplay;
    @api recordId;
    @api expanded;
    @api themeInfo;
    label = {
        Toggle_details
    }

    get hasIconName() {
        return this.themeInfo.iconName != null;
    }

    get objectThemeColor() {
        return `background-color: #${this.themeInfo.color};`;
    }

    get itemStyle() {
        return this.expanded ? "slds-timeline__item_expandable slds-is-open" : "slds-timeline__item_expandable";
    }

    get totalFieldsToDisplay() {
        return this.expandedFieldsToDisplay.length;
    }

    get expandCollapseIcon(){
        return this.expanded?"utility:switch":"utility:chevronright";
    }
    get isCase() {
        return this.object === "Case";
    }
    toggleDetailSection() {
        this.expanded = !this.expanded;
    }

}
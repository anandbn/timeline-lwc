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
    @api displayRelativeDates;
    @api isOverdue=false;
    //Default navigation behaviour is to go to the record detail
    @api navigationBehaviour="Record Detail";

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
    
    get shouldNavigateToRecord(){
        return this.navigationBehaviour!='None';
    }
    toggleDetailSection() {
        this.expanded = !this.expanded;
    }



}
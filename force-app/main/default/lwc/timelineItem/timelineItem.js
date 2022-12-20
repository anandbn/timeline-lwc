import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'
import Toggle_details from '@salesforce/label/c.Toggle_details';
import {
    subscribe,
    APPLICATION_SCOPE,
    MessageContext
} from 'lightning/messageService';
import timelineItemState from '@salesforce/messageChannel/TimelineItemState__c';

export default class TimelineItem extends NavigationMixin(LightningElement) {

    @api title;
    @api subTitle;
    @api subTitleLabel;
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

    @wire(MessageContext)
    messageContext;
    subscription;

    connectedCallback(){
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                timelineItemState,
                (message) => this.handleMessage(message),
                { scope: APPLICATION_SCOPE }
            );
        }
    }

    label = {
        Toggle_details
    }

    get hasSubTitle(){
        return this.subTitle!=null && this.subTitle.length > 0;
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

    handleMessage(message){
        //console.log('Expand Collapse message received:'+message.expanded);
        this.expanded=message.expanded;
    }

}
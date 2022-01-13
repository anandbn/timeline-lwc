import { LightningElement,api,wire} from 'lwc';
import Toggle_Details from '@salesforce/label/c.Toggle_details';
import { loadScript } from 'lightning/platformResourceLoader';
import MOMENT_JS from '@salesforce/resourceUrl/moment_js';
import LANG from '@salesforce/i18n/lang';
import LOCALE from '@salesforce/i18n/locale';
import {
    subscribe,
    APPLICATION_SCOPE,
    MessageContext
} from 'lightning/messageService';
import timelineItemState from '@salesforce/messageChannel/TimelineItemState__c';

export default class TimelineNote extends LightningElement {

    @api title;
    @api object;
    @api dateValue;
    @api recordId;
    @api contentDocId;
    @api navigationBehaviour="None";
    @api displayRelativeDates;
    @api expanded=false;
    @api body;

    @api createdByName;

    @api createdById;

 
    label = {
        Toggle_Details
    }

    @wire(MessageContext)
    messageContext;
    subscription;

    connectedCallback() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                timelineItemState,
                (message) => this.handleMessage(message),
                { scope: APPLICATION_SCOPE }
            );
        }
        Promise.all([
            loadScript(this, MOMENT_JS),
        ]).then(() => {
            moment.lang(LANG);
            moment.locale(LOCALE);

        })
        .catch(error => {
            console.log('TimelineNote: MomentJS not loaded');
        });
    }

    get itemStyle() {
        return this.expanded ? "slds-timeline__item_expandable slds-is-open" : "slds-timeline__item_expandable";
    }

    get shouldNavigateToRecord(){
        return this.navigationBehaviour!='None';
    }

    toggleDetailSection() {
        this.expanded = !this.expanded;
    }

    handleMessage(message){
        this.expanded=message.expanded;
    }    


}
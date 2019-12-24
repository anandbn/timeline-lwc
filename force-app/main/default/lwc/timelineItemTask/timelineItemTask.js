import { LightningElement,api,track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'

export default class TimelineItemTask extends NavigationMixin(LightningElement) {

    @api title;
    @api dateValue;
    @api recordId;
    @api description;
    @track expanded;
    @api assignedToName;
    @api ownerId;
    @api whoId;
    @api whoToName;
    @api taskSubtype;

    get itemStyle() {
        return this.expanded ? "slds-timeline__item_expandable slds-is-open" : "slds-timeline__item_expandable";
    }

    get iconName(){
        return this.taskSubtype === "Call"?"standard:log_a_call":"standard:task";
    }

    get isCall(){
        return this.taskSubtype === "Call";
    }



    toggleDetailSection() {
        this.expanded = !this.expanded;
    }

    navigateToOwner() {
        // View a custom object record.
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.ownerId,
                objectApiName: "User",
                actionName: 'view'
            }
        });
    }

    navigateToWho() {
        // View a custom object record.
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.whoId,
                actionName: 'view'
            }
        });
    }

    navigateToTask() {
        // View a custom object record.
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: "Task",
                actionName: 'view'
            }
        });
    }

}
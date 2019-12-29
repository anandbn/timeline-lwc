import { LightningElement,api,track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'
import CURRENT_USER_ID from '@salesforce/user/Id';

import getEmailDetails from '@salesforce/apex/RecordTimelineDataProvider.getEmailDetails';

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

    @wire(getEmailDetails,{taskId:'$recordId'})
    emailMessage ({ error, data }) {
        if (data) {
            this.assignedToName=data.FromName;
            this.description=data.TextBody;
            this.recordId=data.Id;
            let emailRelations = data.EmailMessageRelations;
            if(emailRelations && emailRelations.length>=1){
                this.whoToName=emailRelations[0].Relation.Name;
                this.whoId=emailRelations[0].RelationId;
                if(emailRelations.length === 2){
                    this.assignedToName=emailRelations[1].RelationId===CURRENT_USER_ID?"You":emailRelations[1].Relation.Name;
                    this.ownerId=emailRelations[1].RelationId;
                }

            }
           
        } 
    };

    get itemStyle() {
        return this.expanded ? "slds-timeline__item_expandable slds-is-open" : "slds-timeline__item_expandable";
    }

    get iconName(){
        if(this.taskSubtype === "Call"){
            return "standard:log_a_call"
        }else if(this.taskSubtype === "Email"){
            return "standard:email";
        }else{
            return "standard:task";
        }
    }

    get isCall(){
        return this.taskSubtype === "Call";
    }

    get isTask(){
        return (this.taskSubtype != "Email" && this.taskSubtype != "Call");
    }

    get isEmail(){
        return this.taskSubtype === "Email";
    }

    get hasWhoTo(){
        return this.whoId!=null;
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
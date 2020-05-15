/* 
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement,api,track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'
import CURRENT_USER_ID from '@salesforce/user/Id';

import getEmailDetails from '@salesforce/apex/RecordTimelineDataProvider.getEmailDetails';
import getTimelineItemChildData from '@salesforce/apex/RecordTimelineDataProvider.getTimelineItemChildData';

import Toggle_Details from '@salesforce/label/c.Toggle_details';
import had_a_task from '@salesforce/label/c.had_a_task';
import have_a_task from '@salesforce/label/c.have_a_task';
import created_a_task_with from '@salesforce/label/c.created_a_task_with';
import logged_a_task from '@salesforce/label/c.logged_a_task';
import logged_a_call_with from '@salesforce/label/c.logged_a_call_with';
import sent_an_email from '@salesforce/label/c.sent_an_email';
import sent_an_email_to from '@salesforce/label/c.sent_an_email_to';
import Name from '@salesforce/label/c.Name';
import Description from '@salesforce/label/c.Description';
import You from '@salesforce/label/c.You';
import have_a_upoming_task_with from '@salesforce/label/c.have_a_upoming_task_with';

export default class TimelineItemTask extends NavigationMixin(LightningElement) {

    @api title;
    @api dateValue;
    @api dateValueFromDb;
    @api recordId;
    @api description;
    @api expanded;
    @api assignedToName;
    @api ownerId;
    @api whoId;
    @api whoToName;
    @api taskSubtype;
    @api expandedFieldsToDisplay;
    @track dataLoaded = false;

    @api fieldData;

    label = {
        Toggle_Details,
        had_a_task,
        have_a_task,
        have_a_upoming_task_with,
        created_a_task_with,
        logged_a_task,
        logged_a_call_with,
        sent_an_email,
        sent_an_email_to,
        Name,
        Description
    }
    

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
                    this.assignedToName=emailRelations[1].RelationId===CURRENT_USER_ID?You:emailRelations[1].Relation.Name;
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

    get isFutureTask(){
        var dtVal = Date.parse(this.dateValueFromDb);
        return dtVal > new Date().getTime();
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

    toggleDetailSection() {
        this.expanded = !this.expanded;
        if (this.expanded && !this.dataLoaded) {
            getTimelineItemChildData({
                objectApiName: 'Task',
                fieldsToExtract: this.expandedFieldsToDisplay,
                recordId: this.recordId
            })
            .then(data => {
                this.dataLoaded=true;
                this.fieldData = this.populateFieldData(data.data,data.fieldMetadata);
            })
            .catch(error => {
                console.log(JSON.stringify(error));
            });
        }
        //Data loaded via a Apex data provider so just display the data from the `externalData` attribute
        if(this.isExternalServiceData){
            this.dataLoaded=true;
            this.fieldData = this.populateFieldData(this.externalData,this.externalDataFieldTypes);
        }
    }

    populateFieldData(data,fieldMetadata){
        let fieldData = new Array();
        for (let i = 0; i < fieldMetadata.length; i++) {
            let fld = fieldMetadata[i];
            let fldData = {};
            fldData.apiName = fld.apiName;
            fldData.fieldLabel = fld.fieldLabel;
            fldData.dataType = fld.dataType;
            fldData.fieldValue = data[fld.apiName];
            if(fld.isNamePointing){
                if(data[fld.relationshipName]){
                    fldData.fieldValue=data[fld.relationshipName]['Name'];
                    fldData.isHyperLink=true;
                    fldData.hyperLinkToId=data[fld.relationshipName]['Id'];
                }
            }else if(fld.dataType.toUpperCase() === "REFERENCE"){
                if(data[fld.relationshipName]){
                    fldData.fieldValue=data[fld.relationshipName][fld.referenceToApiName];
                    fldData.isHyperLink=true;
                    fldData.hyperLinkToId=data[fld.relationshipName]['Id'];
                }
            }
            fldData.isBoolean = fld.dataType.toUpperCase() === "Boolean".toUpperCase();
            fldData.isBooleanTrue = fldData.fieldValue;
            if(fldData.dataType.toUpperCase() === "Date".toUpperCase() || fldData.dataType.toUpperCase() === "DateTime".toUpperCase()){
                fldData.fieldValue =  moment(fldData.fieldValue).format("dddd, MMMM Do YYYY, h:mm:ss a");
            }
            
            fieldData.push(fldData);
        } 
        return fieldData;       
    }
}
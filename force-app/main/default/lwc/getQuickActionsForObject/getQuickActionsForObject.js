import { LightningElement,wire,track,api } from 'lwc';
// Import message service features required for publishing and the message channel
import { publish, MessageContext, subscribe,unsubscribe } from 'lightning/messageService';
import REST_API_REQUEST from '@salesforce/messageChannel/RestApiRequest__c';
import REST_API_RESPONSE from '@salesforce/messageChannel/RestApiResponse__c';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import getObjectName from '@salesforce/apex/TaskUtils.getObjectName';
import getCurrentUsername from '@salesforce/apex/TaskUtils.getCurrentUsername';
import saveTask from '@salesforce/apex/TaskUtils.saveTaskFromObject';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class GetQuickActionsForObject extends LightningElement {
    @wire(MessageContext)
    messageContext;

    subscription = null;
    tabsAndFields={};

    @track 
    isLoaded=false;

    @track
    composerActions;

    @track
    activeTabId;

    @track 
    actionFieldsToDisplay;

    @track 
    hideCreateButton=false;

    @api recordId;

    @api actionFetchDelay = 2000;

    @api objectApiName;

    @track recordIconUrl;
    @track recordObjectColor;
    @track recordName;
    @track recordNameField;
    @track fieldsLoaded=false;

    currentTask = {};

    @wire(getCurrentUsername)
    usernameResponse({error,data}){
        if(data){
            this.currentUsername=data;
        }
    }
    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    objectInfoResponse({error,data}){
        if(data){
            this.recordIconUrl=data.themeInfo.iconUrl;
            this.recordObjectColor=data.themeInfo.color;
            this.recordNameField = data.nameFields[0];
            
            getObjectName({objectName:this.objectApiName,recordId:this.recordId,nameField:this.recordNameField})
            .then(data =>{
                this.recordName=data;
            }).catch(error =>{
                console.log(JSON.stringify(error));
            });
        }
    }

    connectedCallback(){
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                REST_API_RESPONSE, 
                (message) => {
                    this.handleRestApiResponse(message);
                });
        }
        setTimeout(() =>{
            const actionsUrl = `/services/data/v41.0/ui-api/actions/record/${this.recordId}`;
            const restApiRequestPayload = { 
                requestMethod:'GET',
                requestUrl:actionsUrl,
                requestType:'GET_ACTIONS'
            };
            //console.log(`Sending API Request to ${actionsUrl}`);
            publish(this.messageContext, REST_API_REQUEST, restApiRequestPayload);
        },this.actionFetchDelay);
    }

    handleRestApiResponse(message){
        if(message.requestType === "GET_ACTIONS"){
            var actions =message.actions[this.recordId].actions;
            this.composerActions = actions.filter(action => action.section==="ActivityComposer");
            var newActionArray = new Array();
            for(var i=0;i<this.composerActions.length;i++){
                var action = JSON.parse(JSON.stringify(this.composerActions[i]));;
                action.isFirstTab = (i==0);
                if(i==0){
                    this.activeTabId=action.id;
                }
                action.tabHdrCssClass = (i==0)?"slds-tabs_scoped__item slds-truncate slds-is-active":"slds-tabs_scoped__item slds-truncate ";
                action.tabDtlCssClass = (i==0)?"slds-tabs_scoped__content slds-show":"slds-tabs_scoped__content slds-hide";
                newActionArray.push(action);
            }
            this.composerActions=newActionArray;
            this.isLoaded=true;
        } else if(message.requestType === "DESCRIBE_ACTION"){
            //console.log(`Describe action response : ${JSON.stringify(message)}`);
            this.actionFieldsToDisplay = message.layout.layoutRows;
            this.tabsAndFields[this.activeTabId] = message.layout.layoutRows;
            this.fieldsLoaded=true;
        }
    }

    get hasFieldsToDisplay(){
        return this.actionFieldsToDisplay && this.actionFieldsToDisplay.length>0;
    }

    showQuickAction(event){
        const actionsUrl = event.target.dataset.describe;
        this.activeTabId = event.target.dataset.tabid;
        this.hideCreateButton=true;
        const restApiRequestPayload = { 
            requestMethod:'GET',
            requestUrl:actionsUrl,
            requestType:'DESCRIBE_ACTION'
        };
        console.log(`Sending API Request to ${actionsUrl}`);
        publish(this.messageContext, REST_API_REQUEST, restApiRequestPayload);
    }

    handleTabClick(event){
        const tabId = event.target.dataset.tabid;
        this.activeTabId=tabId;
        this.composerActions.forEach(function(action, index, actionArray) {
            action.tabHdrCssClass = (action.id===tabId)?"slds-tabs_scoped__item slds-truncate slds-is-active":"slds-tabs_scoped__item slds-truncate ";
            action.tabDtlCssClass = (action.id===tabId)?"slds-tabs_scoped__content slds-show":"slds-tabs_scoped__content slds-hide";
            action.fieldsLoaded=false;
        });
        if(this.tabsAndFields[this.activeTabId]){
            console.log('Already have action field definition..skipping rest request');
            this.actionFieldsToDisplay =  this.tabsAndFields[this.activeTabId];

        } else {
            this.fieldsLoaded=false;
            const actionsUrl = event.target.dataset.describe;
            const restApiRequestPayload = {
                requestMethod: 'GET',
                requestUrl: actionsUrl,
                requestType: 'DESCRIBE_ACTION'
            };
            console.log(`Sending API Request to ${actionsUrl}`);
            publish(this.messageContext, REST_API_REQUEST, restApiRequestPayload);
        }

    }
    handleSelect(event){
        console.log(`Select event fired : \n ${JSON.stringify(event.detail,4,'\n')}`);
        this.currentTask[event.detail.fieldName]=event.detail.value;
        
    }

    handleSave(event){
        if(!this.currentTask["WhoId"].startsWith("00Q")){
            //Set WhatId only when the whoId is not a Lead
            this.currentTask["WhatId"] = this.recordId;
        }
        saveTask({"tsk":this.currentTask}).then(data => {
            this.currentTask = {};
            const event = new ShowToastEvent({
                "variant":"success",
                "message": data.Subject?"Task {0} was created":"{0} was created",
                "messageData": [
                    {
                        url: '/'+data.Id,
                        label: (data.Subject?data.Subject:"Task"),
                    }
                ]
            });
            this.dispatchEvent(event);
        }).catch(error => {
            console.log(error);
        });
    }
    /*disconnectedCallback(){
        unsubscribe(this.subscription);
        this.subscription=null;
    }*/
}
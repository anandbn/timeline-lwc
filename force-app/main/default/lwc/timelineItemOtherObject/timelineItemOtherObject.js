import { LightningElement, api, track, wire } from 'lwc';
import getTimelineItemChildData from '@salesforce/apex/RecordTimelineDataProvider.getTimelineItemChildData';
import { loadScript } from 'lightning/platformResourceLoader';
import MOMENT_JS from '@salesforce/resourceUrl/moment_js';
import Toggle_Details from '@salesforce/label/c.Toggle_details';
import LANG from '@salesforce/i18n/lang';
import LOCALE from '@salesforce/i18n/locale';
import {
    subscribe,
    APPLICATION_SCOPE,
    MessageContext
} from 'lightning/messageService';
import timelineItemState from '@salesforce/messageChannel/TimelineItemState__c';

export default class TimelineItemOtherObject extends LightningElement {

    @api title;
    @api object;
    @api dateValue;
    @api expandedFieldsToDisplay;
    @api fieldData;
    @api recordId;
    isDataFromExternalService;
    @api externalData;
    @api externalDataFieldTypes;
    @api baseUrlForRecordDetail;
    @api navigationBehaviour="Record Detail";
    @api displayRelativeDates;
    @api isOverdue=false;
    @api expanded;
    @api themeInfo;
    @api isSalesforceObject=false;
    @track dataLoaded = false;
 
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
            console.log('TimelineItemOtherObject: MomentJS not loaded');
        });
    }

    @api 
    get isExternalServiceData(){
        if(this.isSalesforceObject){
            return false;
        }else{
            return this.isDataFromExternalService;
        }
    }

    set isExternalServiceData(value){
        this.isDataFromExternalService=value;
    }

    get hasIconName() {
        return this.themeInfo.iconName != null;
    }

    get objectThemeColor() {
        return (this.themeInfo.color && this.themeInfo.color.length>0)?`background-color: #${this.themeInfo.color}`:'';
    }

    get itemStyle() {
        return this.expanded ? "slds-timeline__item_expandable slds-is-open" : "slds-timeline__item_expandable";
    }

    get totalFieldsToDisplay() {
        return this.expandedFieldsToDisplay.length;
    }

    get shouldNavigateToRecord(){
        return this.navigationBehaviour!='None';
    }

    handleMessage(message) {
        this.expanded = message.expanded;
        this.handleToggleDetail();
    }

    toggleDetailSection() {
        this.expanded = !this.expanded;
        this.handleToggleDetail();
    }

    handleToggleDetail(){
        if (this.expanded && !this.dataLoaded && !this.isExternalServiceData) {
            getTimelineItemChildData({
                objectApiName: this.object,
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
        if(this.isExternalServiceData && !this.isSalesforceObject){
            this.dataLoaded=true;
            this.fieldData = this.populateFieldData(this.externalData,this.externalDataFieldTypes);
        }
    }

    populateFieldData(data,fieldMetadata){
        moment.locale(LOCALE);
        moment.lang(LANG);
        let fieldData = new Array();
        for (let i = 0; i < fieldMetadata.length; i++) {
            let fld = fieldMetadata[i];
            let fldData = {};
            fldData.apiName = fld.apiName;
            fldData.fieldLabel = fld.fieldLabel;
            fldData.dataType = fld.extraTypeInfo?fld.extraTypeInfo.toUpperCase():fld.dataType;
            fldData.fieldValue = data[fld.apiName];
            if(fld.isNamePointing && data[fld.relationshipName]){
                fldData.fieldValue=data[fld.relationshipName]['Name'];
                fldData.isHyperLink=true;
                fldData.hyperLinkToId=data[fld.relationshipName]['Id'];
            }else if(fld.dataType.toUpperCase() === "REFERENCE" && data[fld.relationshipName]){
                fldData.fieldValue=data[fld.relationshipName][fld.referenceToApiName];
                fldData.isHyperLink=true;
                fldData.hyperLinkToId=data[fld.relationshipName]['Id'];
            }
            fldData.isBoolean = fld.dataType.toUpperCase() === "Boolean".toUpperCase();
            if(fldData.isBoolean){
                fldData.isBooleanTrue = fldData.fieldValue;
            }
            if(fldData.dataType.toUpperCase() === "Date".toUpperCase() || fldData.dataType.toUpperCase() === "DateTime".toUpperCase()){
                fldData.fieldValue =  moment(fldData.fieldValue).format();
            }
 
            if(fldData.dataType.toUpperCase() === "RICHTEXTAREA".toUpperCase() || fldData.dataType.toUpperCase() === "TEXTAREA".toUpperCase()){
                fldData.isRichText=true;
            }
             
            fieldData.push(fldData);
        } 
        return fieldData;       
    }

}
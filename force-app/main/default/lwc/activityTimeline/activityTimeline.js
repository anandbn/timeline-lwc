import { LightningElement, track, api } from 'lwc';
import getTimelineItemData from '@salesforce/apex/RecordTimelineDataProvider.getTimelineItemData';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript } from 'lightning/platformResourceLoader';
import MOMENT_JS from '@salesforce/resourceUrl/moment_js';
import CURRENT_USER_ID from '@salesforce/user/Id';

import No_data_found from '@salesforce/label/c.No_data_found';
import Error_loading_data from '@salesforce/label/c.Error_loading_data';
import Invalid_parameters from '@salesforce/label/c.Invalid_parameters'
import 	Either_recordId_or_configId_are_empty  from '@salesforce/label/c.Either_recordId_or_configId_are_empty'

export default class ActivityTimeline extends LightningElement {
    @api recordId;
    @api configId;
    @api headerTitle;
    @api headerIcon;
    @api showHeader = false;
    @api additionalMargin;
    @api availableObjects;
    @api initialObjectSelection;
    @api objectFilters;
    @track childRecords;
    @track hasTimelineData;
    @track error;
    @track errorMsg;
    @track momentJSLoaded = false;
    @track showFilter = false;
    @track dateFilterSelection = "all_time";
    @track isLoading = true;

    label = {
        No_data_found,
        Error_loading_data,
        Invalid_parameters,
        Either_recordId_or_configId_are_empty
    }
    connectedCallback() {
        Promise.all([
            loadScript(this, MOMENT_JS),
        ]).then(() => {
            this.momentJSLoaded = true;
            console.log(new Date() + ':MomentJS loaded');
            getTimelineItemData({ confIdOrName: this.configId, recordId: this.recordId, dateFilter: this.dateFilterSelection })
                .then(data => {
                    this.processTimelineData(data);
                })
                .catch(error => {
                    this.errorLoadingData(error);
                });

        })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading MomentJS',
                        message: error.message,
                        variant: 'error',
                    }),
                );
            });
    }

    refreshData() {
        this.isLoading=true;
        getTimelineItemData({ confIdOrName: this.configId, recordId: this.recordId, dateFilter: this.dateFilterSelection })
            .then(data => {
                this.processTimelineData(data);
            })
            .catch(error => {
                this.errorLoadingData(error);
            });

    }

    processTimelineData(data) {
        this.isLoading=false;
        this.hasTimelineData=false;
        if(data){
            this.childRecords = new Array();
            let unsortedRecords = new Array();
            let availableObjects = new Array();
            //have to deep clone in order to Task and other standard objects
            let configs = data.configuration.timeline__Timeline_Child_Objects__r;
            this.availableObjects=new Array();
            this.initialObjectSelection=new Array();
            for (let i = 0; i < configs.length; i++) {
                this.availableObjects.push({"label":configs[i].timeline__Relationship_Name__c,"value":configs[i].timeline__Object__c});
                this.initialObjectSelection.push(configs[i].timeline__Object__c);
                //If the current object was filtered out, don't do any processing
                if(this.objectFilters && !this.objectFilters.includes(configs[i].timeline__Object__c)){
                    continue;
                }
                let relRecords;
                if(configs[i].timeline__Data_Provider_Type__c === "Related Record"){
                    relRecords = data.data[configs[i].timeline__Relationship_Name__c] ;
                } 
                let apexConfigAndData;
                if(configs[i].timeline__Data_Provider_Type__c === "Apex class"){
                    apexConfigAndData = data.apexConfigData[configs[i].timeline__Relationship_Name__c] ;
                    relRecords = apexConfigAndData.apexData;
                } 
                if (relRecords) {
                    this.hasTimelineData=true;
                    for (let j = 0; j < relRecords.length; j++) {
                        let childRec = {};
                        childRec.isTask = false;
                        childRec.isExternalServiceData = false;
                        childRec.isUiApiNotSupported = configs[i].timeline__LWC_Ui_Api_Not_Supported__c;
                        childRec.object = configs[i].timeline__Object__c;
                        childRec.title = relRecords[j][configs[i].timeline__Title_Field__c];
                        childRec.dateValueDB = configs[i].timeline__Date_Field__c ? relRecords[j][configs[i].timeline__Date_Field__c] : relRecords[j].CreatedDate;
                        childRec.dateValue = moment(childRec.dateValueDB).fromNow();
                        let fldsToDisplay = configs[i].timeline__Fields_to_Display__c.split(',');
                        if (!childRec.isUiApiNotSupported) {
                            childRec.expandedFieldsToDisplay = new Array();
                            for (let k = 0; k < fldsToDisplay.length; k++) {
                                childRec.expandedFieldsToDisplay.push({ "id": fldsToDisplay[k], "apiName": fldsToDisplay[k] });
                            }
                        } else {
                            childRec.expandedFieldsToDisplay = configs[i].timeline__Fields_to_Display__c;
                        }
                        if(configs[i].timeline__Data_Provider_Type__c === "Apex class"){
                            childRec.isExternalServiceData = true;
                            childRec.externalData = relRecords[j];
                            childRec.externalDataFieldTypes = apexConfigAndData.fieldsWithTypes;
                            childRec.recordId = relRecords[j][apexConfigAndData.recordIdentifierField];
                            childRec.baseUrlForRecordDetail = apexConfigAndData.baseUrlForRecordDetail;
                        }else{
                            childRec.isExternalServiceData = false;
                            childRec.recordId = relRecords[j].Id;
                        }
                        childRec.themeInfo = {
                            iconName: configs[i].timeline__Icon_Name__c,
                            iconImgUrl: configs[i].timeline__Icon_Image_Url__c,
                            color: configs[i].timeline__Object_Color__c
                        };
                        if (configs[i].timeline__Object__c === "Task") {
                            //Special fields for Task
                            childRec.isTask = true;
                            childRec.isCustom = false;
                            childRec.description = relRecords[j].Description;
                            childRec.WhoId = relRecords[j].WhoId;
                            childRec.OwnerId = relRecords[j].OwnerId;
                            childRec.assignedToName = (childRec.OwnerId === CURRENT_USER_ID) ? "You" : relRecords[j].Owner.Name;
                            if (relRecords[j].Who) {
                                childRec.whoToName = relRecords[j].Who.Name;
                            }
                            childRec.TaskSubtype = relRecords[j].TaskSubtype;
    
                        }
                        unsortedRecords.push(childRec);
                    }
                }
    
            }
            unsortedRecords.sort(function (a, b) {
                return new Date(b.dateValueDB) - new Date(a.dateValueDB);
            });
            this.childRecords = unsortedRecords;
        }else{
            this.hasTimelineData=false;
        }


    }

    errorLoadingData(error) {

        this.error = true;
        if (error.body && error.body.exceptionType && error.body.message) {
            this.errorMsg = `[ ${error.body.exceptionType} ] : ${error.body.message}`;
        } else {
            this.errorMsg = JSON.stringify(error);
        }
    }
    get isParametersValid() {
        return (this.recordId != null && this.configId != null)
    }

    get timelineStyles() {
        if (this.additionalMargin) {
            return 'slds-card ' + this.additionalMargin;
        } else {
            return 'slds-card';
        }
    }

    get filterStyles() {
        let filterStyle = '';
        if (this.showFilter) {
            filterStyle += 'display:block;';
        } else {
            filterStyle += 'display:none;';
        }
        filterStyle += 'position:absolute;top:2.25rem;left:-285px;width:300px;'
        return filterStyle;
    }
    showHideFilters() {
        this.showFilter = !this.showFilter;
    }

    get dateFilterOptions() {
        return [
            { label: 'All Time', value: 'all_time' },
            { label: 'Last 7 days', value: 'last_7_days' },
            { label: 'Next 7 days', value: 'next_7_days' },
            { label: 'Last 30 days', value: 'last_30_days' },
        ];
    }

    handleFilterChange(event) {
        if(event.detail.dateFilter){
            this.dateFilterSelection = event.detail.dateFilter;
            this.objectFilters=event.detail.objectFilter;
            this.refreshData();
        }
    }

    get filteredObjects(){
        return this.objectFilters !=null?this.objectFilters:this.initialObjectSelection;
    }
}
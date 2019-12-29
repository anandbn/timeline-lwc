import { LightningElement, track, api } from 'lwc';
import getTimelineItemData from '@salesforce/apex/RecordTimelineDataProvider.getTimelineItemData';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript } from 'lightning/platformResourceLoader';
import MOMENT_JS from '@salesforce/resourceUrl/moment_js';
import CURRENT_USER_ID from '@salesforce/user/Id';
import { refreshApex } from '@salesforce/apex';

export default class ActivityTimeline extends LightningElement {
    @api recordId;
    @api configId;
    @track childRecords;
    @track error;
    @track errorMsg;
    @track momentJSLoaded = false;

    connectedCallback() {
        Promise.all([
            loadScript(this, MOMENT_JS),
        ]).then(() => {
            this.momentJSLoaded = true;
            console.log(new Date() + ':MomentJS loaded');
            getTimelineItemData({ confId: this.configId, recordId: this.recordId })
                .then(data => {
                    this.childRecords = new Array();
                    let unsortedRecords = new Array();
                    //have to deep clone in order to Task and other standard objects
                    let configs = data.configuration.timeline__Timeline_Child_Objects__r;
                    for (let i = 0; i < configs.length; i++) {
                        let relRecords = data.data[configs[i].timeline__Relationship_Name__c];
                        if (relRecords) {
                            for (let j = 0; j < relRecords.length; j++) {
                                let childRec = {};
                                childRec.isTask = false;
                                childRec.isCustom = true;
                                childRec.object = configs[i].timeline__Object__c;
                                childRec.title = relRecords[j][configs[i].timeline__Title_Field__c];
                                childRec.dateValueDB = configs[i].timeline__Date_Field__c ? relRecords[j][configs[i].timeline__Date_Field__c] : relRecords[j].CreatedDate;
                                childRec.dateValue = moment(childRec.dateValueDB).fromNow();
                                let fldsToDisplay = configs[i].timeline__Fields_to_Display__c.split(',');
                                childRec.expandedFieldsToDisplay = new Array();
                                for (let k = 0; k < fldsToDisplay.length; k++) {
                                    childRec.expandedFieldsToDisplay.push({ "id": fldsToDisplay[k], "apiName": fldsToDisplay[k] });
                                }
                                childRec.recordId = relRecords[j].Id;
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
                })
                .catch(error => {
                    this.error = true;
                    this.errorMsg = `[ ${error.body.exceptionType} ] : ${error.body.message}`;
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
        getTimelineItemData({ confId: this.configId, recordId: this.recordId })
        .then(data => {
            this.childRecords = new Array();
            let unsortedRecords = new Array();
            //have to deep clone in order to Task and other standard objects
            let configs = data.configuration.timeline__Timeline_Child_Objects__r;
            for (let i = 0; i < configs.length; i++) {
                let relRecords = data.data[configs[i].timeline__Relationship_Name__c];
                if (relRecords) {
                    for (let j = 0; j < relRecords.length; j++) {
                        let childRec = {};
                        childRec.isTask = false;
                        childRec.isCustom = true;
                        childRec.object = configs[i].timeline__Object__c;
                        childRec.title = relRecords[j][configs[i].timeline__Title_Field__c];
                        childRec.dateValueDB = configs[i].timeline__Date_Field__c ? relRecords[j][configs[i].timeline__Date_Field__c] : relRecords[j].CreatedDate;
                        childRec.dateValue = moment(childRec.dateValueDB).fromNow();
                        let fldsToDisplay = configs[i].timeline__Fields_to_Display__c.split(',');
                        childRec.expandedFieldsToDisplay = new Array();
                        for (let k = 0; k < fldsToDisplay.length; k++) {
                            childRec.expandedFieldsToDisplay.push({ "id": fldsToDisplay[k], "apiName": fldsToDisplay[k] });
                        }
                        childRec.recordId = relRecords[j].Id;
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
        })
        .catch(error => {
            this.error = true;
            this.errorMsg = `[ ${error.body.exceptionType} ] : ${error.body.message}`;
        });
    }
    get isParametersValid() {
        return (this.recordId != null && this.configId != null)
    }
}
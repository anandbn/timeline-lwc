/* 
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement, track, api } from 'lwc';
import getTimelineItemData from '@salesforce/apex/RecordTimelineDataProvider.getTimelineItemData';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript } from 'lightning/platformResourceLoader';
import MOMENT_JS from '@salesforce/resourceUrl/moment_js';
import CURRENT_USER_ID from '@salesforce/user/Id';

import No_data_found from '@salesforce/label/c.No_data_found';
import Error_loading_data from '@salesforce/label/c.Error_loading_data';
import Invalid_parameters from '@salesforce/label/c.Invalid_parameters'
import Either_recordId_or_configId_are_empty from '@salesforce/label/c.Either_recordId_or_configId_are_empty'
import You from '@salesforce/label/c.You';
import Upcoming from '@salesforce/label/c.Upcoming';
import LANG from '@salesforce/i18n/lang';
import LOCALE from '@salesforce/i18n/locale';

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
    @track timelineItemsByMonth;
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
            //set the locale with values from translated labels
            //console.log(new Date() + ':MomentJS loaded');
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
        this.isLoading = true;
        getTimelineItemData({ confIdOrName: this.configId, recordId: this.recordId, dateFilter: this.dateFilterSelection })
            .then(data => {
                this.processTimelineData(data);
            })
            .catch(error => {
                this.errorLoadingData(error);
            });

    }

    processTimelineData(data) {
        moment.locale(LOCALE);
        moment.lang(LANG);
        try {

            this.isLoading = false;
            this.hasTimelineData = false;
            if (data) {
                this.childRecords = new Array();
                let unsortedRecords = new Array();
                //have to deep clone in order to Task and other standard objects
                let configs = data.configuration.timeline__Timeline_Child_Objects__r;
                this.availableObjects = new Array();
                this.initialObjectSelection = new Array();
                for (let i = 0; i < configs.length; i++) {
                    this.availableObjects.push({ "label": configs[i].timeline__Relationship_Name__c, "value": configs[i].timeline__Object__c });
                    this.initialObjectSelection.push(configs[i].timeline__Object__c);
                    //If the current object was filtered out, don't do any processing
                    if (this.objectFilters && !this.objectFilters.includes(configs[i].timeline__Object__c)) {
                        continue;
                    }
                    let relRecords;
                    if (configs[i].timeline__Data_Provider_Type__c === "Related Record") {
                        relRecords = data.data[configs[i].timeline__Relationship_Name__c];
                    }
                    let apexConfigAndData;
                    if (configs[i].timeline__Data_Provider_Type__c === "Apex class") {
                        apexConfigAndData = data.apexConfigData[configs[i].timeline__Relationship_Name__c];
                        relRecords = apexConfigAndData.apexData;
                    }
                    if (relRecords) {
                        this.hasTimelineData = true;
                        for (let j = 0; j < relRecords.length; j++) {
                            var item = this.createTimelineItem(configs[i], apexConfigAndData, relRecords[j]);
                            unsortedRecords.push(item);
                        }
                    }


                }
                unsortedRecords.sort(function (a, b) {
                    return new Date(b.dateValueDB) - new Date(a.dateValueDB);
                });
                this.timelineItemsByMonth = this.groupByMonth(unsortedRecords);
                this.childRecords = unsortedRecords;
            } else {
                this.hasTimelineData = false;
            }
        } catch (error) {
            this.errorLoadingData(error);
        }


    }

    groupByMonth(timelineItems) {
        var groupedByMonth = this.groupBy(timelineItems, 'monthValue');
        //Create a monthItem for future timeline items.
        var futureItemGroup = {};
        futureItemGroup.monthValue = Upcoming;
        futureItemGroup.timelineItems = new Array();
        var timelineItemsByMonth = new Array();
        for (let [key, value] of Object.entries(groupedByMonth)) {
            var monthItem = {};
            if (Date.parse(key) - new Date().getTime() > 0) {
                futureItemGroup.timelineItems = futureItemGroup.timelineItems.concat(value);
            } else {
                monthItem.monthValue = moment(key).format("MMM  •  YYYY");
                monthItem.firstOfMonth = moment(key).format("YYYY-MM-01");
                monthItem.timeFromNow = moment(monthItem.monthValue).fromNow();
                monthItem.timelineItems = value;
                timelineItemsByMonth.push(monthItem);
            }

        }
        timelineItemsByMonth.sort(function (a, b) {
            return new Date(b.firstOfMonth) - new Date(a.firstOfMonth);
        });
        //Add the future items to the top of the list
        if (futureItemGroup.timelineItems.length > 0) {
            timelineItemsByMonth.unshift(futureItemGroup);
        }
        return timelineItemsByMonth;

    }

    createTimelineItem(config, apexConfigAndData, recordData) {
        let childRec = {};
        childRec.isTask = false;
        childRec.isExternalServiceData = false;
        childRec.isUiApiNotSupported = config.timeline__LWC_Ui_Api_Not_Supported__c;
        childRec.object = config.timeline__Object__c;
        childRec.title = recordData[config.timeline__Title_Field__c];
        childRec.dateValueDB = config.timeline__Date_Field__c ? recordData[config.timeline__Date_Field__c] : recordData.CreatedDate;
        childRec.dateValue = moment(childRec.dateValueDB).fromNow();
        childRec.monthValue = moment(childRec.dateValueDB).format("YYYY-MM-01");

        let fldsToDisplay = config.timeline__Fields_to_Display__c.split(',');
        if (!childRec.isUiApiNotSupported) {
            childRec.expandedFieldsToDisplay = new Array();
            for (let k = 0; k < fldsToDisplay.length; k++) {
                childRec.expandedFieldsToDisplay.push({ "id": fldsToDisplay[k], "apiName": fldsToDisplay[k] });
            }
        } else {
            childRec.expandedFieldsToDisplay = config.timeline__Fields_to_Display__c;
        }
        if (config.timeline__Data_Provider_Type__c === "Apex class") {
            childRec.isExternalServiceData = true;
            childRec.externalData = recordData;
            childRec.externalDataFieldTypes = apexConfigAndData.fieldsWithTypes;
            childRec.recordId = recordData[apexConfigAndData.recordIdentifierField];
            childRec.baseUrlForRecordDetail = apexConfigAndData.baseUrlForRecordDetail;
        } else {
            childRec.isExternalServiceData = false;
            childRec.recordId = recordData.Id;
        }
        childRec.themeInfo = {
            iconName: config.timeline__Icon_Name__c,
            iconImgUrl: config.timeline__Icon_Image_Url__c,
            color: config.timeline__Object_Color__c
        };
        if (config.timeline__Object__c === "Task") {
            //Special fields for Task
            childRec.isTask = true;
            childRec.isCustom = false;
            childRec.description = recordData.Description;
            childRec.WhoId = recordData.WhoId;
            childRec.OwnerId = recordData.OwnerId;
            childRec.assignedToName = (childRec.OwnerId === CURRENT_USER_ID) ? You : recordData.Owner.Name;
            if (recordData.Who) {
                childRec.whoToName = recordData.Who.Name;
            }
            childRec.TaskSubtype = recordData.TaskSubtype;

        }
        return childRec;
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
        if (event.detail.dateFilter) {
            this.dateFilterSelection = event.detail.dateFilter;
            this.objectFilters = event.detail.objectFilter;
            this.refreshData();
        }
    }

    get filteredObjects() {
        return this.objectFilters != null ? this.objectFilters : this.initialObjectSelection;
    }

    groupBy(xs, key) {
        return xs.reduce(function (rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    }
}
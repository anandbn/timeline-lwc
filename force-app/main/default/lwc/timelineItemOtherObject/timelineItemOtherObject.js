/* 
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement, api, track, wire } from 'lwc';
import getTimelineItemChildData from '@salesforce/apex/RecordTimelineDataProvider.getTimelineItemChildData';
import { loadScript } from 'lightning/platformResourceLoader';
import MOMENT_JS from '@salesforce/resourceUrl/moment_js';
import Toggle_Details from '@salesforce/label/c.Toggle_details';
import LANG from '@salesforce/i18n/lang';
import LOCALE from '@salesforce/i18n/locale';

export default class TimelineItemOtherObject extends LightningElement {

    @api title;
    @api object;
    @api dateValue;
    @api expandedFieldsToDisplay;
    @api fieldData;
    @api recordId;
    @api isExternalServiceData;
    @api externalData;
    @api externalDataFieldTypes;
    @api baseUrlForRecordDetail;

    @api expanded;
    @api themeInfo;
    @track dataLoaded = false;

    label = {
        Toggle_Details
    }
    connectedCallback() {
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

    toggleDetailSection() {
        this.expanded = !this.expanded;
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
                fldData.fieldValue=data[fld.relationshipName]['Name'];
                fldData.isHyperLink=true;
                fldData.hyperLinkToId=data[fld.relationshipName]['Id'];
            }else if(fld.dataType.toUpperCase() === "REFERENCE"){
                fldData.fieldValue=data[fld.relationshipName][fld.referenceToApiName];
                fldData.isHyperLink=true;
                fldData.hyperLinkToId=data[fld.relationshipName]['Id'];
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
import { LightningElement, api, track, wire } from 'lwc';
import getTimelineItemChildData from '@salesforce/apex/RecordTimelineDataProvider.getTimelineItemChildData';
import { loadScript } from 'lightning/platformResourceLoader';
import MOMENT_JS from '@salesforce/resourceUrl/moment_js';

export default class TimelineItemOtherObject extends LightningElement {

    @api title;
    @api object;
    @api dateValue;
    @api expandedFieldsToDisplay;
    @api fieldData;
    @api recordId;
    @track expanded;
    @api themeInfo;
    @track dataLoaded = false;

    connectedCallback() {
        Promise.all([
            loadScript(this, MOMENT_JS),
        ]).then(() => {
            console.log('TimelineItemOtherObject: MomentJS loaded');
        })
        .catch(error => {
            console.log('TimelineItemOtherObject: MomentJS not loaded');
        });
    }

    get hasIconName() {
        return this.themeInfo.iconName != null;
    }

    get objectThemeColor() {
        return `background-color: #${this.themeInfo.color};`;
    }

    get itemStyle() {
        return this.expanded ? "slds-timeline__item_expandable slds-is-open" : "slds-timeline__item_expandable";
    }

    get totalFieldsToDisplay() {
        return this.expandedFieldsToDisplay.length;
    }

    toggleDetailSection() {
        this.expanded = !this.expanded;
        if (this.expanded && !this.dataLoaded) {
            getTimelineItemChildData({
                objectApiName: this.object,
                fieldsToExtract: this.expandedFieldsToDisplay,
                recordId: this.recordId
            })
                .then(data => {
                    this.dataLoaded=true;
                    this.fieldData = new Array();
                    for (let i = 0; i < data.fieldMetadata.length; i++) {
                        let fld = data.fieldMetadata[i];
                        let fldData = {};
                        fldData.apiName = fld.apiName;
                        fldData.fieldLabel = fld.fieldLabel;
                        fldData.dataType = fld.dataType;
                        fldData.fieldValue = data.data[fld.apiName];
                        if(fld.isNamePointing){
                            fldData.fieldValue=data.data[fld.relationshipName]['Name'];
                            fldData.isHyperLink=true;
                            fldData.hyperLinkToId=data.data[fld.relationshipName]['Id'];
                        }else if(fld.dataType.toUpperCase() === "REFERENCE"){
                            fldData.fieldValue=data.data[fld.relationshipName][fld.referenceToApiName];
                            fldData.isHyperLink=true;
                            fldData.hyperLinkToId=data.data[fld.relationshipName]['Id'];
                        }
                        fldData.isBoolean = fld.dataType.toUpperCase() === "Boolean".toUpperCase();
                        fldData.isBooleanTrue = fldData.fieldValue;
                        if(fldData.dataType.toUpperCase() === "Date".toUpperCase() || fldData.dataType.toUpperCase() === "DateTime".toUpperCase()){
                            fldData.fieldValue =  moment(fldData.fieldValue).format("dddd, MMMM Do YYYY, h:mm:ss a");
                        }
                        
                        this.fieldData.push(fldData);
                    }
                })
                .catch(error => {
                });
        }
    }

}
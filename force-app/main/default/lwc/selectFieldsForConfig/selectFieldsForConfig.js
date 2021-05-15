import { LightningElement, api, wire, track } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import getFieldsForObject from '@salesforce/apex/AddChildObjectToConfigController.getFieldsForObject';

const columns = [
    { label: 'API Name', fieldName: 'apiName' },
    { label: 'Label', fieldName: 'label' },
    { label: 'Type', fieldName: 'type' }
];

export default class SelectFieldsForConfig extends LightningElement {

    @api childObjectApiName;
    @api iconImageUrl;
    @api objectColor;
    @api displayFields;
    @api dateField;
    @api titleField;
    @api relationshipName;
    @api iconName;
    @track isLoading = true;
    @api stepName;
    @api childObjectFields;
    @api selectedFields = [];
    selectedFieldList;
    @api uiApiNotSupported;
    @api selectedApexClass;
    @api providerType;
    //No set .. had keep as the properties could not be removed from the metadata.xml
    @api whereClause;
    @api filterConfigJson;

    @track fields;
    @track columns = columns;
    @track configExpanded = true;

    @wire(getObjectInfo, { objectApiName: '$childObjectApiName' })
    getFieldNamesForObjectResponse({ error, data }) {
        if (data) {
            this.iconImageUrl = data.themeInfo.iconUrl;
            this.objectColor = data.themeInfo.color;
            let fields = data.fields;
            let fieldResults = [];
            for (let field in fields) {
                if (Object.prototype.hasOwnProperty.call(fields, field)) {
                    if (this.stepName === "Display Fields" || this.stepName === "Title Field") {
                        fieldResults.push({
                            fieldId: fields[field].apiName,
                            label: fields[field].label,
                            apiName: fields[field].apiName,
                            type: fields[field].dataType
                        });
                    }

                    if (this.stepName === "Overdue Field") {
                        if (fields[field].dataType.toUpperCase() === "Boolean".toUpperCase()) {
                            fieldResults.push({
                                fieldId: fields[field].apiName,
                                label: fields[field].label,
                                apiName: fields[field].apiName,
                                type: fields[field].dataType
                            });
                        }
                    }
                    if (this.stepName === "Date Field") {
                        if (fields[field].dataType === "DateTime" || fields[field].dataType === "Date") {
                            fieldResults.push({
                                fieldId: fields[field].apiName,
                                label: fields[field].label,
                                apiName: fields[field].apiName,
                                type: fields[field].dataType
                            });
                        }
                    }

                }
            }
            this.fields = fieldResults;
            this.isLoading = false;
        }
        if (error) {
            console.log(JSON.stringify(error, null, 4));
            this.uiApiNotSupported = true;
            getFieldsForObject({ objectApiName: this.childObjectApiName })
                .then(result => {
                    this.processFieldResults(result);
                })
                .catch(error => {
                    this.error = error;
                });
        }
    }

    processFieldResults(fields) {
        let fieldResults = [];

        for (let field in fields) {
            if (Object.prototype.hasOwnProperty.call(fields, field)) {
                if (this.stepName === "Display Fields" || this.stepName === "Title Field") {
                    fieldResults.push({
                        fieldId: fields[field].apiName,
                        label: fields[field].label || fields[field].fieldLabel,
                        apiName: fields[field].apiName,
                        type: fields[field].dataType
                    });
                }
                if (this.stepName === "Date Field") {
                    if (fields[field].dataType.toUpperCase() === "DateTime".toUpperCase() || fields[field].dataType.toUpperCase() === "Date".toUpperCase()) {
                        fieldResults.push({
                            fieldId: fields[field].apiName,
                            label: fields[field].label || fields[field].fieldLabel,
                            apiName: fields[field].apiName,
                            type: fields[field].dataType
                        });
                    }
                }
                //Only include Boolean fields for Overdue field
                if (this.stepName === "Overdue Field") {
                    if (fields[field].dataType.toUpperCase() === "Boolean".toUpperCase()) {
                        fieldResults.push({
                            fieldId: fields[field].apiName,
                            label: fields[field].label || fields[field].fieldLabel,
                            apiName: fields[field].apiName,
                            type: fields[field].dataType
                        });
                    }
                }

            }
        }
        this.fields = fieldResults;
        this.isLoading = false;
    }
    get maxRowsToSelect() {
        if (this.stepName === "Display Fields") {
            return 5;
        } else if (this.stepName === "Date Field" || this.stepName === "Overdue Field") {
            return 1;
        } else if (this.stepName === "Title Field") {
            return 3;
        }
    }

    rowSelected(event) {
        if (event.detail.selectedRows && event.detail.selectedRows.length > 0) {
            if (this.selectedFieldList && this.selectedFieldList.length > 0) {
                for (let i = 0; i < event.detail.selectedRows.length; i++) {
                    //Search for selected field in current selected list;
                    let filteredFields = this.selectedFieldList.filter(fld => fld.apiName == event.detail.selectedRows[i].apiName);
                    if (!filteredFields || filteredFields.length == 0) {
                        this.selectedFieldList.push(event.detail.selectedRows[i]);
                    }
                }
            }else{
                this.selectedFieldList = event.detail.selectedRows;
            }
            this.selectedFields = this.selectedFieldList.map(fld => fld.apiName).join(',');
        }
    }

    handleFieldReordered(event) {
        this.selectedFieldList = event.detail;
        this.selectedFields = this.selectedFieldList.map(fld => fld.apiName).join(',');
    }

    get stepTitle() {
        if (this.stepName === "Display Fields") {
            return "Select upto 5 fields to display";
        } else if (this.stepName === "Date Field") {
            return "Select a Date Field";
        } else if (this.stepName === "Title Field") {
            return "Select upto 3 fields to display on the Title";
        } else {
            return "";
        }

    }

    get showFieldReordering() {
        return this.stepName === "Display Fields" || this.stepName === "Title Field";
    }

    get hasIconInfo() {
        return (this.iconImageUrl != null && this.objectColor != null) ||
            (this.iconName != null);
    }

    get objectIconStyle() {
        return this.objectColor != null ? `background-color:#${this.objectColor};` : '';
    }

    get isConfirmationStep() {
        return this.stepName === "Confirmation";
    }

    get configSectionStyle() {
        return this.configExpanded ? 'slds-section slds-is-open' : 'slds-section';
    }

    get sectionDisplayStyle() {
        return this.configExpanded ? '' : 'display:none;';
    }

    get sectionButtonIcon() {
        return this.configExpanded ? 'utility:chevrondown' : 'utility:chevronright';
    }

    get hasIconName() {
        return this.iconName != null;
    }

    get isApexProvider() {
        return this.providerType === "Apex class";
    }
    expandOrCollapse() {
        this.configExpanded = !this.configExpanded;
    }
}
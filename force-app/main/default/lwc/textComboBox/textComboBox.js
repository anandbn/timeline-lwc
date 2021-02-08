/* 
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement, api, track } from 'lwc';
import searchInObject from '@salesforce/apex/TaskUtils.searchInObject';

export default class TextComboBox extends LightningElement {

    @track showOptions = false;
    @track showObjectSelector = false;
    @track selectedObject;
    @track selectedObjectIcon;

    @api objectSelectorConfig;
    @api displayObjectSelector = false;
    @api listOfOptions;
    @api label;
    @api placeHolderText;
    @api fieldName;
    @api value;
    @api selectedRecordId;
    @api selectedRecordName;
    @api selectedRecordIconName;
    @api searchDelegateApexClass;

    connectedCallback() {
        //Set the selected object to what is passed into the config
        if (this.objectSelectorConfig) {
            this.selectedObject = this.objectSelectorConfig.initialSelection.objectName;
            this.selectedObjectIcon = this.objectSelectorConfig.initialSelection.iconName;
        }
    }
    onBlur() {
        this.showOptions = false;
    }
    onFocus() {
        this.showOptions = true;
        this.showObjectSelector = false;
        if (this.searchDelegateApexClass) {
            searchInObject({ objectName: this.selectedObject, searchText: this.value, searchDelegateClass: this.searchDelegateApexClass })
                .then(data => {
                    this.listOfOptions = new Array();
                    for (var i = 0; i < data.length; i++) {
                        this.listOfOptions.push({
                            "iconName": this.selectedObjectIcon,
                            "label": data[i].name,
                            "sublabel": data[i].parentName,
                            "recordId": data[i].recordId,
                            "value": data[i].recordId,
                        });
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }
    get fieldValue() {
        return this.value ? this.value : "";
    }

    get hasRecordId() {
        return this.selectedRecordId != null;
    }
    get objectSelectionOptions() {
        return this.objectSelectorConfig.objectConfig;
    }

    get hasListOptions(){
        if(this.listOfOptions){
            return this.listOfOptions.length>0;
        }else{
            return true;
        }
    }

    resetSelectedObject() {
        this.selectedRecordIcon = null;
        this.selectedRecordId = null;
        this.selectedRecordName = null;
        this.showOptions = true;
    }
    displayObjectSelectorMenu() {
        this.showOptions = false;
        this.showObjectSelector = true;

    }
    textChanged(event) {
        this.value = event.target.value;
        if (event.key === "Escape") {
            this.showOptions = false;
            return;
        } else {
            if (this.searchDelegateApexClass) {
                searchInObject({ objectName: this.selectedObject, searchText: this.value, searchDelegateClass: this.searchDelegateApexClass })
                    .then(data => {
                        this.listOfOptions = new Array();
                        for (var i = 0; i < data.length; i++) {
                            this.listOfOptions.push({
                                "iconName": this.selectedObjectIcon,
                                "label": data[i].name,
                                "sublabel": data[i].parentName,
                                "recordId": data[i].recordId,
                                "value": data[i].recordId,
                            });
                        }
                        this.showOptions=true;
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
            this.dispatchEvent(new CustomEvent('select', { detail: { "fieldName": this.fieldName, "value": this.value } }));
            
        }
    }

    optionSelected(event) {
        if (event.detail.recordId) {
            this.selectedRecordId = event.detail.recordId;
            this.selectedRecordName = event.detail.label;
            this.selectedRecordIcon = event.detail.iconName;
            this.dispatchEvent(new CustomEvent('select', {  bubbles:true, composite:true, detail: { "fieldName": this.fieldName, "value": event.detail.value, recordId: event.detail.recordId } }));

        } else {
            this.value = event.detail.value;
            this.dispatchEvent(new CustomEvent('select', { bubbles:true, composite:true, detail: { "fieldName": this.fieldName, "value": event.detail.value } }));

        }
        this.showOptions = false;
    }

    selectObject(event) {
        this.selectedObject = event.target.getAttribute('data-object-name');
        this.selectedObjectIcon = event.target.getAttribute('data-object-icon');
        this.showObjectSelector = false;
    }
}
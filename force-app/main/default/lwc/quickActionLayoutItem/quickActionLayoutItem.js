import { LightningElement,api } from 'lwc';
const STANDARD_FIELDS = ["Subject","WhatId","OwnerId","WhoId"];
const STANDARD_TYPES = ["date","combobox","picklist","textarea"];

export default class QuickActionLayoutItem extends LightningElement {

    @api field;

    @api parentRecordName;
    @api parentRecordId;
    @api parentRecordIcon;
    @api parentRecordColor;
    @api currentUsername;

    nameObjectSelectorMenuConfig = {
        "searchClassDelegate": "",
        "objectConfig": [
            { "objectName": "Contact", "iconName": "standard:contact", "nameField": "Name" },
            { "objectName": "Lead", "iconName": "standard:lead", "nameField": "Name" },
        ],
        "initialSelection": { "objectName": "Contact", "iconName": "standard:contact", "nameField": "Name" }
    }

    get isEmptySpace(){
        return this.field.label==="";
    }

    get isSubject(){
        return this.field.name === "Subject";
    }

    get isAssignedTo(){
        return this.field.name === "OwnerId";
    }

    get isWhatId(){
        return this.field.name === "WhatId";
    }

    get isWhoId(){
        return this.field.name === "WhoId";
    }

    get isDate(){
        return this.field.type === "date";
    }

    get isPicklist(){
        return this.field.type === "picklist" ;
    }

    get isTextArea(){
        return this.field.type === "textarea" ;
    }

    get isBoolean(){
        return this.field.type === "textarea" ;
    }

    get isOtherType(){
        return !STANDARD_TYPES.includes(this.field.type); 
    }

    get hasHelpText(){
        return this.field.inlineHelpText !=null && this.field.inlineHelpText.length > 0;
    }

    get isStandardField(){
        return STANDARD_FIELDS.includes(this.field.name)
    }

    get picklistOptions(){
        var options = new Array();
        if(this.field.type==="picklist" || this.field.name === "Subject"){
            if (this.field.picklistValues) {
                for (var i = 0; i < this.field.picklistValues.length; i++) {
                    options.push({ label: this.field.picklistValues[i].label, value: this.field.picklistValues[i].value })
                }
            }
    
        }
        return options;
    }

    handleSelect(event){
        this.dispatchEvent(new CustomEvent('select', {  bubbles:true, composite:true, detail: event.detail }));
    }

    handleOnChange(event){
        this.dispatchEvent(new CustomEvent('select', {
            bubbles: true, composite: true, detail:
            {
                "fieldName": this.field.name,
                "value": event.detail.value,
                recordId: event.detail.recordId
            }
        }
        ));

    }
    

}
import { LightningElement, track, api } from 'lwc';
import getTaskSubjectOptions from '@salesforce/apex/TaskUtils.getTaskSubjectOptions';
import saveTask from '@salesforce/apex/TaskUtils.saveTask';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class LogATask extends LightningElement {

    taskSubjects;
    taskStatusList;
    currentUserName;
    @api subject;
    @api status;
    @api hideStatus = false;
    @api hideDueDate = false
    @api hideComments = false;
    @api parentRecordName;
    @api parentRecordId;
    @api parentRecordIcon;
    @api parentRecordColor;
    @api dueDate;
    @api subType;
    whoId;

    nameObjectSelectorMenuConfig = {
        "searchClassDelegate": "",
        "objectConfig": [
            { "objectName": "Contact", "iconName": "standard:contact", "nameField": "Name" },
            { "objectName": "Lead", "iconName": "standard:lead", "nameField": "Name" },
        ],
        "initialSelection": { "objectName": "Contact", "iconName": "standard:contact", "nameField": "Name" }
    }

    connectedCallback() {
        console.log(`this.subject = ${this.subject}`);
        getTaskSubjectOptions()
            .then(data => {
                this.taskSubjects = data.subjectOptions;
                this.taskStatusList = data.statusOptions;
                this.currentUserName = data.currentUserName;
            })
            .catch(error => {
                this.errorLoadingData(error);
            });
    }

    onChangeDueDate(event) {
        this.dueDate = event.target.value;
    }

    get statusOptions() {
        var options = new Array();
        if (this.taskStatusList) {
            for (var i = 0; i < this.taskStatusList.length; i++) {
                options.push({ label: this.taskStatusList[i].label, value: this.taskStatusList[i].value })
            }
        }
        return options;
    }

    get statusValue() {
        return this.status ? this.status : "Not Started";
    }
    set statusValue(val) {
        this.status = val;
    }
    setStatus(event) {
        this.status = event.target.value;
    }
    setSubject(event) {
        this.subject = event.detail.value;
    }

    
    setName(event) {
        this.whoId = event.detail.recordId;
    }

    setDueDate(event) {
        this.dueDate = event.target.value;
    }

    setComments(event){
        this.comments=event.target.value;
    }

    

    saveTask() {
        
        saveTask({ subject: this.subject, dueDate: this.dueDate,whoId: this.whoId, whatId: this.parentRecordId, 
                    status: this.status, comments: this.comments,subType:this.subType })
            .then(data => {
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

}
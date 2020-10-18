import { LightningElement, track, api } from 'lwc';
import getTaskSubjectOptions from '@salesforce/apex/TaskUtils.getTaskSubjectOptions';
import saveEvent from '@salesforce/apex/TaskUtils.saveEvent';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class LogAnEvent extends LightningElement {

    taskSubjects;
    currentUserName;
    @api subject;
    @api parentRecordName;
    @api parentRecordId;
    @api parentRecordIcon;
    @api parentRecordColor;
    @api startDate = new Date().toISOString();
    @api endDate; 
    @api allDayEvent;
    @track startEndDateType='datetime';
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
       getTaskSubjectOptions()
            .then(data => {
                this.taskSubjects = data.subjectOptions;
                this.currentUserName = data.currentUserName;
            })
            .catch(error => {
                this.errorLoadingData(error);
            });
    }

    get initialEndDate(){
        var dt = new Date();
        dt.setHours(dt.getHours() + 1 );
        this.endDate=dt.toISOString();
        return dt.toISOString();
    }

    onChangeStartDate(event) {
        this.dueDate = event.target.value;
    }

    onChangeEndDate(event) {
        this.dueDate = event.target.value;
    }

    setSubject(event) {
        this.subject = event.detail.value;
    }

    get objectIconStyle() {
        return this.parentRecordColor != null ? `background-color:#${this.parentRecordColor};` : '';
    }

    setName(event) {
        this.whoId = event.detail.recordId;
    }

    setStartDate(event) {
        this.startDate = event.target.value;
    }

    setEndDate(event) {
        this.endDate = event.target.value;
    }

    setLocation(event){
        this.location=event.target.value;
    }

    allDayEventClicked(event){
        this.allDayEvent=event.target.checked;
        if(this.allDayEvent){
            this.startEndDateType='date';
        }else{
            this.startEndDateType='datetime';
        }
    }

    saveEvent() {
        console.log(`subject: ${this.subject}, startDate: ${this.startDate},endDate: ${this.endDate},
        whoId: ${this.whoId}, whatId: ${this.parentRecordId}, allDayEvent:${this.allDayEvent},location:${this.location}`);
        /*
        saveEvent({ subject: this.subject, startDate: Date.parse(this.startDate).toIsoString(),endDate: Date.parse(this.endDate).toIsoString(),
                    whoId: this.whoId, whatId: this.parentRecordId, allDayEvent:this.allDayEvent,location:this.location })
            .then(data => {
                const event = new ShowToastEvent({
                    "variant":"success",
                    "message": data.Subject?"Event {0} was created":"{0} was created",
                    "messageData": [
                        {
                            url: '/'+data.Id,
                            label: (data.Subject?data.Subject:"Event"),
                        }
                    ]
                });
                this.dispatchEvent(event);
            }).catch(error => {
                console.log(error);
            });
        */
    }

}
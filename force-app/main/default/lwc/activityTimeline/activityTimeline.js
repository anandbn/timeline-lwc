import { LightningElement,track,wire,api } from 'lwc';
import getTimelineItemData from '@salesforce/apex/RecordTimelineDataProvider.getTimelineItemData';

export default class ActivityTimeline extends LightningElement {
    @api recordId;
    @api configId;
    @track childRecords;
    @track error;
    @track errorMsg;

    @wire(getTimelineItemData,{ confId: '$configId',recordId:'$recordId' })
    timelineResponse({error, data}){
        if(data){
            this.childRecords = new Array();
            let unsortedRecords = new Array();
            let configs = data.configuration.Timeline_Child_Objects__r;
            for(let i=0;i<configs.length;i++){
                let relRecords = data.data[configs[i].Relationship_Name__c];
                for(let j=0;j<relRecords.length;j++){
                    let childRec = {};
                    childRec.object=configs[i].Object__c;
                    childRec.title = relRecords[j][configs[i].Title_Field__c];
                    childRec.dateValue=relRecords[j].CreatedDate;
                    let fldsToDisplay = configs[i].Fields_to_Display__c.split(',');
                    childRec.expandedFieldsToDisplay=new Array();
                    for(let k=0;k<fldsToDisplay.length;k++){
                        childRec.expandedFieldsToDisplay.push( { "id":fldsToDisplay[k], "apiName":fldsToDisplay[k] });
                    }
                    childRec.recordId=relRecords[j].Id;
                    childRec.themeInfo = {
                        iconName:configs[i].Icon_Name__c,
                        iconImgUrl:configs[i].Icon_Image_Url__c,
                        color:configs[i].Object_Color__c
                    };
                    unsortedRecords.push(childRec);
                }
            }
            unsortedRecords.sort(function(a,b){
                return new Date(a.date) - new Date(b.date);
            });
            this.childRecords=unsortedRecords;
        }
        if(error){
            this.error=true;
            this.errorMsg = `[ ${error.body.exceptionType} ] : ${error.body.message}`;
        }
    }

    get isParametersValid(){
        return (this.recordId!=null && this.configId!=null) 
    }
}
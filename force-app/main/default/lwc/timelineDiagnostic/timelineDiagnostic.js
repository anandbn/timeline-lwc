import { LightningElement,wire,track } from 'lwc';

import getTimelineConfigurations from '@salesforce/apex/TimelineDiagnosticController.getTimelineConfigurations'
import getChildConfigurations from '@salesforce/apex/TimelineDiagnosticController.getChildConfigurations';

export default class TimelineDiagnostic extends LightningElement {

    @wire(getTimelineConfigurations)
    timelineConfigurations;
    
    @track
    childConfigurations;

    @track
    recordId;

    get options(){
        let configOptions = new Array();
        if(this.timelineConfigurations.data){
            for(var i=0;i<this.timelineConfigurations.data.length;i++){
                configOptions.push({
                    label: `${this.timelineConfigurations.data[i].Name} - ${this.timelineConfigurations.data[i].timeline__Object__c}`,
                    value:`${this.timelineConfigurations.data[i].Id}`
                })
            }
        }
        return configOptions;
    }

    onTimelineConfigSelected(event){
        getChildConfigurations({configId:event.detail.value})
        .then(data =>{
            this.childConfigurations=data;
        }).catch(error=>{
            console.log(JSON.stringify(error));
        })
    }

    get hasChildConfigurations(){
        return this.childConfigurations && this.childConfigurations.length>0;
    }

    get hasRecordId(){
        return this.recordId!=null;
    }

    setRecordId(event){
        this.recordId=event.target.value;
    }
}
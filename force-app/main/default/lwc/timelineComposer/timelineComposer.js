import { LightningElement, api,wire,track } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import getObjectName from '@salesforce/apex/TaskUtils.getObjectName';

export default class TimelineComposer extends LightningElement {

    @api recordId;
    @api objectApiName;
    @track recordIconUrl;
    @track recordObjectColor;
    @track recordName;
    @track recordNameField;

    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    objectInfoResponse({error,data}){
        if(data){
            this.recordIconUrl=data.themeInfo.iconUrl;
            this.recordObjectColor=data.themeInfo.color;
            this.recordNameField = data.nameFields[0];
            
            getObjectName({objectName:this.objectApiName,recordId:this.recordId,nameField:this.recordNameField})
            .then(data =>{
                this.recordName=data;
            }).catch(error =>{
                console.log(JSON.stringify(error));
            });
        }
    }

    get today(){
        return new Date().toISOString();
    }

    callRestApi(){
        var lwcApi = this.template.querySelector("c-lwc-api");
        lwcApi.restRequest(
            {
                'url': '/services/data/v48.0/sobjects',
                'method': 'get'
            }
        );
    }

    
}
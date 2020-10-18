import { LightningElement,api,track } from 'lwc';
import diagnoseChildConfiguration from '@salesforce/apex/TimelineDiagnosticController.diagnoseChildConfiguration';

export default class DiagnosticTestItem extends LightningElement {

    @api recordId;
    @api childConfigId;
    @api titleField;
    @api dateField;
    @api fieldsToDisplay;
    @api parentRefField;

    @track soqlQuery;
    @track childRecords;

    testChildConfig(){
        diagnoseChildConfiguration({childConfigId:this.childConfigId,recordId:this.recordId}).then(data =>{
            this.soqlQuery=data.soqlQuery;
            this.childRecords=data.records;
        }).catch(error =>{
            console.log(JSON.stringify(error));

        });
    }

    get displayColumns(){
        let fields = this.fieldsToDisplay.split(',');
        let displayColumns = new Array();
        displayColumns.push({label:'Id',fieldName:'Id'});
        displayColumns.push({label:this.titleField,fieldName:this.titleField});
        displayColumns.push({label:this.dateField,fieldName:this.dateField});
        for(var i=0;i<fields.length;i++){
            displayColumns.push({label:fields[i],fieldName:fields[i]});
        }
        return displayColumns;
    }

    get hasRecords(){
        return this.childRecords !=null && this.childRecords.length>0;
    }


}
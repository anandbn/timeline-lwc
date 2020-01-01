import { LightningElement,api,wire,track} from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';


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
    @api selectedFields;
    
    @track fields;
    @track columns = columns;
    @track configExpanded=true;

    @wire(getObjectInfo,{objectApiName:'$childObjectApiName'})
    getFieldNamesForObjectResponse({error,data}){
        if(data){
            this.iconImageUrl=data.themeInfo.iconUrl;
            this.objectColor=data.themeInfo.color;
            let fields = data.fields;
            let fieldResults = [];
            for (let field in fields) {
                if (Object.prototype.hasOwnProperty.call(fields, field)) {
                    if(this.stepName === "Display Fields" || this.stepName === "Title Field"){
                        fieldResults.push({
                            fieldId: fields[field].apiName,
                            label: fields[field].label,
                            apiName: fields[field].apiName,
                            type: fields[field].dataType
                        });
                    }
                    if(this.stepName === "Date Field"){
                        if(fields[field].dataType === "DateTime" ||fields[field].dataType === "Date"){
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
            this.fields=fieldResults;
            this.isLoading=false;
        }
        if(error){
            console.log(JSON.stringify(error,null,4));
        }
    }

    get maxRowsToSelect(){
        if(this.stepName === "Display Fields"){
            return 5;
        }else if(this.stepName === "Date Field" || this.stepName === "Title Field" ){
            return 1;
        }else{
            return 1;
        }
    }

    rowSelected(event) {
        let selFlds = new Array();
        let selRows = event.detail.selectedRows;
        for(let i=0;i<selRows.length;i++){
            selFlds.push(selRows[i].apiName);
        }
        this.selectedFields=selFlds.join(',');
    }

    get stepTitle(){
        if(this.stepName === "Display Fields"){
            return "Select upto 5 fields to display";
        }else if(this.stepName === "Date Field"){
            return "Select a Date Field";
        }else if(this.stepName === "Title Field"){
            return "Select a Title Field";
        }else{
            return "";
        }
        
    }

    get hasIconInfo(){
        return (this.iconImageUrl !=null && this.objectColor !=null) || 
                (this.iconName !=null);
    }

    get objectIconStyle(){
        return this.objectColor !=null?`background-color:#${this.objectColor};`:'';
    }
    
    get isConfirmationStep(){
        return this.stepName === "Confirmation";
    }

    get configSectionStyle(){
        return this.configExpanded?'slds-section slds-is-open':'slds-section';
    }

    get sectionDisplayStyle(){
        return this.configExpanded?'':'display:none;';
    }

    get sectionButtonIcon(){
        return this.configExpanded?'utility:chevrondown':'utility:chevronright';
    }

    get hasIconName(){
        return this.iconName!=null;
    }
    expandOrCollapse(){
        this.configExpanded = !this.configExpanded;
    }
}
import { LightningElement, wire, api, track } from 'lwc';
import getFieldsForObject from '@salesforce/apex/AddChildObjectToConfigController.getFieldsForObject';
const DATE_LITERAL_OPTIONS = [
    { label: 'YESTERDAY', value: 'YESTERDAY' , nVariable:false},
    { label: 'TODAY', value: 'TODAY' , nVariable:false},
    { label: 'TOMORROW', value: 'TOMORROW' , nVariable:false},
    { label: 'LAST_WEEK', value: 'LAST_WEEK' , nVariable:false},
    { label: 'THIS_WEEK', value: 'THIS_WEEK' , nVariable:false},
    { label: 'NEXT_WEEK', value: 'NEXT_WEEK' , nVariable:false},
    { label: 'LAST_MONTH', value: 'LAST_MONTH' , nVariable:false},
    { label: 'THIS_MONTH', value: 'THIS_MONTH' , nVariable:false},
    { label: 'NEXT_MONTH', value: 'NEXT_MONTH' , nVariable:false},
    { label: 'LAST_90_DAYS', value: 'LAST_90_DAYS' , nVariable:false},
    { label: 'NEXT_90_DAYS', value: 'NEXT_90_DAYS' , nVariable:false},
    { label: 'LAST_N_DAYS:n', value: 'LAST_N_DAYS' , nVariable:true, nVariableLabel:'days'},
    { label: 'NEXT_N_DAYS:n', value: 'NEXT_N_DAYS' , nVariable:true, nVariableLabel:'days'},
    { label: 'NEXT_N_WEEKS:n', value: 'NEXT_N_WEEKS' , nVariable:true, nVariableLabel:'weeks'},
    { label: 'LAST_N_WEEKS:n', value: 'LAST_N_WEEKS' , nVariable:true, nVariableLabel:'weeks'},
    { label: 'NEXT_N_MONTHS:n', value: 'NEXT_N_MONTHS' , nVariable:true, nVariableLabel:'months'},
    { label: 'LAST_N_MONTHS:n', value: 'LAST_N_MONTHS' , nVariable:true, nVariableLabel:'months'},
    { label: 'THIS_QUARTER', value: 'THIS_QUARTER' , nVariable:false},
    { label: 'LAST_QUARTER', value: 'LAST_QUARTER' , nVariable:false},
    { label: 'NEXT_QUARTER', value: 'NEXT_QUARTER' , nVariable:false},
    { label: 'NEXT_N_QUARTERS:n', value: 'NEXT_N_QUARTERS' , nVariable:true, nVariableLabel:'quarters'},
    { label: 'LAST_N_QUARTERS:n', value: 'LAST_N_QUARTERS' , nVariable:true, nVariableLabel:'quarters'},
    { label: 'THIS_YEAR', value: 'THIS_YEAR' , nVariable:false},
    { label: 'LAST_YEAR', value: 'LAST_YEAR' , nVariable:false},
    { label: 'NEXT_YEAR', value: 'NEXT_YEAR' , nVariable:false},
    { label: 'NEXT_N_YEARS:n', value: 'NEXT_N_YEARS' , nVariable:true, nVariableLabel:'years'},
    { label: 'LAST_N_YEARS:n', value: 'LAST_N_YEARS' , nVariable:true, nVariableLabel:'years'},
    { label: 'THIS_FISCAL_QUARTER', value: 'THIS_FISCAL_QUARTER' , nVariable:false},
    { label: 'LAST_FISCAL_QUARTER', value: 'LAST_FISCAL_QUARTER' , nVariable:false},
    { label: 'NEXT_FISCAL_QUARTER', value: 'NEXT_FISCAL_QUARTER' , nVariable:false},
    { label: 'NEXT_N_FISCAL_​QUARTERS:n', value: 'NEXT_N_FISCAL_​QUARTERS:n' , nVariable:true, nVariableLabel:'quarters'},
    { label: 'LAST_N_FISCAL_​QUARTERS:n', value: 'LAST_N_FISCAL_​QUARTERS:n' , nVariable:true, nVariableLabel:'quarters'},
    { label: 'THIS_FISCAL_YEAR', value: 'THIS_FISCAL_YEAR' , nVariable:false},
    { label: 'LAST_FISCAL_YEAR', value: 'LAST_FISCAL_YEAR' , nVariable:false},
    { label: 'NEXT_FISCAL_YEAR', value: 'NEXT_FISCAL_YEAR' , nVariable:false},
    { label: 'NEXT_N_FISCAL_​YEARS:n', value: 'NEXT_N_FISCAL_​YEARS' , nVariable:true, nVariableLabel:'years'},
    { label: 'LAST_N_FISCAL_​YEARS:n', value: 'LAST_N_FISCAL_​YEARS' , nVariable:true, nVariableLabel:'years'}
]

const BOOLEAN_OPTIONS = [
    { label: 'TRUE', value: 'true' },
    { label: 'FALSE', value: 'false' }
];

export default class FilterCriteria extends LightningElement {
    @api objectApiName;
    @api childObjectApiName;
    @api parentObjectRefName;

    @track fields;
    @track selectedField;
    @track selectedOperator;
    @track filterValue;
    @track selectedDateLiteral;
    @track dateLiternateNValue;
    @track showNVariable=false;
    @track nVariableLabel='';
    @track fieldOptions;
    @track childFieldsLoaded=false;
    @track parentFieldsLoaded=false;
    @track filterCriteriaList;
    @track isFieldBoolean=false;
    @track isFieldPicklist=false;

    @wire(getFieldsForObject, { objectApiName: '$childObjectApiName' })
    childObjectFields({ error, data }) {
        if (data) {
            console.log(`Fetched ${this.childObjectApiName}'s object info`);
            this.processFieldResults(data, false);
        }
        if (error) {
            console.log(`Error fetching ${this.childObjectApiName}'s object info... ${JSON.stringify(error)}`);
        }
    }

    @wire(getFieldsForObject, { objectApiName: '$objectApiName' })
    parentObjectInfo({ error, data }) {
        if (data) {
            console.log(`Fetched ${this.objectApiName}'s object info`);
            this.processFieldResults(data, true);
        }
        if (error) {
            console.log(`Error fetching ${this.objectApiName}'s object info... ${JSON.stringify(error)}`);
        }
    }

    processFieldResults(fields, isParentObject) {
        let fieldResults = [];
        console.log(`this.fieldOptions.length = ${this.fieldOptions ? this.fieldOptions.length : 0}`);
        console.log(`this.fields.length = ${this.fields ? this.fields.length : 0}`);
        this.fieldOptions = this.fieldOptions || new Array();
        for (let field in fields) {
            //Skip text area fields tht aren't be used in a SOQL WHERE
            if (!(fields[field].dataType.toLowerCase() == 'textarea')) {
                if (Object.prototype.hasOwnProperty.call(fields, field)) {
                    fieldResults.push({
                        fieldId: isParentObject ? `${this.parentObjectRefName}.${fields[field].apiName}` : fields[field].apiName,
                        label: isParentObject ? `${this.parentObjectRefName} > ${fields[field].fieldLabel}` : fields[field].fieldLabel,
                        apiName: isParentObject ? `${this.parentObjectRefName}.${fields[field].apiName}` : fields[field].apiName,
                        type: fields[field].dataType,
                        picklistValues: fields[field].picklistValues
                    });
                    this.fieldOptions.push({
                        label: isParentObject ? `${this.parentObjectRefName} > ${fields[field].fieldLabel}` : fields[field].fieldLabel,
                        value: isParentObject ? `${this.parentObjectRefName}.${fields[field].apiName}` : fields[field].apiName
                    })
                }
            }

        }
        if (!this.fields) {
            this.fields = fieldResults;
        } else {
            this.fields = this.fields.concat(fieldResults);
        }
        if(this.isParentObject){
            this.parentFieldsLoaded=true;
        }else{
            this.childFieldsLoaded=true;
        }
        
    }

    get isLoading(){
        return this.parentFieldsLoaded && this.childFieldsLoaded;
    }


    get operatorOptions() {
        let theOptions = new Array();
        theOptions.push({ label: '=', value: '=' });
        theOptions.push({ label: '!=', value: '!=' });
        theOptions.push({ label: 'contains', value: 'contains' });
        theOptions.push({ label: '>', value: '>' });
        theOptions.push({ label: '>=', value: '>=' });
        theOptions.push({ label: '<', value: '<' });
        theOptions.push({ label: '<=', value: '<=' });
        return theOptions;
    }

    get booleanOptions() {
        
    }

    get dateLiteralOptions() {
        let theOptions = new Array();
        for (let literal in DATE_LITERAL_OPTIONS) {
            if (Object.prototype.hasOwnProperty.call(DATE_LITERAL_OPTIONS, literal)) {
                theOptions.push({
                    label:DATE_LITERAL_OPTIONS[literal].label,
                    value:DATE_LITERAL_OPTIONS[literal].value,
                });
            }
        }
        return theOptions;
    }

    get selectedFieldType() {
        if (this.selectedField && this.selectedField.type.toLowerCase() == 'date') {
            return 'date';
        } else if (this.selectedField && this.selectedField.type.toLowerCase() == 'datetime') {
            return 'datetime';
        } else {
            return 'text';
        }
    }


    get isFilterValid(){
        if(this.selectedField){
            if(this.selectedOperator){
                if(this.selectedFieldType == 'date' || this.selectedFieldType == 'datetime' ){
                    if(this.selectedDateLiteral){
                        if(this.selectedDateLiteral.nVariable){
                            return this.dateLiternateNValue!=null;
                        }else{
                            return true;
                        }
                    }
                    return false;
                }else{
                    return this.filterValue && this.filterValue.length > 0;
                }

            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    operatorSelected(event){
        this.selectedOperator=event.target.value;
    }

    handleDateLiteralSelected(event){
        this.selectedDateLiteral=(DATE_LITERAL_OPTIONS.filter(literal => literal.value == event.detail.value))[0];
        if(this.selectedDateLiteral.nVariable){
            this.showNVariable=true;
            this.nVariableLabel=this.selectedDateLiteral.nVariableLabel;
        }else{
            this.showNVariable=false;
        }
    }

    setFieldValue(event){
        this.filterValue=event.target.value;
    }

    setDateLiteralNValue(event){
        this.dateLiternateNValue=event.target.value;
    }

    get isDateField() {
        return this.selectedFieldType == 'date';
    }


    get boolPicklistOptions(){
        if(this.isFieldBoolean){
            return BOOLEAN_OPTIONS;
        }else if(this.isFieldPicklist){
            return this.selectedField.picklistValues;
        }else{
            return null;
        }
    }

    get nVariablePlaceholder(){
        return `n ${this.nVariableLabel}`;
    }

    get isFieldBooleanOrPicklist(){
        return this.isFieldBoolean||this.isFieldPicklist;
    }
    handleFieldSelected(event) {
        this.isFieldBoolean=false;
        this.isFieldPicklist=false;
        this.selectedField = (this.fields.filter(field => field.apiName == event.detail.value))[0];
        if(this.selectedField.type.toLowerCase() === 'boolean'){
            this.isFieldBoolean=true;
        }
        else if(this.selectedField.type.toLowerCase() === 'picklist' || this.selectedField.type.toLowerCase() === 'multipicklist'){
            this.isFieldPicklist=true;
        }
    }

    addFilterCriteria(event){

        var filterData = {
            "field":this.selectedField.apiName,
            "operator":this.selectedOperator,
            "fieldType":this.selectedField.type
        }
        if(this.selectedFieldType == 'date' || this.selectedFieldType=='datetime'){
            if(this.selectedDateLiteral && this.selectedDateLiteral.nVariable){
                filterData.filterValue=`${this.selectedDateLiteral.value}:${this.dateLiternateNValue}`;
            }else{
                filterData.filterValue=`${this.selectedDateLiteral.value}`;
            }
        }else{
            filterData.filterValue=this.filterValue;
        }
        const selectedEvent = new CustomEvent('addfilter', { detail: 
            filterData
        });

        // Dispatches the event.
        this.dispatchEvent(selectedEvent);
    }
}
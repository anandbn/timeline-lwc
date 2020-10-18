import { LightningElement, api, track } from 'lwc';
import executeSoql from '@salesforce/apex/AddChildObjectToConfigController.runSoql';
import { loadScript } from 'lightning/platformResourceLoader';
import MUSTACHE_JS from '@salesforce/resourceUrl/mustache_js';

const ROW_ACTIONS = [
    { label: 'Delete', name: 'delete' }
];

const COLUMNS = [
    { label: 'Field Name', fieldName: 'field' },
    { label: 'Operator', fieldName: 'operator' },
    { label: 'Filter Value', fieldName: 'filterValue' },
    { type: 'action', typeAttributes: { rowActions: ROW_ACTIONS, iconName:"action:delete" } }
]

const STRING_DATA_TYPES = ['combobox','email','id','multipicklist','phone','picklist','reference','string','textarea','url'];

export default class AddFilterToChildObject extends LightningElement {
    @api objectApiName;
    @api childObjectApiName;
    @api parentObjectRefName;

    @api filterList;

    @track parentRecordId;
    @api isSoqlVerified=false;
    @track isSoqlError=false;
    @track expression;

    connectedCallback(){
        Promise.all([
            loadScript(this, MUSTACHE_JS),
        ]).then(() => {
            console.log('MUSTACHE_JS loaded');
        }).catch(error => {
            console.log(`MUSTACHE_JS load error : ${JSON.stringify(error,null,'\t')}`);
        });
    }
    get columns() {
        return COLUMNS;
    }

    get listOfFilters() {
        let retList = new Array();
        for (let filter in this.filterList) {
            retList.push(this.filterList[filter]);
        }
        return retList;
    }
    addFilterCriteria(event) {
        console.log(`Filter added ${JSON.stringify(event.detail, null, '\t')}`);
        if (!this.filterList) {
            this.filterList = new Array();
        }
        this.filterList.push(event.detail);
        this.isSoqlError=false;
        this.isSoqlVerified=false;
    }

    @api
    get soqlQuery() {
        let soql = `select Id from ${this.childObjectApiName} where ${this.parentObjectRefName} = '${this.parentRecordId ? this.parentRecordId : ''}'`;
        
        let whereExpr = this.generateWhereClause();
        soql +=`${whereExpr.length>0?' and '+whereExpr:''}`;
        return soql;
    }

    @api 
    get whereClause(){
        return this.generateWhereClause();
    }
    
    generateWhereClause()   
    {
        let whereExpr = '';
        let conditions = new Array();
        for (let filterIdx in this.filterList) {
            let filter = this.filterList[filterIdx]
            let whereCondition = `${filter.field} ${filter.operator}`;
            let fieldType= filter.fieldType.toLowerCase();
            if (STRING_DATA_TYPES.includes(fieldType.toLowerCase())) {
                whereCondition += `'${filter.filterValue}'`;
            } else {
                whereCondition += `${filter.filterValue}`;
            }
            conditions.push(whereCondition);
        }
        if (conditions.length > 0) {
            if(this.expression){
                let exprVars = {};
                for(let i=0;i<conditions.length;i++){
                    exprVars[`e${(i+1)}`]=conditions[i];
                }
                let theExpression = '';
                for(let i=0;i<this.expression.length;i++){
                    if(this.expression.charAt(i)===' ' || isNaN(this.expression.charAt(i))){
                        theExpression+=this.expression.charAt(i);
                    }else{
                        theExpression+=`{{{e${this.expression.charAt(i)}}}}`;
                    }
                }
                try{
                    whereExpr+= Mustache.render(theExpression, exprVars);
                }catch(error){
                    //console.log(`Mustache template error ${JSON.stringify(error,null,'\t')}`);
                }
                
            }else{
                whereExpr += `${conditions.join(' and ')}`;
            }

        }
        return whereExpr;
    }

    @api
    get filterListJson(){
        return JSON.stringify(this.filterList);
    }

    setParentRecordId(event) {
        this.parentRecordId = event.target.value;
    }

    setExpression(event){
        this.expression=event.target.value; 
        console.log(this.soqlQuery);
    }

    runSoql(event) {
        this.isSoqlError=false;
        this.isSoqlVerified=false;
        executeSoql({ soqlQuery: this.soqlQuery })
            .then(data => {
                console.log(JSON.stringify(data));
                this.isSoqlVerified=true;
            }).catch(error => {
                console.log(JSON.stringify(error));
                this.isSoqlVerified=false;
                this.isSoqlError=true;
            });
    }

    handleRowAction(event){
        const action = event.detail.action;
        const rowClicked = event.detail.row;
        switch (action.name) {
            case 'delete':
                this.filterList = this.filterList.filter(row => row.field != rowClicked.field);
                break;
        }
    }

    getExpressionTemplate(){

    }
}
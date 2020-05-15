/* 
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement,api,wire,track } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';


const columns = [
    { label: 'API Name', fieldName: 'apiName' },
    { label: 'Relationship Name', fieldName: 'relationshipName' }
];

export default class SelectChildObject extends LightningElement {

    @api objectApiName;
    @api childObjectApiName;
    @api relationshipName;
    @track columns = columns;

    @track childRelationships;
    @track isLoading = false;


    
    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    objectInfoResponse({error,data}){
        if(data){
            
            if(data.childRelationships){
                this.childRelationships = new Array();
                for(let i=0;i<data.childRelationships.length;i++){
                    let childObject = data.childRelationships[i];
                    this.childRelationships.push({
                        id:childObject.childObjectApiName+'_'+childObject.relationshipName,
                        apiName:childObject.childObjectApiName,
                        relationshipName:childObject.relationshipName
                    });
                }
            }
            
        }
        if(error){
            console.log(JSON.stringify(error,null,4));
        }
        this.isLoading=false;
    }

    get childRelationshipTotal(){
        if(this.childRelationships){
            return this.childRelationships.length;
        }
        return -1;

    }

    get hasChildRelationships(){
        return  this.childRelationships && 
                this.childRelationships.length>0;
    }


    rowSelected(event) {

        const selRow = event.detail.selectedRows[0];
        this.childObjectApiName=selRow.apiName;
        this.relationshipName=selRow.relationshipName;

    }
    
}
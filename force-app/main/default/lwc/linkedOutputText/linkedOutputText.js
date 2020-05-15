/* 
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement,api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'

const NON_HYPERLINK_OBJECTS=["CaseComment"];

export default class LinkedOutputText extends NavigationMixin(LightningElement) {
    @api object;
    @api recordId;
    @api label;
    @api isHeader=false;
    @api baseUrlForRecordDetail;
    @api isExternalServiceData;

    navigateToRecordViewPage() {
        if(NON_HYPERLINK_OBJECTS.includes(this.object)){
            return;
        }else{
            if(!this.isExternalServiceData){
            // View a custom object record.
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: this.recordId,
                        objectApiName: this.object,
                        actionName: 'view'
                    }
                });
            }else{
                window.open(`${this.baseUrlForRecordDetail}/${this.recordId}`,'_blank');
            }

        }
        
    }

}
/* 
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement,api } from 'lwc';
import verifyApexProvider from '@salesforce/apex/VerifyApexProvider.verify';

export default class VerifyApexProvider extends LightningElement {

    @api selectedApexClass;
    @api verified;
    @api verificationResults;
    @api childObjectName;
    @api childRelationshipName;
    @api dateFieldName;
    @api titleFieldName;
    @api fieldsToDisplay;

    connectedCallback() {
        console.log('>>>>>>>selectedApexClass: '+this.selectedApexClass);
        verifyApexProvider({apexClassName:this.selectedApexClass})
            .then(data => {
                this.verified = data.verified;
                this.verificationResults=data.results;
                this.childObjectName=data.objectName;
                this.childRelationshipName=data.relationshipName
                this.dateFieldName=data.dateFieldName;
                this.titleFieldName=data.titleFieldName;
                this.fieldsToDisplay=data.fieldsToDisplay;
            })
            .catch(error => {
                console.log(JSON.stringify(error));
            });
    }
}
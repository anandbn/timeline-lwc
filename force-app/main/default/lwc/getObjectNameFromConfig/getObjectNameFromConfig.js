/* 
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement,api,wire} from 'lwc';
import getObjectApiName from '@salesforce/apex/AddChildObjectToConfigController.getObjectApiName';

export default class GetObjectNameFromConfig extends LightningElement {
    @api recordId;
    @api objectApiName;

    @wire(getObjectApiName,{recordId:'$recordId'})
    initializeObjectApiName({ error, data }) {
        if (data) {
            this.objectApiName = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.objectApiName = undefined;
        }
    }

}
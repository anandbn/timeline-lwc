/* 
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement, track, api, wire } from 'lwc';
import searchForApexClass from '@salesforce/apex/SearchApexClasses.searchForApex';
export default class SelectApexRecordProvider extends LightningElement {
    // Tracked properties  
    @track records;
    @track noRecordsFlag = false;
    @track showoptions = true;
    @track searchString = '';
    @api selectedApexClass;
    
    // Wire method to function, which accepts the Search String, Dynamic SObject, Record Limit, Search Field  
    @wire(searchForApexClass, { searchString: '$searchString' })
    matchingApexClasses({ error, data }) {
        this.noRecordsFlag = 0;
        if (data) {
            this.records = data;
            this.error = undefined;
            this.noRecordsFlag = this.records.length === 0 ? true : false;
        } else if (error) {
            this.error = error;
            this.records = undefined;
        }
    }
    // handle event called lookupselect  
    handlelookupselect(event) {
        this.selectedApexClass = event.detail.Name;
        this.showoptions = false;
    }
    // key change on the text field  
    handleKeyChange(event) {
        this.showoptions = true;
        this.searchString = event.target.value;
    }
}
/* 
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement,api,track } from 'lwc';

export default class TimelineMonth extends LightningElement {

    @api month;
    @api monthAsDuration;
    @api timelineItems;
    @track expanded=true;

    toggleExpanded(){
        this.expanded=!this.expanded;
    }

    get iconName(){
        return this.expanded?"utility:switch":"utility:chevronright";
    }
    get sectionCssClass(){
        return this.expanded?"slds-section slds-is-open":"slds-section";
    }

}
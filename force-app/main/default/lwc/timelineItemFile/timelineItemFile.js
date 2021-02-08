/* 
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { LightningElement,api } from 'lwc';
import Description from '@salesforce/label/c.Description';
import { NavigationMixin } from 'lightning/navigation';

export default class TimelineItemFile extends NavigationMixin(LightningElement) {

    @api title;
    @api documentId;
    @api description;
    @api expanded;
    @api dateValue;
    @api themeInfo;
    @api displayRelativeDates;

    label = {
        Description
    };

    get expandCollapseIcon(){
        return this.expanded?"utility:switch":"utility:chevronright";
    }

    get objectThemeColor() {
        return (this.themeInfo.color && this.themeInfo.color.length>0)?`background-color: #${this.themeInfo.color}`:'';
    }

    showFilePreview(){
        this[NavigationMixin.Navigate]({
            type: 'standard__namedPage',
            attributes: {
                pageName: 'filePreview'
            },
            state : {
                recordIds: this.documentId,
                selectedRecordId:this.documentId
            }
        });
    }
    toggleDetailSection() {
        this.expanded = !this.expanded;
    }
}
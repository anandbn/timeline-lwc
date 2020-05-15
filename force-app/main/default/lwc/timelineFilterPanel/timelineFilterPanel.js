/* 
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement,track,api } from 'lwc';
import Filter from '@salesforce/label/c.Filter';
import Refresh_data from '@salesforce/label/c.Refresh_Data';
import Apply from '@salesforce/label/c.Apply';
import Date_Range from '@salesforce/label/c.Date_Range';
import Select_Objects from '@salesforce/label/c.Select_Objects';
import Filter_Results from '@salesforce/label/c.Filter_Results';
import All_Time from '@salesforce/label/c.All_Time';
import Last_7_days from '@salesforce/label/c.Last_7_days';
import Next_7_days from '@salesforce/label/c.Next_7_days';
import Last_30_days from '@salesforce/label/c.Last_30_days';
import All_Types from '@salesforce/label/c.All_Types';
import Filters from '@salesforce/label/c.Filters';

export default class TimelineFilterPanel extends LightningElement {
    @track showFilter=false;
    @track dateFilterSelection="all_time";
    @api objectFilters;
    @api availableObjects;
    @track expandAll=false;

    label = {
        Filter,Refresh_data,Apply,Date_Range,Select_Objects,Filter_Results,Filters
    }
    get filterStyles() {
        let filterStyle = '';
        if (this.showFilter) {
            filterStyle += 'display:block;';
        } else {
            filterStyle += 'display:none;';
        }
        return filterStyle;
    }
    showHideFilters() {
        this.showFilter = !this.showFilter;
    }



    get expandCollapseIcon(){
        return this.expandAll?'utility:collapse_all':'utility:expand_all';
    }

    get filterAltText(){
        var allFilters = [
            { label:All_Time, value: 'all_time' },
            { label: Last_7_days, value: 'last_7_days' },
            { label: Next_7_days, value: 'next_7_days' },
            { label: Last_30_days, value: 'last_30_days' },
        ];
        var that = this;
        var currentFilterLabel = allFilters.find(function(dtFilter){
            return dtFilter.value === that.dateFilterSelection;
        });
        var selectedObjects="";
        if(!this.objectFilters || this.objectFilters.length == this.availableObjects.length ){
            selectedObjects = All_Types;
        }else{
            selectedObjects = this.objectFilters.join(';');
        }
        return `${Filters}: ${currentFilterLabel.label} • ${selectedObjects}`;
    }
    get dateFilterOptions() {
        return [
            { label:All_Time, value: 'all_time' },
            { label: Last_7_days, value: 'last_7_days' },
            { label: Next_7_days, value: 'next_7_days' },
            { label: Last_30_days, value: 'last_30_days' },
        ];
    }

    get objectFilterOptions() {
        return this.availableObjects;
    }

    handleDateFilterChange(event) {
        this.dateFilterSelection = event.detail.value;
    }

    handleObjectFilterChange(event) {
        this.objectFilters= event.detail.value;
    }

    applyFilters(){
        const filterChangeEvent = new CustomEvent('change', {
            detail: {
                "dateFilter":this.dateFilterSelection,
                "objectFilter":this.objectFilters
            }
        });
        this.dispatchEvent(filterChangeEvent);

    }

    
}
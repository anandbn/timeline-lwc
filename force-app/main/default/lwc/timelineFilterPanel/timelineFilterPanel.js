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

export default class TimelineFilterPanel extends LightningElement {
    @track showFilter=false;
    @track dateFilterSelection="all_time";
    @api objectFilters;
    @api availableObjects;

    label = {
        Filter,Refresh_data,Apply,Date_Range,Select_Objects,Filter_Results
    }
    get filterStyles() {
        let filterStyle = '';
        if (this.showFilter) {
            filterStyle += 'display:block;';
        } else {
            filterStyle += 'display:none;';
        }
        filterStyle += 'position:absolute;top:2.25rem;left:-285px;width:300px;'
        return filterStyle;
    }
    showHideFilters() {
        this.showFilter = !this.showFilter;
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
import { LightningElement,track,api } from 'lwc';
import Filter from '@salesforce/label/c.Filter';
import Refresh_data from '@salesforce/label/c.Refresh_data';
import Apply from '@salesforce/label/c.Apply';

export default class TimelineFilterPanel extends LightningElement {
    @track showFilter=false;
    @track dateFilterSelection="all_time";
    @api objectFilters;
    @api availableObjects;

    label = {
        Filter,Refresh_data,Apply
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
            { label: 'All Time', value: 'all_time' },
            { label: 'Last 7 days', value: 'last_7_days' },
            { label: 'Next 7 days', value: 'next_7_days' },
            { label: 'Last 30 days', value: 'last_30_days' },
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
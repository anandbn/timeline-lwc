import { LightningElement, api } from 'lwc';
export default class ApexClassRowItem extends LightningElement {
    @api record;
    // This method handles the selection of lookup value  
    handleSelect(event) {
        // Event will be triggerred and bubbled to parent and grandparent.  
        // Check the parameters passed.  
        const selectEvent = new CustomEvent('lookupselect', {
            detail: this.record
        });
        // Fire the custom event  
        this.dispatchEvent(selectEvent);
    }
}
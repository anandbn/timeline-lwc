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
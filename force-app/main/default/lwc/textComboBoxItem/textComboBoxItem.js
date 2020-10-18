import { LightningElement, api } from 'lwc';

export default class TextComboBoxItem extends LightningElement {

    @api label;
    @api value;
    @api iconName;
    @api subLabel;
    @api recordId;

    itemSelected() {
        this.dispatchEvent(new CustomEvent('select', {
            detail: {
                label: this.label,
                value: this.value,
                iconName: this.iconName,
                recordId: this.recordId,
            }
        }));
    }

    get hasIcon() {
        return this.iconName != null;
    }

    get hasSubLabel() {
        return this.subLabel != null;
    }
}
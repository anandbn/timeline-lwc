import { LightningElement,api } from 'lwc';

export default class SelectObjectThemeColor extends LightningElement {
    @api selectedColor;

    colorChanged(event){
        //Remove the # in the front
        this.selectedColor=event.target.value.substring(1);
    }
}
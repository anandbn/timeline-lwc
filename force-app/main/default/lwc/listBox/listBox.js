import { LightningElement,api } from 'lwc';
export default class ListBox extends LightningElement {

    @api
    items;

    currentSelectedIndex;

    itemSelected(event){
        this.currentSelectedIndex = event.currentTarget.dataset.index;
        let tmpItems = JSON.parse(JSON.stringify(this.items));
        tmpItems.forEach((item,index) =>{
            if(index == this.currentSelectedIndex){
                item.selected=true;
            }else{
                item.selected=false;
            }
        });
        this.items=tmpItems;
    }

    moveUp(event){
        if(this.currentSelectedIndex && this.currentSelectedIndex>0){
            let tmpItems = JSON.parse(JSON.stringify(this.items));
            //Remove the item from the array;
            tmpItems.splice(this.currentSelectedIndex,1);
            tmpItems.splice(this.currentSelectedIndex-1,0,this.items[this.currentSelectedIndex]);
            this.currentSelectedIndex=this.currentSelectedIndex-1;

            tmpItems.forEach((item,index) =>{
                if(index == this.currentSelectedIndex){
                    item.selected=true;
                }else{
                    item.selected=false;
                }
            })
            this.items=tmpItems;
            const reorderEvent = new CustomEvent('reorder', {
                detail: this.items
            });
            // Fire the custom event  
            this.dispatchEvent(reorderEvent);
        }
    }

    moveDown(event){
        if(this.currentSelectedIndex && this.currentSelectedIndex<this.items.length-1){
            let tmpItems = JSON.parse(JSON.stringify(this.items));
            //Remove the item from the array;
            tmpItems.splice(this.currentSelectedIndex,1);
            this.currentSelectedIndex++;
            tmpItems.splice(this.currentSelectedIndex,0,this.items[this.currentSelectedIndex-1]);
            tmpItems.forEach((item,index) =>{
                if(index == this.currentSelectedIndex){
                    item.selected=true;
                }else{
                    item.selected=false;
                }
            })
            this.items=tmpItems;
            const reorderEvent = new CustomEvent('reorder', {
                detail: this.items
            });
            // Fire the custom event  
            this.dispatchEvent(reorderEvent);
        }
    }
}
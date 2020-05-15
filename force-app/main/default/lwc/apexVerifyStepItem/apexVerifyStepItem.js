/* 
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement,api } from 'lwc';

export default class ApexVerifyStepItem extends LightningElement {
    @api verificationItem;

    get itemIconName(){
        return this.verificationItem.status?'action:check':'action:close';
    }

    get itemIconCssClass(){
        return this.verificationItem.status?'completed':'error';

    }

    get message(){
        return this.verificationItem.message;
    }
}
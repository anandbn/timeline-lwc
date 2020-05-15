 /*
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

@isTest
public class AddChildObjectToConfigControllerTest {
    @testSetup static void setupTestData() {

        Timeline_Configuration__c timelineConf = new Timeline_Configuration__c(Object__c='Account');
        insert timelineConf;
    }

    @isTest static void testGetObjectName(){
        Timeline_Configuration__c conf = [select Id from Timeline_Configuration__c limit 1];
        String objName = AddChildObjectToConfigController.getObjectApiName(conf.Id);
        System.assert(objName.equals('Account'), 'Incorrect or null object name returned');
    }
}
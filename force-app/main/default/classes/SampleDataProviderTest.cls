 /*
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

@IsTest
public with sharing class SampleDataProviderTest {
    @isTest static void  testProviderResponses() {
        Test.setMock(HttpCalloutMock.class, new SampleInvoiceMockImpl());
        SampleApexDataProvider provider = new SampleApexDataProvider();
        System.assert(provider.getFieldsToDisplay() !=null,'Fields to display is null');
        System.assert(provider.getDateField() !=null,'Date field is null');
        System.assert(provider.getFieldsToDisplayWithTypes() !=null,'FieldsToDisplayWithTypes field is null');
        System.assert(provider.getObjectName() !=null,'Objectname field is null');
        System.assert(provider.getRelationshipName() !=null,'Relationship name field is null');
        System.assert(provider.getTitleField() !=null,'Title field is null');
        System.assert(provider.getBaseUrlForRecordDetail() !=null,'BaseUrlForRecordDetail field is null');
        System.assert(provider.getData(null,null) !=null,'Data returned is null');
        System.assert(provider.getRecordIdentifierField()!=null,'RecordIdentifierField is null');
    }
}
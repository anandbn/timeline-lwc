 /*
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

@isTest

public with sharing class RecordTimelineDataProviderTest {
    @testSetup static void setupTestData() {

        Timeline_Configuration__c timelineConf = new Timeline_Configuration__c(Object__c='Account');
        insert timelineConf;
        Timeline_Child_Object__c childConf = new Timeline_Child_Object__c(  Date_Field__c='ActivityDate',
                                                                            Fields_To_Display__c='Subject,Description',
                                                                            Object__c='Task',
                                                                            Relationship_Name__c='Tasks',
                                                                            Icon_Name__c='standard:task',
                                                                            Title_Field__c='Subject',
                                                                            Timeline_Configuration__c=timelineConf.Id);
        insert childConf;

        childConf = new Timeline_Child_Object__c(  Date_Field__c='CreatedDate',
                                                                            Fields_To_Display__c='Description',
                                                                            Object__c='Case',
                                                                            Relationship_Name__c='Cases',
                                                                            Icon_Name__c='standard:case',
                                                                            Title_Field__c='Subject',
                                                                            Timeline_Configuration__c=timelineConf.Id);
        insert childConf;
        Account acct = new Account(Name='My Timeline Test data account');
        insert acct;
        Contact ct = new Contact(FirstName='Test',LastName='Contact',Email='test@timeline.com',AccountId=acct.Id);
        insert ct;
        Task acctTask = new Task(Subject='Test Task',ActivityDate=System.today(),Status='Completed',Description='Test Description',
                                WhatId=acct.Id,WhoId=ct.Id);
        insert acctTask;
        
    }

    @isTest static void testGetTimelineItemData(){
        Account acct = [select Id from Account limit 1];
        Timeline_Configuration__c conf = [select Id from Timeline_Configuration__c limit 1];
        TimelineDataResponse resp = RecordTimelineDataProvider.getTimelineItemData(conf.Id, acct.Id,null);
        System.assert(resp.configuration!=null, 'Timeline configuration is null');
        System.assert(resp.data!=null, 'Timeline data is null');
    }

    @isTest static void testGetTimelineItemDataNullInput(){
        TimelineDataResponse resp = RecordTimelineDataProvider.getTimelineItemData(null,null,null);
        System.assert(resp==null, 'Timeline configuration is not null');
    }

    @isTest static void testGetTimelineItemChildData(){
        Account acct = [select Id from Account limit 1];
        Task acctTask = [select Id from Task limit 1];
        TimelineDataResponse resp = RecordTimelineDataProvider.getTimelineItemChildData('Task', 'Subject,WhatId,AccountId',acctTask.Id);
        System.assert(resp.data!=null, 'Timeline data is null');
    }

    @isTest static void testGetEmailDetails(){
        Task tsk = [select Id from Task limit 1];
        EmailMessage msg = RecordTimelineDataProvider.getEmailDetails(tsk.Id);
        System.assert(msg==null, 'Message is not null');
    }

    @isTest static void testNext7Days(){
        Timeline_Configuration__c conf = [select Id from Timeline_Configuration__c limit 1];

        Account acct = [select Id from Account limit 1];
        Contact ct = [select Id from Contact limit 1];
        Task acctTask = new Task(Subject='Test Task next 2',ActivityDate=System.today().addDays(2),Status='Completed',Description='Test Description',
                                WhatId=acct.Id,WhoId=ct.Id);
        insert acctTask;
        TimelineDataResponse resp = RecordTimelineDataProvider.getTimelineItemData(conf.Id, acct.Id,'next_7_days');
        System.assert(resp.configuration!=null, 'testNext7Days - Timeline configuration is null');
        System.assert(resp.data!=null, 'testNext7Days - Timeline data is null');

    }

    @isTest static void testLast7Days(){
        Timeline_Configuration__c conf = [select Id from Timeline_Configuration__c limit 1];

        Account acct = [select Id from Account limit 1];
        Contact ct = [select Id from Contact limit 1];
        Task acctTask = new Task(Subject='Test Task last 7',ActivityDate=System.today().addDays(-2),Status='Completed',Description='Test Description',
                                WhatId=acct.Id,WhoId=ct.Id);
        insert acctTask;
        TimelineDataResponse resp = RecordTimelineDataProvider.getTimelineItemData(conf.Id, acct.Id,'last_7_days');
        System.assert(resp.configuration!=null, 'testLast7Days - Timeline configuration is null');
        System.assert(resp.data!=null, 'testLast7Days - Timeline data is null');

    }

    @isTest static void testLast30Days(){
        Timeline_Configuration__c conf = [select Id from Timeline_Configuration__c limit 1];

        Account acct = [select Id from Account limit 1];
        Contact ct = [select Id from Contact limit 1];
        Task acctTask = new Task(Subject='Test Task last 30',ActivityDate=System.today().addDays(-10),Status='Completed',Description='Test Description',
                                WhatId=acct.Id,WhoId=ct.Id);
        insert acctTask;
        TimelineDataResponse resp = RecordTimelineDataProvider.getTimelineItemData(conf.Id, acct.Id,'last_30_days');
        System.assert(resp.configuration!=null, 'testLast30Days - Timeline configuration is null');
        System.assert(resp.data!=null, 'testLast30Days - Timeline data is null');

    }

    @isTest static void testLast30DaysWithContact(){
        Timeline_Configuration__c timelineConf = new Timeline_Configuration__c(Object__c='Account');
        insert timelineConf;
        Timeline_Child_Object__c childConf = new Timeline_Child_Object__c(  Date_Field__c='CreatedDate',
                                                                            Fields_To_Display__c='Name,Email',
                                                                            Object__c='Contact',
                                                                            Relationship_Name__c='Contacts',
                                                                            Icon_Name__c='standard:contact',
                                                                            Title_Field__c='Name',
                                                                            Timeline_Configuration__c=timelineConf.Id);
        insert childConf;

        Account acct = [select Id from Account limit 1];
        Contact ct = new Contact(FirstName='Test',LastName='Contact 2',Email='test2@timeline.com',AccountId=acct.Id);
        insert ct;
        TimelineDataResponse resp = RecordTimelineDataProvider.getTimelineItemData(timelineConf.Id, acct.Id,'last_30_days');
        System.assert(resp.configuration!=null, 'testLast30DaysWithContact - Timeline configuration is null');
        System.assert(resp.data!=null, 'testLast30DaysWithContact - Timeline data is null');

    }

    @isTest static void testApexProvider(){
        Timeline_Configuration__c timelineConf = new Timeline_Configuration__c(Object__c='Account');
        insert timelineConf;
        Timeline_Child_Object__c childConf = new Timeline_Child_Object__c(  Date_Field__c='CreatedDate',
                                                                            Fields_To_Display__c='Name,Email',
                                                                            Object__c='Contact',
                                                                            Relationship_Name__c='Contacts',
                                                                            Icon_Name__c='standard:contact',
                                                                            Title_Field__c='Name',
                                                                            Timeline_Configuration__c=timelineConf.Id);
        insert childConf;

        childConf = new Timeline_Child_Object__c(  Date_Field__c='invoiceDate',
                                                                            Fields_To_Display__c='referenceNumber,description,amount',
                                                                            Object__c='Invoice',
                                                                            Relationship_Name__c='Invoices',
                                                                            Icon_Name__c='standard:order',
                                                                            Title_Field__c='referenceNumber',
                                                                            Data_Provider_Type__c='Apex class',
                                                                            Provider_Apex_Classname__c='SampleApexDataProvider',
                                                                            Timeline_Configuration__c=timelineConf.Id);
        insert childConf;

        Test.startTest();
        Account acct = [select Id from Account limit 1];
        Test.setMock(HttpCalloutMock.class, new SampleInvoiceMockImpl());

        TimelineDataResponse resp = RecordTimelineDataProvider.getTimelineItemData(timelineConf.Id, acct.Id,'all_time');
        System.assert(resp.apexConfigData!=null,'Apex data is null');
        TimelineDataResponse.ApexConfigAndData apexConfigAndData= resp.apexConfigData.get('Invoices');
        System.assert(apexConfigAndData!=null,'apexConfigAndData is null');
        System.assert(apexConfigAndData.apexData!=null,'Invoice data is null');
        System.assert(apexConfigAndData.baseUrlForRecordDetail!=null,'baseUrlForRecordDetail is null');
        System.assert(apexConfigAndData.fieldsWithTypes!=null,'fieldsWithTypes is null');
        System.assert(apexConfigAndData.recordIdentifierField!=null,'recordIdentifierField is null');
        Test.stopTest();
    }


    @isTest static void testApexProviderOnly(){
        Timeline_Configuration__c timelineConf = new Timeline_Configuration__c(Object__c='Account');
        insert timelineConf;
        Timeline_Child_Object__c childConf = new Timeline_Child_Object__c(  Date_Field__c='invoiceDate',
                                                                            Fields_To_Display__c='referenceNumber,description,amount',
                                                                            Object__c='Invoice',
                                                                            Relationship_Name__c='Invoices',
                                                                            Icon_Name__c='standard:order',
                                                                            Title_Field__c='referenceNumber',
                                                                            Data_Provider_Type__c='Apex class',
                                                                            Provider_Apex_Classname__c='SampleApexDataProvider',
                                                                            Timeline_Configuration__c=timelineConf.Id);
        insert childConf;

        Test.startTest();
        Account acct = [select Id from Account limit 1];
        Test.setMock(HttpCalloutMock.class, new SampleInvoiceMockImpl());

        TimelineDataResponse resp = RecordTimelineDataProvider.getTimelineItemData(timelineConf.Id, acct.Id,'all_time');
        System.assert(resp.apexConfigData!=null,'Apex data is null');
        TimelineDataResponse.ApexConfigAndData apexConfigAndData= resp.apexConfigData.get('Invoices');
        System.assert(apexConfigAndData!=null,'apexConfigAndData is null');
        System.assert(apexConfigAndData.apexData!=null,'Invoice data is null');
        System.assert(apexConfigAndData.baseUrlForRecordDetail!=null,'baseUrlForRecordDetail is null');
        System.assert(apexConfigAndData.fieldsWithTypes!=null,'fieldsWithTypes is null');
        System.assert(apexConfigAndData.recordIdentifierField!=null,'recordIdentifierField is null');
        Test.stopTest();
    }


}
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
        Account acct = new Account(Name='My Timeline Test data account');
        insert acct;
        Contact ct = new Contact(FirstName='Test',LastName='Contact',Email='test@timeline.com',AccountId=acct.Id);
        insert ct;
        Task acctTask = new Task(Subject='Test Task',ActivityDate=System.today(),Status='Completed',Description='Test Description',
                                WhatId=acct.Id,WhoId=ct.Id);
        insert acctTask;
        /*
        EmailMessage msg = new EmailMessage(Subject='Test Email',TextBody='Text Body');
        insert msg;
        List<EmailMessageRelation> relToInsert = new List<EmailMessageRelation>();
        relToInsert.add(new EmailMessageRelation(EmailMessageId=msg.Id,RelationId=UserInfo.getUserId(),
                                                RelationType='FromAddress')
                    );
        relToInsert.add(new EmailMessageRelation(EmailMessageId=msg.Id,RelationId=ct.Id,
                                                RelationType='FromAddress')
                    );
        insert relToInsert;
        */
    }

    @isTest static void testGetTimelineItemData(){
        Account acct = [select Id from Account limit 1];
        Timeline_Configuration__c conf = [select Id from Timeline_Configuration__c limit 1];
        TimelineDataResponse resp = RecordTimelineDataProvider.getTimelineItemData(conf.Id, acct.Id);
        System.assert(resp.configuration!=null, 'Timeline configuration is null');
    }

    @isTest static void testGetTimelineItemDataNullInput(){
        TimelineDataResponse resp = RecordTimelineDataProvider.getTimelineItemData(null,null);
        System.assert(resp==null, 'Timeline configuration is not null');
    }

    @isTest static void testGetEmailDetails(){
        Task tsk = [select Id from Task limit 1];
        EmailMessage msg = RecordTimelineDataProvider.getEmailDetails(tsk.Id);
        System.assert(msg==null, 'Message is not null');
    }
}
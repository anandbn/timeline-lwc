@IsTest
public with sharing class TimelineDiagnosticControllerTest {

    @testSetup static void setupTestData() {
        Timeline_Configuration__c timelineConf = new Timeline_Configuration__c(Object__c='Account');
        insert timelineConf;
        Timeline_Child_Object__c childConf = new Timeline_Child_Object__c(  Date_Field__c='ActivityDate',
                                                                            Fields_To_Display__c='Subject,Description',
                                                                            Object__c='Task',
                                                                            Relationship_Name__c='Tasks',
                                                                            Icon_Name__c='standard:task',
                                                                            Title_Field__c='Subject',
                                                                            Reference_Field_Name__c='WhatId',
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
    @IsTest static void testGetTimelineConfigurations(){
        List<Timeline_Configuration__c> configList = TimelineDiagnosticController.getTimelineConfigurations();
        System.assertEquals(1,configList.size(),'Incorrect timeline configs returned');
    }


    @IsTest static void testGetChildConfigurations(){
        Timeline_Configuration__c config = [select Id from Timeline_Configuration__c limit 1];
        List<timeline__Timeline_Child_Object__c> configList = TimelineDiagnosticController.getChildConfigurations(config.Id);
        System.assertEquals(1,configList.size(),'Incorrect child configs returned');
    }

    @IsTest static void testDiagnoseChildConfiguration(){
        Account acct = [select Id from Account limit 1];
        Timeline_Configuration__c config = [select Id from Timeline_Configuration__c limit 1];
        List<timeline__Timeline_Child_Object__c> configList = TimelineDiagnosticController.getChildConfigurations(config.Id);
        Timeline_Child_Object__c childConfig = configList[0];
        TimelineDiagnosticController.DiagnosticResponse resp = TimelineDiagnosticController.diagnoseChildConfiguration(acct.Id, childConfig.Id);
        System.assert(resp!=null,'Diagnostic response is null');
        System.assert(resp.records.size()==1,'Diagnostic response incorrect records returned');
        System.assert(resp.soqlQuery!=null && resp.soqlQuery.length()>0,'Diagnostic SOQL incorrect');

    }
}
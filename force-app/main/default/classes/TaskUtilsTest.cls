@IsTest
public with sharing class TaskUtilsTest {

    @testSetup static void setupTestData() {
        Account acct = new Account(Name='My Timeline Test data account');
        insert acct;
        Contact ct = new Contact(FirstName='Test',LastName='Contact',Email='test@timeline.com',AccountId=acct.Id);
        insert ct;
        Task acctTask = new Task(Subject='Test Task',ActivityDate=System.today(),Status='Completed',Description='Test Description',
                                WhatId=acct.Id,WhoId=ct.Id);
        insert acctTask;
        Case acctCase = new Case(Subject='Test Case',Description='Test Description',AccountId=acct.Id);
        insert acctCase;

    }
    @IsTest
    static void testTaskSubjectOptions() {
        Schema.DescribeFieldResult fldDesc = Task.Subject.getDescribe();
        List<Schema.PicklistEntry> subjValues = fldDesc.getPicklistValues();
        System.assertEquals(subjValues.size(),TaskUtils.getTaskSubjectOptions().subjectOptions.size(),'Incorrect subject option returned');
    }
    @IsTest
    static void testObjectName() {
        Account acct = [select Id,Name from Account limit 1];
        System.assertEquals(acct.Name, TaskUtils.getObjectName('Account', acct.Id, 'Name'),'Incorrect name returned');
        System.assertEquals(null, TaskUtils.getObjectName('Account', 'RecordID', 'Name'),'Null name not returned');
    }
    @IsTest
    static void testSearchInContact(){
       Id [] fixedSearchResults= new Id[1];
       Contact ct = [select Id from Contact limit 1];
       fixedSearchResults[0] = ct.Id;
       Test.setFixedSearchResults(fixedSearchResults);
       List<TaskUtils.SearchResult> searchResults = TaskUtils.searchInObject('Contact', 'Blah', null);
    }

    @IsTest
    static void testSearchInCase(){
       Id [] fixedSearchResults= new Id[1];
       Case theCase = [select Id from Case limit 1];
       fixedSearchResults[0] = theCase.Id;
       Test.setFixedSearchResults(fixedSearchResults);
       List<TaskUtils.SearchResult> searchResults = TaskUtils.searchInObject('Case', 'Blah', null);
    }

    @IsTest
    static void testSearchInAccount(){
       Id [] fixedSearchResults= new Id[1];
       Account acct = [select Id from Account limit 1];
       fixedSearchResults[0] = acct.Id;
       Test.setFixedSearchResults(fixedSearchResults);
       List<TaskUtils.SearchResult> searchResults = TaskUtils.searchInObject('Case', 'Blah', null);
    }

    @IsTest
    static void testSaveTask(){
        Account acct = [select Id from Account limit 1];
        Contact ct = [select Id from Contact limit 1];
    
        TaskUtils.saveTask('Test Subhect',System.today(),acct.Id,ct.Id,'Completed','Test comments','Task');
        List<Task> tasks = [select Id from Task where WhatId=:acct.Id];
        System.assertEquals(2,tasks.size(),'Incorrect number of tasks returned');
    }

    @IsTest
    static void testSaveEvent(){
        Account acct = [select Id from Account limit 1];
        Contact ct = [select Id from Contact limit 1];
    
        TaskUtils.saveEvent('Test Event',System.now(),System.now(),acct.Id,ct.Id,false,'ApexTestWorld');
        List<Event> events = [select Id from Event where WhatId=:acct.Id];
        System.assertEquals(1,events.size(),'Incorrect number of events returned');
    }
}
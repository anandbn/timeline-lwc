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
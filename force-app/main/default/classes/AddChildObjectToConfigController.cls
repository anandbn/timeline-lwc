public with sharing class AddChildObjectToConfigController {
    
    @AuraEnabled(cacheable=true)
    public static string getObjectApiName(Id recordId){
        timeline__Timeline_Configuration__c conf = [select timeline__Object__c 
                                                    from timeline__Timeline_Configuration__c
                                                    where Id=:recordId ];
        return conf.timeline__Object__c;
    }
    

}
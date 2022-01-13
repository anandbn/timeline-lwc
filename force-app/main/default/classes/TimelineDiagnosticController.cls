public with sharing class TimelineDiagnosticController {
    @AuraEnabled(cacheable=true)
    public static List<Timeline_Configuration__c> getTimelineConfigurations(){
        return [select Id,Name,Object__c from Timeline_Configuration__c];
    }

    @AuraEnabled(cacheable=true)
    public static List<timeline__Timeline_Child_Object__c> getChildConfigurations(String configId){
        return [
            SELECT timeline__Date_Field__c,timeline__Fields_to_Display__c,timeline__Icon_Image_Url__c,
                timeline__Icon_Name__c,Id,Name,timeline__Object_Color__c,timeline__Object__c,timeline__Relationship_Name__c,
                timeline__Title_Field__c,timeline__LWC_Ui_Api_Not_Supported__c,timeline__Data_Provider_Type__c,
                timeline__Provider_Apex_Classname__c,timeline__Where_Clause__c,timeline__Overdue_Field__c,
                timeline__Include_All_Records__c
            FROM timeline__Timeline_Child_Object__c
            where Timeline_Configuration__c = :configId];

    }

    @AuraEnabled(cacheable=false)
    public static DiagnosticResponse diagnoseChildConfiguration(Id recordId,Id childConfigId){
        timeline__Timeline_Child_Object__c childConfig = 
                                                    [SELECT timeline__Date_Field__c,timeline__Fields_to_Display__c,timeline__Icon_Image_Url__c,
                                                            timeline__Icon_Name__c,Id,Name,timeline__Object_Color__c,timeline__Object__c,timeline__Relationship_Name__c,
                                                            timeline__Title_Field__c,timeline__LWC_Ui_Api_Not_Supported__c,timeline__Data_Provider_Type__c,
                                                            timeline__Provider_Apex_Classname__c,timeline__Reference_Field_Name__c,timeline__Where_Clause__c,
                                                            timeline__Overdue_Field__c,timeline__Include_All_Records__c
                                                    FROM timeline__Timeline_Child_Object__c
                                                    where Id=:childConfigId];
        String soql = TimelineSOQLUtils.getSoqlForChildConfig(childConfig, recordId, null,true,new List<String>());                                            
        DiagnosticResponse response = new DiagnosticResponse();
        response.soqlQuery=soql;
        try{
            response.records=Database.query(soql);
        }catch(Exception ex){
        }
        return response;
    }


    public class DiagnosticResponse{
        @AuraEnabled
        public String soqlQuery {get; set;}

        @AuraEnabled
        public List<SObject> records {get; set;}
    }
}
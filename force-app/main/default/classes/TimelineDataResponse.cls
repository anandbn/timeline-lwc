public with sharing class TimelineDataResponse {
    @AuraEnabled
    public Timeline_Configuration__c configuration {get; set;}

    @AuraEnabled
    public SObject data {get; set;}

    @AuraEnabled
    public Map<String,List<Object>> otherData {get; set;}

    @AuraEnabled 
    public Map<String,TimelineDataResponse.ApexConfigAndData> apexConfigData {get; set;}

    @AuraEnabled
    public List<ApexDescribeUtils.FieldData> fieldMetadata {get; set;}

    @AuraEnabled
    public List<String> logs {get; set;}

    @AuraEnabled
    public Map<String,String> objectLabels {get; set;}

    public TimelineDataResponse(Timeline_Configuration__c conf,Sobject theRecord, Map<String,TimelineDataResponse.ApexConfigAndData> apexData) {
        this.configuration=conf;
        this.data=theRecord;
        this.apexConfigData=apexData;
        this.logs =new List<String>();
        this.otherData=new Map<String,List<Object>>();
    }

    public void addOtherData(String relatedName,List<Object> records){
        this.otherData.put(relatedName,records);
    }

    public class ApexConfigAndData{
        @AuraEnabled
        public List<Object> apexData {get; set;}
        @AuraEnabled
        public String recordIdentifierField {get; set;}
        @AuraEnabled
        public String baseUrlForRecordDetail {get; set;}
        @AuraEnabled
        public List<TimelineFieldType> fieldsWithTypes {get; set;}
        @AuraEnabled
        public Boolean isSalesforceObject {get; set;}
        @AuraEnabled
        public Boolean isUiApiNotSupported {get; set;}

    }
}
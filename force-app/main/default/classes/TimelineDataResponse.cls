public with sharing class TimelineDataResponse {
    @AuraEnabled
    public Timeline_Configuration__c configuration {get; set;}

    @AuraEnabled
    public SObject data {get; set;}

    @AuraEnabled
    public List<ApexDescribeUtils.FieldData> fieldMetadata {get; set;}

    public TimelineDataResponse(Timeline_Configuration__c conf,Sobject theRecord) {
        this.configuration=conf;
        this.data=theRecord;
    }
}
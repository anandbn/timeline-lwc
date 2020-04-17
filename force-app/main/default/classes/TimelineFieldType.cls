public with sharing class TimelineFieldType {
    @AuraEnabled
    public String fieldLabel {get; set;}
    @AuraEnabled
    public String apiName {get; set;}
    @AuraEnabled
    public String dataType {get; set;}

    public TimelineFieldType(String fldLabel,String apiName,Schema.DisplayType fldType) {
        this.fieldLabel=fldLabel;
        this.apiName=apiName;
        this.dataType=fldType.name();
    }
}
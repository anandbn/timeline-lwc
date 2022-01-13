public class ObjectNote {
    @AuraEnabled
    public String textPreview { get; set;}
    @AuraEnabled
    public String body { get; set;}
    @AuraEnabled
    public String createdByName {get; set;}
    @AuraEnabled
    public String createdById {get; set;}
    @AuraEnabled
    public Datetime createdDate {get; set;}
    @AuraEnabled
    public Id recordId;
    @AuraEnabled
    public Id contentDocId;

    public ObjectNote(String txt,String body,String createdName, Id createdId,Datetime createdDate,Id recordId,Id contentDocId ) {
        this.textPreview=txt;
        this.body=body;
        this.createdByName=createdName;
        this.createdById=createdId;
        this.createdDate=createdDate;
        this.recordId=recordId;
        this.contentDocId=contentDocId;
    }
}

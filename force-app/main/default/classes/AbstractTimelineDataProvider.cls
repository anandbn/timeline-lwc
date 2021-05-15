global virtual class AbstractTimelineDataProvider implements ITimelineDataProvider{
    global virtual String getObjectName(){ return null;}
    global virtual String getRelationshipName(){ return null;}
    global virtual String getTitleField(){ return null;}
    global virtual String getDateField(){ return null;}
    global virtual String getBaseUrlForRecordDetail(){ return null;}
    global virtual String getRecordIdentifierField(){ return null;}

    global virtual Boolean isSalesforceObject(){ return false;}
    global virtual Boolean isUiApiNotSupported(){ return false;}
    global virtual List<String> getFieldsToDisplay(){ return null;}
    global virtual List<TimelineFieldType> getFieldsToDisplayWithTypes(){ return null;}
    global virtual List<Object> getData(Id recordId,String dateFilter){ return null;}

}
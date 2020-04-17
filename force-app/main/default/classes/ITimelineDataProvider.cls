public interface ITimelineDataProvider {
    
    String getObjectName();
    String getRelationshipName();
    String getTitleField();
    String getDateField();
    String getBaseUrlForRecordDetail();
    String getRecordIdentifierField();
    List<String> getFieldsToDisplay();
    List<TimelineFieldType> getFieldsToDisplayWithTypes();
    List<Object> getData(Id recordId,String dateFilter);

}
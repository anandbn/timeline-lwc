/*
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
public with sharing class RecordTimelineDataProvider {
    @AuraEnabled(cacheable=false)
    public static TimelineDataResponse getTimelineItemData(String confIdOrName,String recordId,String dateFilter) {
        List<String> log = new List<String>();
        if(dateFilter == null){
            dateFilter='all_time';
        }
        System.debug('>>>>>>>>>>> confIdOrName='+confIdOrName+', record Id:'+recordId+',dateFilter:'+dateFilter);
        log.add('confIdOrName='+confIdOrName+', record Id:'+recordId+',dateFilter:'+dateFilter);
        if(recordId !=null && confIdOrName!=null){
            if(areObjectAndFieldsAccessible()){
                Timeline_Configuration__c conf  = [ select Id,timeline__Object__c,timeline__Display_Relative_Dates__c,
                                                    (SELECT timeline__Date_Field__c,timeline__Fields_to_Display__c,timeline__Icon_Image_Url__c,
                                                            timeline__Icon_Name__c,Id,Name,timeline__Object_Color__c,timeline__Object__c,timeline__Relationship_Name__c,
                                                            timeline__Title_Field__c,timeline__LWC_Ui_Api_Not_Supported__c,timeline__Data_Provider_Type__c,
                                                            timeline__Provider_Apex_Classname__c,timeline__Reference_Field_Name__c,
                                                            timeline__Where_Clause__c,timeline__Display_Object_Name__c,timeline__Title_link_Navigate_to__c,
                                                            timeline__Overdue_Field__c,timeline__Include_All_Records__c, timeline__Sub_Title_Fields__c
                                                    FROM timeline__Timeline_Child_Objects__r)
                                                    from timeline__Timeline_Configuration__c
                                                    where (Id=:confIdOrName or Name=:confIdOrName)
                                                ];
                if(!conf.timeline__Timeline_Child_Objects__r.isEmpty()){
                    //String soqlToExec = getSOQLForTimeline(conf, recordId,dateFilter);
                    String soqlToExec = TimelineSOQLUtils.getSOQLForTimeline(conf, recordId,dateFilter,log);
                    System.debug('>>>>>>>>> '+soqlToExec);
                    log.add(soqlToExec);
                    SObject theObject;
                    if(soqlToExec !=null){
                        List<SObject> result = Database.query(soqlToExec);
                        log.add('After SOQL query: result = '+JSON.serialize(result));
                        theObject= result[0];
                    }
                    Map<String,TimelineDataResponse.ApexConfigAndData> apexData = getDataFromApexProviders(conf, recordId, datefilter);
                    TimelineDataResponse resp = new TimelineDataResponse(conf,theObject,apexData);

                    List<ObjectNote> relatedNotes = getNotes(conf,recordId,dateFilter,log);
                    if(relatedNotes !=null){
                        log.add('Related Notes# = '+relatedNotes.size());
                        resp.addOtherData('ContentDocumentLink',relatedNotes);
                    }
                    resp.objectLabels = getChildObjectLabels(conf);
                    resp.logs=log;
                    return resp;
                }
                log.add('Child Objects are empty');
            }
            log.add('Fields are not accessible');
            TimelineDataResponse resp = new TimelineDataResponse();
            resp.logs=log;
            return resp;
        }else{
            log.add('ConfId and/or record Id is null');
            TimelineDataResponse resp = new TimelineDataResponse();
            resp.logs=log;
            return resp;
        }

    }

    private static Boolean areObjectAndFieldsAccessible(){
        return (Timeline_Configuration__c.sObjectType.getDescribe().isAccessible() &&
                Timeline_Child_Object__c.sObjectType.getDescribe().isAccessible() &&
                Schema.sObjectType.Timeline_Configuration__c.fields.Object__c.isAccessible() &&
                Schema.SObjectType.Timeline_Configuration__c.fields.Display_Relative_Dates__c.isAccessible() &&  
                Schema.sObjectType.Timeline_Child_Object__c.fields.Date_Field__c.isAccessible() &&
                Schema.sObjectType.Timeline_Child_Object__c.fields.Fields_to_Display__c.isAccessible() &&
                Schema.sObjectType.Timeline_Child_Object__c.fields.Icon_Image_Url__c.isAccessible() &&
                Schema.sObjectType.Timeline_Child_Object__c.fields.Icon_Name__c.isAccessible() &&
                Schema.sObjectType.Timeline_Child_Object__c.fields.Object_Color__c.isAccessible() &&
                Schema.sObjectType.Timeline_Child_Object__c.fields.Object__c.isAccessible() &&
                Schema.sObjectType.Timeline_Child_Object__c.fields.Relationship_Name__c.isAccessible() &&
                Schema.sObjectType.Timeline_Child_Object__c.fields.Title_Field__c.isAccessible() &&
                Schema.SObjectType.Timeline_Child_Object__c.fields.Data_Provider_Type__c.isAccessible() &&
                Schema.SObjectType.Timeline_Child_Object__c.fields.LWC_Ui_Api_Not_Supported__c.isAccessible() &&
                Schema.SObjectType.Timeline_Child_Object__c.fields.Provider_Apex_Classname__c.isAccessible() && 
                Schema.SObjectType.Timeline_Child_Object__c.fields.Title_link_Navigate_to__c.isAccessible() &&
                Schema.SObjectType.Timeline_Child_Object__c.fields.Overdue_Field__c.isAccessible() &&
                Schema.SObjectType.Timeline_Child_Object__c.fields.Include_All_Records__c.isAccessible() && 
                Schema.SObjectType.Timeline_Child_Object__c.fields.Sub_Title_Fields__c.isAccessible());
    }


    @AuraEnabled(cacheable=true)
    public static EMailMessage getEmailDetails(String taskId) {
        List<EmailMessage> msgs = [ select Id,ActivityId,Subject,FromName,FromAddress,ToAddress,CcAddress,TextBody,
                                          (select RelationId,Relation.Name,RelationObjectType,RelationType
                                          from EmailMessageRelations
                                          where RelationType in('FromAddress','ToAddress')
                                          order by RelationType asc)
                                    from EmailMessage
                                    where ActivityId=:taskId];
        if(!msgs.isEmpty()){
            return msgs[0];
        }
        return null;

    }


    @AuraEnabled(cacheable=true)
    public static TimelineDataResponse getTimelineItemChildData(String objectApiName,String fieldsToExtract,String recordId) {
        //Get all the fields so that we can get labels and type
        List<String> fieldsToQuery = fieldsToExtract.split(',');
        List<String> newFieldsToQuery = new List<String>();

        List<ApexDescribeUtils.FieldData> retFieldMetaData = ApexDescribeUtils.getFieldsForObject(objectApiName,fieldsToQuery);
        for(ApexDescribeUtils.FieldData fld:retFieldMetaData){
            System.debug('>>>>>> getTimelineItemChildData: fld '+fld);
            if(fld.isNamePointing){
                System.debug('>>>>>> getTimelineItemChildData: isNamePointing = true');
                newFieldsToQuery.add(fld.apiName);
                newFieldsToQuery.add(fld.relationshipName+'.Name');
            }else if(fld.dataType.equalsIgnoreCase('REFERENCE')){
                newFieldsToQuery.add(fld.apiName);
                System.debug('>>>>>> getTimelineItemChildData: REFERENCE field ');
                for(ApexDescribeUtils.FieldData relFldMeta : ApexDescribeUtils.getFieldsForObject(fld.referenceTo)){
                    if(relFldMeta.isNameField){
                        System.debug('>>>>>> getTimelineItemChildData: relFldMeta.apiName ='+relFldMeta.apiName);
                        fld.referenceToApiName=relFldMeta.apiName;
                        fld.fieldLabel=relFldMeta.fieldLabel;
                        newFieldsToQuery.add(fld.relationshipName+'.'+relFldMeta.apiName);
                        break;
                    }
                }
            }else if(fld.dataType.equalsIgnoreCase('PICKLIST') || fld.dataType.equalsIgnoreCase('MULTIPICKLIST') ){
                //Add the tolabel() for picklists so that it returns translated values
                newFieldsToQuery.add('tolabel('+fld.apiName+')');
            }else{
                newFieldsToQuery.add(fld.apiName);
            }
        }
        //get the data from the record
        String soqlStmt ='';
        if(objectApiName !='ActivityHistory'){
            soqlStmt ='select Id,'+String.join(newFieldsToQuery,',')+' from '+objectApiName+' where Id=:recordId';
        }else{
            soqlStmt ='select Id,'+String.join(newFieldsToQuery,',')+' from Task where Id=:recordId ALL ROWS';

        }
         
        System.debug('>>>>>> getTimelineItemChildData: soqlStmt = '+soqlStmt);
        List<SObject> result = Database.query(soqlStmt);
        if(!result.isEmpty()){
            TimelineDataResponse response = new TimelineDataResponse(null,result[0],null);
            response.fieldMetadata=retFieldMetaData;
            return response;
        }else{
            return null;
        }
    }

    private static List<ObjectNote> getNotes(timeline__Timeline_Configuration__c conf,String linkedEntityId,String datefilter,List<String> log){
        List<ObjectNote> notes;
        for(timeline__Timeline_Child_Object__c childObjConf: conf.timeline__Timeline_Child_Objects__r){
            if(childObjConf.timeline__Object__c == 'ContentDocumentLink'){
                notes = new List<ObjectNote>();
                List<Id> docIds = new List<Id>();
                for(ContentDocumentLink attachNote:[select Id,ContentDocumentId from ContentDocumentLink where LinkedEntityId=:linkedEntityId]){
                    docIds.add(attachNote.ContentDocumentId);

                }


                String soqlToExecute = 'SELECT Id,Content,CreatedDate,TextPreview,Title,CreatedBy.Name,FileType FROM ContentNote where Id in :docIds ';
                String dateFilterStr=null;
                if(dateFilter!=null){
                    System.debug('Notes Date filter='+datefilter);
                    switch on dateFilter{
                        when 'last_7_days'{
                            System.debug('Date filter= LAST_7_DAYS');
                            dateFilterStr='LAST_N_DAYS:7';
                        }
                        when 'last_30_days'{
                            System.debug('Date filter= LAST_30_DAYS');
                            dateFilterStr='LAST_N_DAYS:30';
                        }
                        when 'next_7_days'{
                            System.debug('Date filter= NEXT_7_DAYS');
                            dateFilterStr='NEXT_N_DAYS:7';
                        }
                    }
                    if(dateFilterStr != null){
                        soqlToExecute += ' and CreatedDate='+dateFilterStr;
                    }
                    System.debug('Notes soqlToExecute = '+soqlToExecute);
                }
                log.add('Notes SOQL:'+ soqlToExecute);
                for(ContentNote noteDetail : Database.query(soqlToExecute)){
                    notes.add(new ObjectNote(   noteDetail.TextPreview,noteDetail.Content.toString(),
                                                noteDetail.CreatedBy.Name,noteDetail.CreatedBy.Id, noteDetail.CreatedDate,
                                                noteDetail.Id,
                                                noteDetail.Id
                                            )
                            );
                }
                break;
            }
        }
        return notes;
        
    }
    private static Map<String,TimelineDataResponse.ApexConfigAndData> getDataFromApexProviders(timeline__Timeline_Configuration__c conf,String recordId,String datefilter){
        Map<String,TimelineDataResponse.ApexConfigAndData> apexData = new Map<String,TimelineDataResponse.ApexConfigAndData>();
        for(timeline__Timeline_Child_Object__c childObjConf: conf.timeline__Timeline_Child_Objects__r){
            if(childObjConf.timeline__Data_Provider_Type__c == 'Apex class'){
                Type providerClass = Type.forName(childObjConf.timeline__Provider_Apex_Classname__c);
                AbstractTimelineDataProvider provider = (AbstractTimelineDataProvider)providerClass.newInstance();
                TimelineDataResponse.ApexConfigAndData apexResp = new TimelineDataResponse.ApexConfigAndData();
                apexResp.apexData=provider.getData(recordId, dateFilter);
                apexResp.recordIdentifierField=provider.getRecordIdentifierField();
                apexResp.baseUrlForRecordDetail=provider.getBaseUrlForRecordDetail();
                apexResp.fieldsWithTypes=provider.getFieldsToDisplayWithTypes();
                apexResp.isSalesforceObject=provider.isSalesforceObject();
                apexResp.isUiApiNotSupported=provider.isUiApiNotSupported();
                apexData.put(childObjConf.timeline__Relationship_Name__c,apexResp);
            }
        }
        return apexData;
    }

    private static Map<String,String> getChildObjectLabels(Timeline_Configuration__c conf){
        List<String> childObjects = new List<String>();
        for(timeline__Timeline_Child_Object__c childObjConf: conf.timeline__Timeline_Child_Objects__r){
            if(childObjConf.timeline__Data_Provider_Type__c ==null || childObjConf.timeline__Data_Provider_Type__c != 'Apex class'){
                childObjects.add(childObjConf.timeline__Object__c);
            }
        }
        
        Map<String,String> childObjLabels = new Map<String,String>();
        for(Schema.DescribeSObjectResult childObjDesc: Schema.describeSObjects(childObjects)){
            childObjLabels.put(childObjDesc.getName(),childObjDesc.getLabel());

        }
        return childObjLabels;
    }
}
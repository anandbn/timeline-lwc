 /*
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

public with sharing class RecordTimelineDataProvider {
    @AuraEnabled(cacheable=false)
    public static TimelineDataResponse getTimelineItemData(String confIdOrName,String recordId,String dateFilter) {
        if(dateFilter == null){
            dateFilter='all_time';
        }
        System.debug('>>>>>>>>>>> confIdOrName='+confIdOrName+', record Id:'+recordId+',dateFilter:'+dateFilter);
        if(recordId !=null && confIdOrName!=null){
            if(areObjectAndFieldsAccessible()){
                Timeline_Configuration__c conf  = [ select Id,timeline__Object__c,
                                                    (SELECT timeline__Date_Field__c,timeline__Fields_to_Display__c,timeline__Icon_Image_Url__c,
                                                            timeline__Icon_Name__c,Id,Name,timeline__Object_Color__c,timeline__Object__c,timeline__Relationship_Name__c,
                                                            timeline__Title_Field__c,timeline__LWC_Ui_Api_Not_Supported__c,timeline__Data_Provider_Type__c,
                                                            timeline__Provider_Apex_Classname__c
                                                    FROM timeline__Timeline_Child_Objects__r)
                                                    from timeline__Timeline_Configuration__c
                                                    where (Id=:confIdOrName or Name=:confIdOrName)
                                                ];
                if(!conf.timeline__Timeline_Child_Objects__r.isEmpty()){
                    String soqlToExec = getSOQLForTimeline(conf, recordId,dateFilter);
                    System.debug('>>>>>>>>> '+soqlToExec);
                    SObject theObject;
                    if(soqlToExec !=null){
                        List<SObject> result = Database.query(soqlToExec);
                        theObject= result[0];
                    }
                    Map<String,TimelineDataResponse.ApexConfigAndData> apexData = getDataFromApexProviders(conf, recordId, datefilter);
                    
                    return new TimelineDataResponse(conf,theObject,apexData);
                }
            }
            return null;
        }else{
            return null;
        }

    }

    private static Boolean areObjectAndFieldsAccessible(){
        return (Timeline_Configuration__c.sObjectType.getDescribe().isAccessible() &&
                Timeline_Child_Object__c.sObjectType.getDescribe().isAccessible() &&
                Schema.sObjectType.Timeline_Configuration__c.fields.Object__c.isAccessible() && 
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
                Schema.SObjectType.Timeline_Child_Object__c.fields.timeline__Provider_Apex_Classname__c.isAccessible()
        );
    }

    @AuraEnabled(cacheable=true)
    public static EMailMessage getEmailDetails(String taskId) {
        List<EmailMessage> msgs = [ select Id,Subject,FromName,FromAddress,ToAddress,TextBody,
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
        List<ApexDescribeUtils.FieldData> retFieldMetaData = ApexDescribeUtils.getFieldsForObject(objectApiName,fieldsToQuery);
        for(ApexDescribeUtils.FieldData fld:retFieldMetaData){
            System.debug('>>>>>> getTimelineItemChildData: fld '+fld);
            if(fld.isNamePointing){
                System.debug('>>>>>> getTimelineItemChildData: isNamePointing = true');
                fieldsToQuery.add(fld.relationshipName+'.Name');
            }else if(fld.dataType.equalsIgnoreCase('REFERENCE')){
                System.debug('>>>>>> getTimelineItemChildData: REFERENCE field ');
                for(ApexDescribeUtils.FieldData relFldMeta : ApexDescribeUtils.getFieldsForObject(fld.referenceTo)){
                    if(relFldMeta.isNameField){
                        System.debug('>>>>>> getTimelineItemChildData: relFldMeta.apiName ='+relFldMeta.apiName);
                        fld.referenceToApiName=relFldMeta.apiName;
                        fld.fieldLabel=relFldMeta.fieldLabel;
                        fieldsToQuery.add(fld.relationshipName+'.'+relFldMeta.apiName);
                        break;
                    }
                }
            }
        }
        //get the data from the record
        String soqlStmt = 'select Id,'+String.join(fieldsToQuery,',')+' from '+objectApiName+' where Id=:recordId';
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

    private static Map<String,TimelineDataResponse.ApexConfigAndData> getDataFromApexProviders(timeline__Timeline_Configuration__c conf,String recordId,String datefilter){
        Map<String,TimelineDataResponse.ApexConfigAndData> apexData = new Map<String,TimelineDataResponse.ApexConfigAndData>();
        for(timeline__Timeline_Child_Object__c childObjConf: conf.timeline__Timeline_Child_Objects__r){
            if(childObjConf.timeline__Data_Provider_Type__c == 'Apex class'){
                Type providerClass = Type.forName(childObjConf.timeline__Provider_Apex_Classname__c);
                ITimelineDataProvider provider = (ITimelineDataProvider)providerClass.newInstance();
                TimelineDataResponse.ApexConfigAndData apexResp = new TimelineDataResponse.ApexConfigAndData();
                apexResp.apexData=provider.getData(recordId, dateFilter);
                apexResp.recordIdentifierField=provider.getRecordIdentifierField();
                apexResp.baseUrlForRecordDetail=provider.getBaseUrlForRecordDetail();
                apexResp.fieldsWithTypes=provider.getFieldsToDisplayWithTypes();
                apexData.put(childObjConf.timeline__Relationship_Name__c,apexResp);
            }
        }
        return apexData;
    }
    private static String getSOQLForTimeline(timeline__Timeline_Configuration__c conf,String recordId,String dateFilter){
        String soqlStmt = 'select Id,';
        List<String> childSoqls = new List<String>();
        for(timeline__Timeline_Child_Object__c childObjConf: conf.timeline__Timeline_Child_Objects__r){
            if(childObjConf.timeline__Data_Provider_Type__c ==null || childObjConf.timeline__Data_Provider_Type__c != 'Apex class'){
                childObjConf.timeline__Data_Provider_Type__c='Related Record';
                String childSoql = '(select ';
                List<String> fieldsToQuery = childObjConf.timeline__Fields_to_Display__c.split(',');
                fieldsToQuery.add('Id');
    
                if(!childObjConf.timeline__Object__c.endsWith('__x') && !fieldsToQuery.contains('CreatedDate')){
                    fieldsToQuery.add('CreatedDate');
                }
    
                if(childObjConf.Object__c.equalsIgnoreCase('Task')){
                    if(!fieldsToQuery.contains('OwnerId')) fieldsToQuery.add('OwnerId');
                    if(!fieldsToQuery.contains('WhoId')) fieldsToQuery.add('WhoId');
                    if(!fieldsToQuery.contains('TaskSubtype')) fieldsToQuery.add('TaskSubtype');
                    fieldsToQuery.add('Owner.Name');
                    fieldsToQuery.add('Who.Name');
                }
                if(childObjConf.timeline__Date_Field__c !=null && !fieldsToQuery.contains(childObjConf.timeline__Date_Field__c)){
                    fieldsToQuery.add(childObjConf.timeline__Date_Field__c);
                }
                if(childObjConf.Title_Field__c !=null && !fieldsToQuery.contains(childObjConf.Title_Field__c)){
                    fieldsToQuery.add(childObjConf.Title_Field__c);
                }
                childSoql += String.join(fieldsToQuery,',');
                childSoql +=' from '+childObjConf.timeline__Relationship_Name__c;
                String dateFilterStr;
                if(dateFilter!=null){
                    System.debug('Date filter= LAST_7_DAYS');
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
                }
                if(childObjConf.timeline__Date_Field__c !=null){
                    childSoql +=' where ' +childObjConf.timeline__Date_Field__c+ ' !=null';
                    if(dateFilterStr !=null){
                        childSoql +=' and '+childObjConf.timeline__Date_Field__c+'='+dateFilterStr;
                    }
                }else if(!childObjConf.timeline__Object__c.endsWith('__x')){
                    if(dateFilterStr !=null){
                        childSoql +=' where CreatedDate='+dateFilterStr;
                    }
                }
                childSoql +=')';
                childSoqls.add(childSoql);
    
            }
        }
        if(!childSoqls.isEmpty()){
            soqlStmt += String.join(childSoqls,',');
            soqlStmt += ' from '+conf.timeline__Object__c;
            soqlStmt += ' where Id=\''+String.escapeSingleQuotes(recordId)+'\'';
            return soqlStmt;
        }else{
            return null;
        }
    }
}
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
                Timeline_Configuration__c conf  = [ select Id,timeline__Object__c,
                                                    (SELECT timeline__Date_Field__c,timeline__Fields_to_Display__c,timeline__Icon_Image_Url__c,
                                                            timeline__Icon_Name__c,Id,Name,timeline__Object_Color__c,timeline__Object__c,timeline__Relationship_Name__c,
                                                            timeline__Title_Field__c,timeline__LWC_Ui_Api_Not_Supported__c,timeline__Data_Provider_Type__c,
                                                            timeline__Provider_Apex_Classname__c,timeline__Reference_Field_Name__c,
                                                            timeline__Where_Clause__c
                                                    FROM timeline__Timeline_Child_Objects__r)
                                                    from timeline__Timeline_Configuration__c
                                                    where (Id=:confIdOrName or Name=:confIdOrName)
                                                ];
                if(!conf.timeline__Timeline_Child_Objects__r.isEmpty()){
                    //String soqlToExec = getSOQLForTimeline(conf, recordId,dateFilter);
                    String soqlToExec = TimelineSOQLUtils.getSOQLForTimeline(conf, recordId,dateFilter);
                    System.debug('>>>>>>>>> '+soqlToExec);
                    log.add(soqlToExec);
                    SObject theObject;
                    if(soqlToExec !=null){
                        List<SObject> result = Database.query(soqlToExec);
                        log.add('After SOQL query: result = '+result);
                        theObject= result[0];
                    }
                    Map<String,TimelineDataResponse.ApexConfigAndData> apexData = getDataFromApexProviders(conf, recordId, datefilter);
                    TimelineDataResponse resp = new TimelineDataResponse(conf,theObject,apexData);
                    resp.logs=log;
                    return resp;
                }
                log.add('Child Objects are empty');
            }
            log.add('Fields are not accessible');
            return null;
        }else{
            log.add('ConfId and/or record Id is null');
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
        String soqlStmt = 'select Id,'+String.join(newFieldsToQuery,',')+' from '+objectApiName+' where Id=:recordId';
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
}
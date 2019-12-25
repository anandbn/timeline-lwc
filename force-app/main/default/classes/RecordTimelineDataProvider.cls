public with sharing class RecordTimelineDataProvider {
    @AuraEnabled(cacheable=true)
    public static TimelineDataResponse getTimelineItemData(String confId,String recordId) {
        System.debug('>>>>>>>>>>> confId='+confId+', record Id:'+recordId);
        if(recordId !=null && confId!=null){
            if(areObjectAndFieldsAccessible()){
                Timeline_Configuration__c conf  = [ select Id,Object__c,
                                                    (SELECT Date_Field__c,Fields_to_Display__c,Icon_Image_Url__c,
                                                            Icon_Name__c,Id,Name,Object_Color__c,Object__c,Relationship_Name__c,
                                                            Title_Field__c 
                                                    FROM Timeline_Child_Objects__r)
                                                    from Timeline_Configuration__c
                                                    where Id=:confId
                                                ];
                String soqlToExec = getSOQLForTimeline(conf, recordId);
                System.debug('>>>>>>>>> '+soqlToExec);
                List<SObject> result = Database.query(soqlToExec);
                SObject theObject = result[0];
                return new TimelineDataResponse(conf,theObject);
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
                Schema.sObjectType.Timeline_Child_Object__c.fields.Title_Field__c.isAccessible()
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

    private static String getSOQLForTimeline(Timeline_Configuration__c conf,String recordId){
        String soqlStmt = 'select Id,';
        List<String> childSoqls = new List<String>();
        for(Timeline_Child_Object__c childObjConf: conf.Timeline_Child_Objects__r){
            String childSoql = '(select Id,CreatedDate';
            if(childObjConf.Object__c.equalsIgnoreCase('Task')){
                childSoql +=',OwnerId,WhoId,Owner.Name,Who.Name,TaskSubtype';
            }
            if(childObjConf.Date_Field__c !=null){
                childSoql +=','+childObjConf.Date_Field__c;
            }
            if(childObjConf.Title_Field__c !=null){
                childSoql +=','+childObjConf.Title_Field__c;
            }
            childSoql +=' from '+childObjConf.Relationship_Name__c+')';
            childSoqls.add(childSoql);
        }
        soqlStmt += String.join(childSoqls,',');
        soqlStmt += ' from '+conf.Object__c;
        soqlStmt += ' where Id=\''+String.escapeSingleQuotes(recordId)+'\'';
        return soqlStmt;
    }
}

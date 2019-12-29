public with sharing class RecordTimelineDataProvider {
    @AuraEnabled(cacheable=false)
    public static TimelineDataResponse getTimelineItemData(String confId,String recordId) {
        System.debug('>>>>>>>>>>> confId='+confId+', record Id:'+recordId);
        if(recordId !=null && confId!=null){
            if(areObjectAndFieldsAccessible()){
                Timeline_Configuration__c conf  = [ select Id,timeline__Object__c,
                                                    (SELECT timeline__Date_Field__c,timeline__Fields_to_Display__c,timeline__Icon_Image_Url__c,
                                                            timeline__Icon_Name__c,Id,Name,timeline__Object_Color__c,timeline__Object__c,timeline__Relationship_Name__c,
                                                            timeline__Title_Field__c 
                                                    FROM timeline__Timeline_Child_Objects__r)
                                                    from timeline__Timeline_Configuration__c
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

    private static String getSOQLForTimeline(timeline__Timeline_Configuration__c conf,String recordId){
        String soqlStmt = 'select Id,';
        List<String> childSoqls = new List<String>();
        for(timeline__Timeline_Child_Object__c childObjConf: conf.timeline__Timeline_Child_Objects__r){
            String childSoql = '(select Id';
            childSoql += childObjConf.timeline__Object__c.endsWith('__x')?'':',CreatedDate';
            if(childObjConf.Object__c.equalsIgnoreCase('Task')){
                childSoql +=',OwnerId,WhoId,Owner.Name,Who.Name,TaskSubtype';
            }
            if(childObjConf.timeline__Date_Field__c !=null){
                childSoql +=','+childObjConf.timeline__Date_Field__c;
            }
            if(childObjConf.Title_Field__c !=null){
                childSoql +=','+childObjConf.timeline__Title_Field__c;
            }
            childSoql +=' from '+childObjConf.timeline__Relationship_Name__c+')';
            childSoqls.add(childSoql);
        }
        soqlStmt += String.join(childSoqls,',');
        soqlStmt += ' from '+conf.timeline__Object__c;
        soqlStmt += ' where Id=\''+String.escapeSingleQuotes(recordId)+'\'';
        return soqlStmt;
    }
}
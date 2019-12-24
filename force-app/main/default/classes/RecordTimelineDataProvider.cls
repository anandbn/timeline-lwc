public with sharing class RecordTimelineDataProvider {
    @AuraEnabled(cacheable=true)
    public static TimelineDataResponse getTimelineItemData(String confId,String recordId) {
        System.debug('>>>>>>>>>>> confId='+confId+', record Id:'+recordId);
        if(recordId !=null && confId!=null){
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
        }else{
            return null;
        }

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

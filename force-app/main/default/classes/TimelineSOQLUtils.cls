public with sharing class TimelineSOQLUtils {
    public static String getSOQLForTimeline(timeline__Timeline_Configuration__c conf,String recordId,String dateFilter,List<String> log){
        String soqlStmt = 'select Id,';
        List<String> childSoqls = new List<String>();
        for(timeline__Timeline_Child_Object__c childObjConf: conf.timeline__Timeline_Child_Objects__r){
            if(childObjConf.timeline__Data_Provider_Type__c ==null || childObjConf.timeline__Data_Provider_Type__c != 'Apex class' && 
                childObjConf.timeline__Object__c != 'ContentDocumentLink'){
                childSoqls.add(getSoqlForChildConfig(childObjConf,recordId,dateFilter,false,log));
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

    public static String getSoqlForChildConfig(timeline__Timeline_Child_Object__c childObjConf,String recordId,String dateFilter,Boolean isDiagnosticMode,List<String> log){

        String childSoql = isDiagnosticMode?'select ':'(select ';

        childObjConf.timeline__Data_Provider_Type__c='Related Record';
        List<String> fieldsToQuery = childObjConf.timeline__Fields_to_Display__c.split(',');
       
        if(!fieldsToQuery.contains('Id')) fieldsToQuery.add('Id');
        if(childObjConf.Object__c.equalsIgnoreCase('ContentDocumentLink')){
            if(!fieldsToQuery.contains('ContentDocumentId'))  fieldsToQuery.add('ContentDocumentId');
            fieldsToQuery.add('ContentDocument.Title');
            fieldsToQuery.add('ContentDocument.Description');
        }
        if(childObjConf.Object__c.equalsIgnoreCase('CaseArticle')){
            fieldsToQuery.add('KnowledgeArticleVersion.Title');
            fieldsToQuery.add('KnowledgeArticleVersion.Summary');
            fieldsToQuery.add('KnowledgeArticleVersion.UrlName');
        }
        if(childObjConf.Object__c.equalsIgnoreCase('Task')){
            if(!fieldsToQuery.contains('OwnerId')) fieldsToQuery.add('OwnerId');
            if(!fieldsToQuery.contains('WhoId')) fieldsToQuery.add('WhoId');
            if(!fieldsToQuery.contains('TaskSubtype')) fieldsToQuery.add('TaskSubtype');
            if(!fieldsToQuery.contains('IsClosed')) fieldsToQuery.add('IsClosed');
            if(!fieldsToQuery.contains('ActivityDate')) fieldsToQuery.add('ActivityDate');
            fieldsToQuery.add('Owner.Name');
            fieldsToQuery.add('Who.Name');
        }
        if(childObjConf.timeline__Date_Field__c !=null && !fieldsToQuery.contains(childObjConf.timeline__Date_Field__c)){
            fieldsToQuery.add(childObjConf.timeline__Date_Field__c);
        }
        if(childObjConf.Title_Field__c !=null){
            for(String titleField : childObjConf.Title_Field__c.split(',')){
                if(!fieldsToQuery.contains(titleField)){
                   fieldsToQuery.add(titleField);
                }
            }
        }
        if(childObjConf.Sub_Title_Fields__c !=null){
            for(String subTitlefield : childObjConf.Sub_Title_Fields__c.split(',')){
                if(!fieldsToQuery.contains(subTitlefield)){
                   fieldsToQuery.add(subTitlefield);
                }
            }
        }
        if(childObjConf.Overdue_Field__c !=null && !fieldsToQuery.contains(childObjConf.Overdue_Field__c)){
            fieldsToQuery.add(childObjConf.Overdue_Field__c);
        }
        log.add('Fields being included in SOQL: '+ String.join(fieldsToQuery,','));
        Map<String,ApexDescribeUtils.FieldData> feildMetaMap = new Map<String,ApexDescribeUtils.FieldData>();

        for(ApexDescribeUtils.FieldData fldMeta: ApexDescribeUtils.getFieldsForObject(childObjConf.timeline__Object__c,fieldsToQuery)){
            feildMetaMap.put(fldMeta.apiName,fldMeta);
        }
        log.add('feildMetaMap: '+ feildMetaMap);
        List<String> soqlFields = new List<String>();
        for(String fldApiName: fieldsToQuery){
            ApexDescribeUtils.FieldData fldMeta = (ApexDescribeUtils.FieldData)feildMetaMap.get(fldApiName);
            if(fldMeta != null && fldMeta.dataType == 'PICKLIST'){
                log.add('Field: '+ fldApiName + ' is a PICKLIST. Adding toLabel()');
                soqlFields.add('toLabel('+fldApiName+')');
            }else{
                soqlFields.add(fldApiName);
            }
        }
        childSoql += String.join(soqlFields,',');
        
        childSoql +=' from '+(isDiagnosticMode?childObjConf.timeline__Object__c:childObjConf.timeline__Relationship_Name__c);
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
            if(isDiagnosticMode){
                childSoql +=' where '+childObjConf.timeline__Reference_Field_Name__c+'=\''+recordId+ '\' and ' +childObjConf.timeline__Date_Field__c+ ' !=null';
            }else{
                childSoql +=' where ' +childObjConf.timeline__Date_Field__c+ ' !=null';
            }
            if(dateFilterStr !=null){
                childSoql +=' and '+childObjConf.timeline__Date_Field__c+'='+dateFilterStr;
            } 
            if(childObjConf.timeline__Where_Clause__c !=null){
                childSoql +=' and '+ childObjConf.timeline__Where_Clause__c;
            }
            childSoql +=' order by '+childObjConf.timeline__Date_Field__c+' desc';
//            childSoql += childObjConf.timeline__Include_All_Records__c?' ALL ROWS':'';
        }else if(!childObjConf.timeline__Object__c.endsWith('__x')){
            if(isDiagnosticMode){
                childSoql +=' where '+childObjConf.timeline__Reference_Field_Name__c+'=\''+recordId+ '\'';
                if(dateFilterStr !=null){
                    childSoql +=' and '+childObjConf.timeline__Reference_Field_Name__c+'=\''+recordId+ '\' and CreatedDate='+dateFilterStr;
                }
            }else{
                childSoql +=' where '+childObjConf.timeline__Reference_Field_Name__c+'=\''+recordId+ '\' and CreatedDate='+dateFilterStr;
            }
            if(childObjConf.timeline__Where_Clause__c !=null){
                childSoql +=' and '+ childObjConf.timeline__Where_Clause__c;
            }   
            childSoql +=' order by CreatedDate desc';
        }

        if(!isDiagnosticMode)
            childSoql +=')';
        log.add('>>>>>>>>>>> '+ childObjConf.timeline__Object__c+' SOQL :'+childSoql);
        return childSoql;
    }
}
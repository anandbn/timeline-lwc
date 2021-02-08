/*
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

global class TaskUtils {

    @AuraEnabled(cacheable=true)
    global static String getCurrentUsername(){
        return UserInfo.getName();
    }
    @AuraEnabled(cacheable=true)
    global static TaskInfo getTaskSubjectOptions(){
        Schema.DescribeFieldResult fldDesc = Task.Subject.getDescribe();
        List<PicklistOption> subjectOptions = new List<PicklistOption>();
        for(Schema.PicklistEntry pVal : fldDesc.getPicklistValues()){
            if(pVal.active)
                subjectOptions.add(new PicklistOption(pVal.value,pVal.label));
        }
        fldDesc = Task.Status.getDescribe();
        List<PicklistOption> statusOptions = new List<PicklistOption>();
        for(Schema.PicklistEntry pVal : fldDesc.getPicklistValues()){
            if(pVal.active)
                statusOptions.add(new PicklistOption(pVal.value,pVal.label));
        }
        return new TaskInfo(UserInfo.getName(),subjectOptions,statusOptions);

    }
    @AuraEnabled(cacheable=true)
    public static String getObjectName(String objectName,String recordId,String nameField){
        String theRecordId=recordId;
        String theQuery = 'select Id,'+nameField+' from '+objectName+' where Id=:theRecordId';
        List<SObject> results = Database.query(theQuery);
        if(!results.isEmpty()){
            return (String)results[0].get(nameField);
        }else{
            return null;
        }
    }

    @AuraEnabled(cacheable=false)
    public static List<SearchResult> searchInObject(String objectName,String searchText,String searchDelegateClass){
        if(searchText!=null && searchText.trim().length()>=2){
            List<SearchResult> results = new List<SearchResult>();

            String searchQuery='FIND \''+String.escapeSingleQuotes(searchText)+'*\' IN ALL FIELDS RETURNING '+objectName;
            
            if(objectName == 'Contact'){
                searchQuery +='(Id,Name,Account.Name)';
            }else if(objectName == 'Case'){
                searchQuery +='(Id,CaseNumber)';
            }else{
                searchQuery +='(Id,Name)';
            }
            System.debug('>>>>>>>>'+searchQuery);
            
            List<List<SObject>> searchList = Search.query(searchQuery);
            List<Id> contactIds = new List<Id>();
            if(!searchList.isEmpty()){
                List<SObject> objectResults = searchList[0];
                if(!objectResults.isEmpty()){
                    for(SObject sObj : objectResults){
                        System.debug('>>>>>>'+sObj);
                        if(objectName == 'Contact'){
                            contactIds.add(sObj.Id);
                        }
                        else if(objectName == 'Case'){
                            results.add(new SearchResult(sObj.Id,(String)sObj.get('CaseNumber'),null));
                        }else{
                            results.add(new SearchResult(sObj.Id,(String)sObj.get('Name'),null));
                        }
                        
                    }
                }
            }
            if(!contactIds.isEmpty()){
                for(Contact ct: [select Id,Name,Account.Name from Contact where Id in :contactIds]){
                    results.add(new SearchResult(ct.Id,ct.Name,ct.Account.Name));
                }
            }
            return results;
        }else{
            List<SearchResult> results = new List<SearchResult>();
            if(objectName == 'Contact'){
                List<Id> contactIds = new List<Id>();
                for(RecentlyViewed viewedRec: [select Id,Name from RecentlyViewed where Type='Contact']){
                    contactIds.add(viewedRec.Id);
                }
                for(Contact ct: [select Id,Name,Account.Name from Contact where Id in :contactIds]){
                    results.add(new SearchResult(ct.Id,ct.Name,ct.Account.Name));
                }

            }else{
                for(RecentlyViewed viewedRec: [select Id,Name from RecentlyViewed where Type=:objectName]){
                    results.add(new SearchResult(viewedRec.Id,viewedRec.Name,null));
                }
            }
            return results;
        }
    }

    @AuraEnabled(cacheable=false)
    public static Task saveTask(String subject, Date dueDate,String whatId, String whoId, String status,String comments,String subType){
        Task tsk = new Task();
        tsk.OwnerId=UserInfo.getUserId();
        if(subject!=null){
            tsk.Subject=subject;
        }   
        if(whatId !=null){
            tsk.WhatId=whatId;
        }
        if(whoId !=null){
            tsk.whoId=whoId;
        }
        if(dueDate !=null){
            tsk.ActivityDate=dueDate;
        }
        if(comments !=null){
            tsk.Description=comments;
        }
        if(status !=null){
            tsk.Status=status;
        }

        if(subType !=null){
            tsk.TaskSubType=subType;
        }
        System.debug('>>>>>>>> Before insert:'+tsk);
        insert tsk;
        return tsk;
    }

    @AuraEnabled(cacheable=false)
    public static SObject saveTaskFromObject(Task tsk){
        /*Task tsk = new Task();
        for(String key:tskMap.keySet()){
            System.debug('>>>>>>>> Setting value: '+tsk);
            tsk.put(key,tskMap.get(key));
        }
        tsk.put('OwnerId',UserInfo.getUserId());
        */
        tsk.OwnerId = UserInfo.getUserId();
        System.debug('>>>>>>>> Before insert:'+tsk);
        insert tsk;
        return tsk;
    }


    @AuraEnabled(cacheable=false)
    public static Event saveEvent(String subject, Datetime startDate,Datetime endDate,String whatId, String whoId, Boolean allDayEvent, String location){
        Event evt = new Event();
        evt.OwnerId=UserInfo.getUserId();
        if(subject!=null){
            evt.Subject=subject;
        }   
        if(whatId !=null){
            evt.WhatId=whatId;
        }
        if(whoId !=null){
            evt.whoId=whoId;
        }
        if(startDate !=null){
            evt.StartDateTime = startDate;
        }
        if(endDate !=null){
            evt.EndDateTime = endDate;
        }
        if(allDayEvent !=null){
            evt.IsAllDayEvent = allDayEvent;
        }
        if(location !=null){
            evt.Location = location;
        }
        System.debug('>>>>>>>> Before insert:'+evt);
        insert evt;
        return evt;
    }

    global class SearchResult{
        @AuraEnabled
        public String name {get; set;}
        @AuraEnabled
        public String parentName {get; set;}
        @AuraEnabled
        public String recordId {get; set;}

        public SearchResult(Id recId,String name,String parentName){
            this.name=name;
            this.parentName=parentName;
            this.recordId=recId;
        }
    }
    global class TaskInfo{
        public TaskInfo(String username,List<PicklistOption> subjects,List<PicklistOption> statusList){
            this.currentUsername=username;
            this.subjectOptions=subjects;
            this.statusOptions=statusList;
        }

        @AuraEnabled
        public String currentUserName {get; set;}

        @AuraEnabled
        public List<PicklistOption> subjectOptions {get; set;}

        @AuraEnabled
        public List<PicklistOption> statusOptions {get; set;}
    }

    global class PicklistOption{
        public PicklistOption(String theValue, String theLabel){
            this.value=theValue;
            this.label=theLabel;
        }
        @AuraEnabled
        public String label {get; set;}
        @AuraEnabled
        public String value {get; set;}
    }
}
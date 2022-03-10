// Use .apex files to store anonymous Apex.
// You can execute anonymous Apex in VS Code by selecting the
//     apex text and running the command:
//     SFDX: Execute Anonymous Apex with Currently Selected Text
// You can also execute the entire file by running the command:
//     SFDX: Execute Anonymous Apex with Editor Contents

/*timeline__Timeline_Configuration__c conf = [ select Id,timeline__Object__c,timeline__Display_Relative_Dates__c,
                                                    (SELECT timeline__Date_Field__c,timeline__Fields_to_Display__c,timeline__Icon_Image_Url__c,
                                                            timeline__Icon_Name__c,Id,Name,timeline__Object_Color__c,timeline__Object__c,timeline__Relationship_Name__c,
                                                            timeline__Title_Field__c,timeline__LWC_Ui_Api_Not_Supported__c,timeline__Data_Provider_Type__c,
                                                            timeline__Provider_Apex_Classname__c,timeline__Reference_Field_Name__c,
                                                            timeline__Where_Clause__c,timeline__Display_Object_Name__c,timeline__Title_link_Navigate_to__c,
                                                            timeline__Overdue_Field__c,timeline__Include_All_Records__c
                                                    FROM timeline__Timeline_Child_Objects__r)
                                                    from timeline__Timeline_Configuration__c
                                                    where (Id='a004T000001HvKFQA0')
                                                ];
String recordId='0014T000002xVTxQAM';
List<String> log = new List<String>();
TimelineSOQLUtils.getSOQLForTimeline(conf,recordId,null,log);
System.debug('>>>>>>>>');
for(String logStr : log){
    System.debug('>>>>>>>> '+logStr);
}
System.debug('>>>>>>>>');*/
List<Task> allTasks = [select Id,Subject from Task ALL ROWS];
//RecordTimelineDataProvider.getTimelineItemChildData('ActivityHistory','Subject,Status,Priority','00T4T00000BzO31UAF');
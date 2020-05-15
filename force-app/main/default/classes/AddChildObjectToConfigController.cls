 /*
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

public with sharing class AddChildObjectToConfigController {
    
    @AuraEnabled(cacheable=true)
    public static string getObjectApiName(Id recordId){
        if(areObjectAndFieldsAccessible()){
            timeline__Timeline_Configuration__c conf = [select timeline__Object__c 
                                                        from timeline__Timeline_Configuration__c
                                                        where Id=:recordId ];
            return conf.timeline__Object__c;

        }
        return null;
    }

    @AuraEnabled(cacheable=true)
    public static List<ApexDescribeUtils.FieldData> getFieldsForObject(String objectApiName){
        return ApexDescribeUtils.getFieldsForObject(objectApiName);
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
    


}
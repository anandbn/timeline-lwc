 /*
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

global class ApexDescribeUtils {
    
    global class FieldData{
        @AuraEnabled
        public String apiName {get; set;}

        @AuraEnabled
        public String dataType {get; set;}

        @AuraEnabled
        public String referenceTo {get; set;}

        @AuraEnabled
        public String referenceToApiName {get; set;}

        @AuraEnabled
        public Boolean isNamePointing {get; set;}

        @AuraEnabled
        public Boolean isNameField {get; set;}

        @AuraEnabled
        public String fieldLabel {get; set;}

        @AuraEnabled
        public String relationshipName {get; set;}

        public FieldData(String apiName,String dataType,String fldLabel,String refTo,Boolean isNamePointing,String relName,Boolean isNameField){
            this.apiName=apiName;
            this.dataType=dataType;
            this.fieldLabel=fldLabel;
            this.referenceTo=refTo;
            this.isNamePointing=isNamePointing;
            this.relationshipName=relName;
            this.isNameField=isNameField;
        }

    }
    
    public static List<FieldData> getFieldsForObject(String objectApiName){
        
        List<FieldData> fieldsForObject = new List<FieldData>();

        String[] types = new String[]{objectApiName};

        // Make the describe call
        Schema.DescribeSobjectResult[] results = Schema.describeSObjects(types);

        // For each returned result, get some info
        for(Schema.DescribeSobjectResult res : results) {
            Map<String, Schema.SObjectField> fieldMap = res.fields.getMap();
            for(String fieldKey:fieldMap.keySet()){
                addFieldMetadata(fieldMap,fieldsForObject,fieldKey);
            }
            
        }

        return fieldsForObject;
    }

    public static List<FieldData> getFieldsForObject(String objectApiName,List<String> fieldsToReturn){
        
        List<FieldData> fieldsForObject = new List<FieldData>();

        String[] types = new String[]{objectApiName};

        // Make the describe call
        Schema.DescribeSobjectResult[] results = Schema.describeSObjects(types);

        // For each returned result, get some info
        for(Schema.DescribeSobjectResult res : results) {
            Map<String, Schema.SObjectField> fieldMap = res.fields.getMap();
            for(String fieldApiName: fieldsToReturn){
                addFieldMetadata(fieldMap,fieldsForObject,fieldApiName);
            }
        }

        return fieldsForObject;
    }

    private static void addFieldMetadata(Map<String, Schema.SObjectField> fieldMap,List<FieldData> fieldsForObject,String fieldApiName){
        Schema.SObjectField fld = fieldMap.get(fieldApiName);
        Schema.DescribeFieldResult fldDesc = fld.getDescribe();
        fieldsForObject.add(new FieldData(  fldDesc.getName(),fldDesc.getType().name(),fldDesc.getLabel(),
                                            fldDesc.getReferenceTo().isEmpty()?null:fldDesc.getReferenceTo()[0].getDescribe().getName(),
                                            fldDesc.isNamePointing(),
                                            fldDesc.getRelationshipName(),
                                            fldDesc.isNameField()));

    }
}
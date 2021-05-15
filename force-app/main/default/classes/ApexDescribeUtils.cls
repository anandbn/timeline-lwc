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

        @AuraEnabled
        public String extraTypeInfo {get; set;}

        @AuraEnabled
        public List<ApexDescribeUtils.PicklistEntry> picklistValues {get; set;}

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

    global class PicklistEntry{
        @AuraEnabled
        public String label {get; set;}

        @AuraEnabled
        public String value {get; set;}

        public PicklistEntry(String label,String value){
            this.label=label;
            this.value=value;
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
                Schema.SObjectField fld = fieldMap.get(fieldKey);
                System.debug('>>>>>> calling addFieldMetadata for '+fieldKey);
                addFieldMetadata(fieldMap,fieldsForObject,fieldKey,objectApiName);
            }

            List<Schema.RecordTypeInfo> rTypes = res.getRecordTypeInfos();
            if(rTypes !=null && !rTypes.isEmpty()){
                FieldData fieldData = new FieldData('RecordType.Name','PICKLIST','Record Type Name',
                                                    null,
                                                    false,
                                                    'RecordType',
                                                    false);
                List<PicklistEntry> pValues = new List<PicklistEntry>();
                for(Schema.RecordTypeInfo rType: rTypes){
                    pValues.add(new PicklistEntry(rType.name,rType.developername));    
                }
                fieldData.picklistValues=pValues;
                fieldsForObject.add(fieldData);
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
                System.debug('>>>>>>>>>>> fieldApiName='+fieldApiName);
                addFieldMetadata(fieldMap,fieldsForObject,fieldApiName,objectApiName);
            }
        }

        return fieldsForObject;
    }

    private static void addFieldMetadata(Map<String, Schema.SObjectField> fieldMap,List<FieldData> fieldsForObject,String fieldApiName,String objectApiName){
        Schema.SObjectField fld = fieldMap.get(fieldApiName);
        Schema.DescribeFieldResult fldDesc = fld.getDescribe();

        FieldData fieldData = new FieldData(    fldDesc.getName(),fldDesc.getType().name(),fldDesc.getLabel(),
                                                fldDesc.getReferenceTo().isEmpty()?null:fldDesc.getReferenceTo()[0].getDescribe().getName(),
                                                fldDesc.isNamePointing(),
                                                fldDesc.getRelationshipName(),
                                                fldDesc.isNameField());
        if(fldDesc.getType() == Schema.DisplayType.TEXTAREA){
            //Determine if this a rich text area and set the extraTypeInfo object
            List<FieldDefinition> fldDefn = [ Select Id,ExtraTypeInfo 
                                        from FieldDefinition 
                                        where EntityDefinition.QualifiedApiName=:objectApiName
                                        and QualifiedApiName =:fldDesc.getName()];
            if(fldDefn != null && !fldDefn.isEmpty()){
                fieldData.extraTypeInfo=fldDefn[0].ExtraTypeInfo;
            }
        }
        if(fldDesc.getType() == Schema.DisplayType.PICKLIST || fldDesc.getType() == Schema.DisplayType.MULTIPICKLIST){
            List<PicklistEntry> pValues = new List<PicklistEntry>();
            for(Schema.PicklistEntry pVal: fldDesc.getPicklistValues()){
                pValues.add(new PicklistEntry(pVal.label!=null?pVal.label:pVal.value,pVal.value));
            }
            fieldData.picklistValues=pValues;
        }
        fieldsForObject.add(fieldData);

    }
}
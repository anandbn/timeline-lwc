 /*
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

public with sharing class TimelineDataResponse {
    @AuraEnabled
    public Timeline_Configuration__c configuration {get; set;}

    @AuraEnabled
    public SObject data {get; set;}

    @AuraEnabled 
    public Map<String,TimelineDataResponse.ApexConfigAndData> apexConfigData {get; set;}

    @AuraEnabled
    public List<ApexDescribeUtils.FieldData> fieldMetadata {get; set;}

    public TimelineDataResponse(Timeline_Configuration__c conf,Sobject theRecord, Map<String,TimelineDataResponse.ApexConfigAndData> apexData) {
        this.configuration=conf;
        this.data=theRecord;
        this.apexConfigData=apexData;
    }

    public class ApexConfigAndData{
        @AuraEnabled
        public List<Object> apexData {get; set;}
        @AuraEnabled
        public String recordIdentifierField {get; set;}
        @AuraEnabled
        public String baseUrlForRecordDetail {get; set;}
        @AuraEnabled
        public List<TimelineFieldType> fieldsWithTypes {get; set;}

    }
}
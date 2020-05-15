 /*
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

public with sharing class VerifyApexProvider {
    @AuraEnabled(cacheable=false)
    public static VerifyResponse verify(String apexClassName) {
        VerifyResponse resp = new VerifyResponse();
        Type apexType;
        try{
            apexType = Type.forName(apexClassName);
            resp.verified=true;
        }catch(Exception ex){
            resp.verified=false;
            resp.addVerificationResult(new VerifyResult(ex.getMessage(),false));
            return resp;
        } 
        System.debug('>>>>>>> apexType :'+apexType);
        if(apexType!=null){       
            Object classInstance = apexType.newInstance();
            List<VerifyResult> verifyResults = new List<VerifyResult>();
            System.debug('>>>>>>> apexType instanceof ITimelineDataProvider = '+(classInstance instanceof ITimelineDataProvider));
            if(classInstance instanceof ITimelineDataProvider){
                System.debug('>>>>>>> type is correct');
                resp.addVerificationResult(new VerifyResult('Implements the ITimelineDataProvider interface',true));
                ITimelineDataProvider provider = (ITimelineDataProvider)classInstance;
                Object definitionFld = provider.getDateField();
                if(isFieldDefintionValid(provider.getDateField())){
                    System.debug('>>>>>>> datefield verified');
                    resp.dateFieldName=provider.getDateField();
                    resp.addVerificationResult(new VerifyResult('Has a Date or Datetime field definition',true));
                }else{
                    resp.verified=false;
                    resp.addVerificationResult(new VerifyResult('Has a Date or Datetime field definition',false));
                }
                if(isFieldDefintionValid(provider.getTitleField())){
                    System.debug('>>>>>>> title verified');
                    resp.titleFieldName=provider.getTitleField();
                    resp.addVerificationResult(new VerifyResult('Has a Title field definition',true));
                }else{
                    resp.verified=false;
                    resp.addVerificationResult(new VerifyResult('Has a Title field definition',false));
                }
                if(isFieldDefintionValid(provider.getObjectName())){
                    System.debug('>>>>>>> objectname verified');
                    resp.objectName=provider.getObjectName();
                    resp.addVerificationResult(new VerifyResult('Has a Object name field definition',true));
                }else{
                    resp.verified=false;
                    resp.addVerificationResult(new VerifyResult('Has a Object name field definition',false));
                }
                if(isFieldDefintionValid(provider.getRelationshipName())){
                    System.debug('>>>>>>> relationship name verified');
                    resp.relationshipName=provider.getRelationshipName();
                    resp.addVerificationResult(new VerifyResult('Has a Relationship name field definition',true));
                }else{
                    resp.verified=false;
                    resp.addVerificationResult(new VerifyResult('Has a Relationship name field definition',false));
                }            
                Object fieldsToDisplay = provider.getFieldsToDisplay();
                if(fieldsToDisplay instanceof List<String> && fieldsToDisplay!=null && !((List<String>)fieldsToDisplay).isEmpty()){
                    System.debug('>>>>>>> display fields verified');
                    resp.fieldsToDisplay=String.join(provider.getFieldsToDisplay(),',');
                    resp.addVerificationResult(new VerifyResult('Returns list of fields to display',true));
                }else{
                    resp.verified=false;
                    resp.addVerificationResult(new VerifyResult('Returns list of fields to display',false));
                }
           }else{
                System.debug('>>>>>>> class type is incorrect');
                resp.verified=false;
                resp.addVerificationResult(new VerifyResult('Implements the ITimelineDataProvider interface',false));
                resp.addVerificationResult(new VerifyResult('Returns Datetime field',false));
                resp.addVerificationResult(new VerifyResult('Returns Title field',false));
                resp.addVerificationResult(new VerifyResult('Returns list of fields to display',false));
            }
        }else{
            System.debug('>>>>>>> class type is null');
            resp.verified=false;
            resp.addVerificationResult(new VerifyResult('Implements the ITimelineDataProvider interface',false));
            resp.addVerificationResult(new VerifyResult('Returns Datetime field',false));
            resp.addVerificationResult(new VerifyResult('Returns Title field',false));
            resp.addVerificationResult(new VerifyResult('Returns list of fields to display',false));
        }
        return resp;
    }

    public static Boolean isFieldDefintionValid(Object fldDefinitionVal){
        return (fldDefinitionVal !=null && fldDefinitionVal instanceof String && ((String)fldDefinitionVal).trim().length()>0); 
    }
    public class VerifyResponse{
        @AuraEnabled
        public Boolean verified {get; set;}
        @AuraEnabled
        public String objectName {get; set;}
        @AuraEnabled
        public String relationshipName {get; set;}
        @AuraEnabled
        public String dateFieldName {get; set;}
        @AuraEnabled
        public String titleFieldName {get; set;}
        @AuraEnabled
        public String fieldsToDisplay {get; set;}
        @AuraEnabled
        public List<VerifyResult> results;

        public void addVerificationResult(VerifyResult result){
            if(this.results ==null){
                this.results = new List<VerifyResult>();
            }
            this.results.add(result);
        }
    }
    
    public class VerifyResult{

        public VerifyResult(String msg,Boolean status){
            this.status=status;
            this.message=msg;
        }
        @AuraEnabled
        public String message {get; set;}
        @AuraEnabled
        public Boolean status {get; set;}

    }
}
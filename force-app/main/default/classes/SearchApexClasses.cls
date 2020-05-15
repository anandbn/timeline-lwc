 /*
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

public with sharing class SearchApexClasses {
    @AuraEnabled(cacheable=true)
    public static List<ApexClass> searchForApex(String searchString){
        if(searchString !=null && searchString.trim().length()>0){
            String orgNamespace = [SELECT NamespacePrefix FROM Organization].NamespacePrefix;
            System.debug('>>>>>>>> orgNamespace : '+orgNamespace);
            String soqlQuery;
            String searchLikeStr = '%'+String.escapeSingleQuotes(searchString)+'%';
            if(orgNamespace !=null){
                soqlQuery = 'select Id,Name,NamespacePrefix from Apexclass WHERE NamespacePrefix = :orgNamespace and Name like :searchLikeStr';
            }else{
                soqlQuery = 'select Id,Name,NamespacePrefix from Apexclass WHERE NamespacePrefix = null Name like :searchLikeStr';
            }
            System.debug('>>>>>>>> SOQL Query: '+soqlQuery);
            return (List<ApexClass>)Database.query(soqlQuery);    
        }else{
            return null;
        }
    }
}
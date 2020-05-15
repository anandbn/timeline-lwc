 /*
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

@isTest
public with sharing class ApexDescribeUtilsTest {
    @isTest static void testGetFieldsForObject(){
        Schema.DescribeSobjectResult[] results = Schema.describeSObjects(new String[]{'Account'});
        Schema.DescribeSobjectResult acctDesc = results[0];

        List<ApexDescribeUtils.FieldData> fielddata = ApexDescribeUtils.getFieldsForObject('Account');
        System.assertEquals(acctDesc.fields.getMap().size(), fielddata.size(), 'Apex describe field mismatch');

    }

    @isTest static void testGetFieldsForObjectWithFields(){
 
        List<ApexDescribeUtils.FieldData> fielddata = ApexDescribeUtils.getFieldsForObject('Account',new String[]{'Id'});
        System.assertEquals(1, fielddata.size(), 'Apex describe for specific field is mismatching');

    }
}
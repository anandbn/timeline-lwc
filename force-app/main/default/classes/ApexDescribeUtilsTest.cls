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
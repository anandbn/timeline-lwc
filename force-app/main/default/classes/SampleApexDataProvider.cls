 /*
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

public with sharing class SampleApexDataProvider implements ITimelineDataProvider {

    public String getObjectName(){
        return 'Invoice';
    }
    public String getRelationshipName(){
        return 'Invoices';
    }


    public String getTitleField(){
        return 'referenceNumber';
    }
    public String getDateField(){
        return 'invoiceDate';
    }
    public List<String> getFieldsToDisplay(){
        return new List<String>{'amount','description','invoiceDate'};
    }

    public List<TimelineFieldType> getFieldsToDisplayWithTypes(){
        List<TimelineFieldType> fieldTypes= new List<TimelineFieldType>();
        fieldTypes.add(new TimelineFieldType('Invoice Number','referenceNumber',Schema.DisplayType.STRING));
        fieldTypes.add(new TimelineFieldType('Invoice Date','invoiceDate',Schema.DisplayType.DATETIME));
        fieldTypes.add(new TimelineFieldType('Invoice Amount','amount',Schema.DisplayType.DOUBLE));
        fieldTypes.add(new TimelineFieldType('Details','description',Schema.DisplayType.TEXTAREA));
        return fieldTypes;
    }
    public String getBaseUrlForRecordDetail(){
        return 'https://timeline-sample-api.herokuapp.com/invoice';
    }

    public String getRecordIdentifierField(){
        return 'referenceNumber';
    }

    public List<Object> getData(Id recordId,String dateFilter){
        Http h = new Http();

        // Instantiate a new HTTP request, specify the method (GET) as well as the endpoint
       HttpRequest req = new HttpRequest();
       req.setEndpoint('https://timeline-sample-api.herokuapp.com/invoices/');
       req.setMethod('GET');
   
       // Send the request, and return a response
       HttpResponse res = h.send(req);
       String invoiceStr = res.getBody();
       System.debug('>>>>>>>>invoiceStr = '+invoiceStr);
       return (List<Object>)JSON.deserializeUntyped(invoiceStr);
    }


}
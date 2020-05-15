 /*
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

global class SampleInvoiceMockImpl implements HttpCalloutMock  {
    global HTTPResponse respond(HTTPRequest req) {
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody('[{"referenceNumber":"20200108","amount":234.56,"description":"Jan 2020 License Charges","invoiceDate":"2020-01-08T00:00:00.000Z"},{"referenceNumber":"20191208","amount":234.56,"description":"Dec 2019 License Charges","invoiceDate":"2019-12-08T00:00:00.000Z"},{"referenceNumber":"20191108","amount":234.56,"description":"Nov 2019 License Charges","invoiceDate":"2019-11-08T00:00:00.000Z"},{"referenceNumber":"20191008","amount":234.56,"description":"Oct 2019 License Charges","invoiceDate":"2019-10-08T00:00:00.000Z"},{"referenceNumber":"20191008-1","amount":-234.56,"description":"Oct 2019 Credit ","invoiceDate":"2019-10-18T00:00:00.000Z"},{"referenceNumber":"20190808","amount":234.56,"description":"Sep 2019 License Charges","invoiceDate":"2019-09-08T00:00:00.000Z"}]');
        res.setStatusCode(200);
        return res;
    }
}
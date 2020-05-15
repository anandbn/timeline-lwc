 /*
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

@IsTest
public class SearchApexClassesTest {
    @IsTest public static void searchApexClasses() {
        List<ApexClass> retList = SearchApexClasses.searchForApex('Record');
        System.assert(retList!=null,'No valid class retured');
    }

    @IsTest public static void searchApexClassesEMplty() {
        List<ApexClass> retList = SearchApexClasses.searchForApex('');
        System.assert(retList==null,'Valid class retured');
    }
}
 /*
 *  Copyright (c) 2018, salesforce.com, inc.
 *  All rights reserved.
 *  SPDX-License-Identifier: BSD-3-Clause
 *  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

public interface ITimelineDataProvider {
    
    String getObjectName();
    String getRelationshipName();
    String getTitleField();
    String getDateField();
    String getBaseUrlForRecordDetail();
    String getRecordIdentifierField();
    List<String> getFieldsToDisplay();
    List<TimelineFieldType> getFieldsToDisplayWithTypes();
    List<Object> getData(Id recordId,String dateFilter);

}
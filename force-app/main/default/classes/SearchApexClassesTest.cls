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
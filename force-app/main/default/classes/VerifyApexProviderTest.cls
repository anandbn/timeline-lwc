@IsTest
public class VerifyApexProviderTest {
    
    @IsTest static void testVerifyApexClass(){
        VerifyApexProvider.VerifyResponse resp = VerifyApexProvider.verify('SampleApexDataProvider');
        System.assert(resp.verified,'SampleDataProvider not verified');
    }
    @IsTest static void testVerifyApexClassIncorrectType(){
        VerifyApexProvider.VerifyResponse resp = VerifyApexProvider.verify('SearchApexClasses');
        System.assert(!resp.verified,'SearchApexClasses is verified');
    }

    @IsTest static void testVerifyApexClassThatDoesNotExist(){
        VerifyApexProvider.VerifyResponse resp = VerifyApexProvider.verify('FakeClass');
        System.assert(!resp.verified,'FakeClass is verified');
    }

}
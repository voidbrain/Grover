import { TestBed } from '@angular/core/testing';
import { NetworkService } from './network.service';
describe('NetworkService', function () {
    beforeEach(function () { return TestBed.configureTestingModule({}); });
    it('should be created', function () {
        var service = TestBed.get(NetworkService);
        expect(service).toBeTruthy();
    });
});
//# sourceMappingURL=network.service.spec.js.map
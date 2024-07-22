import * as tslib_1 from "tslib";
import { Pipe } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
var SanitizeHtmlPipe = /** @class */ (function () {
    function SanitizeHtmlPipe(sanitizer) {
        this.sanitizer = sanitizer;
    }
    SanitizeHtmlPipe.prototype.transform = function (value, type) {
        switch (type) {
            case 'html': return this.sanitizer.bypassSecurityTrustHtml(value);
            case 'style': return this.sanitizer.bypassSecurityTrustStyle(value);
            case 'script': return this.sanitizer.bypassSecurityTrustScript(value);
            case 'url': return this.sanitizer.bypassSecurityTrustUrl(value);
            case 'resourceUrl': return this.sanitizer.bypassSecurityTrustResourceUrl(value);
            default: throw new Error("Invalid safe type specified: " + type);
        }
    };
    SanitizeHtmlPipe = tslib_1.__decorate([
        Pipe({
            name: 'sanitizeHtml'
        }),
        tslib_1.__metadata("design:paramtypes", [DomSanitizer])
    ], SanitizeHtmlPipe);
    return SanitizeHtmlPipe;
}());
export { SanitizeHtmlPipe };
//# sourceMappingURL=sanitize-html-pipe.pipe.js.map
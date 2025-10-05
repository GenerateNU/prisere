var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, Column, PrimaryColumn } from "typeorm";
let FemaDisaster = class FemaDisaster {
    id;
    disasterNumber;
    fipsStateCode;
    declarationDate;
    incidentBeginDate;
    incidentEndDate;
    fipsCountyCode;
    declarationType;
    designatedArea;
    designatedIncidentTypes;
};
__decorate([
    PrimaryColumn(),
    __metadata("design:type", String)
], FemaDisaster.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], FemaDisaster.prototype, "disasterNumber", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], FemaDisaster.prototype, "fipsStateCode", void 0);
__decorate([
    Column({ type: "timestamp" }),
    __metadata("design:type", Date)
], FemaDisaster.prototype, "declarationDate", void 0);
__decorate([
    Column({ nullable: true, type: "timestamp" }),
    __metadata("design:type", Object)
], FemaDisaster.prototype, "incidentBeginDate", void 0);
__decorate([
    Column({ nullable: true, type: "timestamp" }),
    __metadata("design:type", Object)
], FemaDisaster.prototype, "incidentEndDate", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], FemaDisaster.prototype, "fipsCountyCode", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], FemaDisaster.prototype, "declarationType", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], FemaDisaster.prototype, "designatedArea", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], FemaDisaster.prototype, "designatedIncidentTypes", void 0);
FemaDisaster = __decorate([
    Entity()
], FemaDisaster);
export { FemaDisaster };

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ClaimLocation } from "./ClaimLocation";
let Claim = class Claim {
    id;
    status;
    createdAt;
    updatedAt;
    companyId;
    disasterId;
    claimLocations;
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], Claim.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Claim.prototype, "status", void 0);
__decorate([
    Column(),
    __metadata("design:type", Date)
], Claim.prototype, "createdAt", void 0);
__decorate([
    Column(),
    __metadata("design:type", Date)
], Claim.prototype, "updatedAt", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Claim.prototype, "companyId", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Claim.prototype, "disasterId", void 0);
__decorate([
    OneToMany(() => ClaimLocation, claimLocation => claimLocation.claim, {
        cascade: true
    }),
    __metadata("design:type", Array)
], Claim.prototype, "claimLocations", void 0);
Claim = __decorate([
    Entity("claim")
], Claim);
export { Claim };

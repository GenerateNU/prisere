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
//Represents an address for a location of a company
let LocationAddress = class LocationAddress {
    id;
    country;
    stateProvince;
    city;
    streetAddress;
    postalCode;
    county;
    claimLocations;
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], LocationAddress.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], LocationAddress.prototype, "country", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], LocationAddress.prototype, "stateProvince", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], LocationAddress.prototype, "city", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], LocationAddress.prototype, "streetAddress", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], LocationAddress.prototype, "postalCode", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], LocationAddress.prototype, "county", void 0);
__decorate([
    OneToMany(() => ClaimLocation, claimLocation => claimLocation.location),
    __metadata("design:type", Array)
], LocationAddress.prototype, "claimLocations", void 0);
LocationAddress = __decorate([
    Entity("location_address")
], LocationAddress);
export { LocationAddress };

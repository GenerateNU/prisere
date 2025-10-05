var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Claim } from "./Claim";
import { LocationAddress } from "./LocationAddress";
let ClaimLocation = class ClaimLocation {
    id;
    claim;
    location;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", String)
], ClaimLocation.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Claim, claim => claim.claimLocations, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    }),
    __metadata("design:type", Claim)
], ClaimLocation.prototype, "claim", void 0);
__decorate([
    ManyToOne(() => LocationAddress, location => location.claimLocations, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    }),
    __metadata("design:type", void 0)
], ClaimLocation.prototype, "location", void 0);
ClaimLocation = __decorate([
    Entity("claim_location")
], ClaimLocation);
export { ClaimLocation };

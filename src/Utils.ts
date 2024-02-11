import _ from "lodash";

export function generateUUID (): string {
    let uuid: string = '-';
    const chars: string = 'VIOLETISCUTE0123456789';
    
    for (let i: number = 0; i < 10; i++) {
        if (i === 4 || i === 6) {
            uuid += '-';
        }
        uuid += chars[Math.floor(Math.random() * chars.length)];
    }
    
    return uuid;
}

export function IsEnergyFull(target: AnyStructure) :boolean {
    if (target.structureType === STRUCTURE_EXTENSION || target.structureType === STRUCTURE_SPAWN) {
        return target.energy >= target.energyCapacity;
    }
    
    return true;
}

export function IsEnergyEmpty (target: AnyStoreStructure): boolean {
    if (target.structureType === STRUCTURE_EXTENSION || target.structureType === STRUCTURE_SPAWN) {
        return target.energy === 0;
    }
    
    return true;
}

export function IsStoreFull (target: AnyStoreStructure, resource: ResourceConstant): boolean {
    return target.store.getFreeCapacity(resource)! <= 0;
}
export function IsStoreEmpty (target: AnyStoreStructure|Tombstone, resource: ResourceConstant): boolean | undefined {
    if (!target || !target.store) return undefined;
    
    return target.store.getFreeCapacity(resource) === target.store.getCapacity(resource)
}

export function  StoreHasResource(target: AnyStoreStructure, resource: ResourceConstant) : boolean | undefined {
    if (!target || !target.store) return undefined;
    
    return target.store.getFreeCapacity(resource) === target.store.getCapacity(resource)
}

export function IsString (value: any): boolean {
    return typeof value === 'string';
}

export const CreepCount = function (role: RoleType): number {
    return _.filter(Game.creeps, (creep) => creep.memory.role === role).length
}
export enum RoleType {
    Free = "Free",
    Harvester = "Harvester",
    Builder = "Builder",
    Hauler = "Hauler",
    Fixer = "Fixer",
    Upgrader = "Upgrader",
    Handi = "Handi",
}

export enum Distance {
    Any = "Any", Closest = "Closest"
}



export enum WorkType {
    NOTHING = 0,
    NoWork = 1,
    Building,
    Harvesting,
    Transferring,
    Withdrawing,
    Attacking,
    Repairing,
    Upgrading,
    Renew,
    Sortie,
    Pickup,
}

export enum TaskType {
    none = 'None',
    collect = "Collect",
    move = 'Move',
} 

export const WorkTable = ["NOTHING", "No Work", "Build", "Harvest", "Transfer", "Withdraw", "Attack", "Repair", "Upgrade"];

export enum ReturnCode {
    ERR_STORE_FULL = -20,
    ERR_STORE_EMPTY = -21,
    ERR_NO_WORK = -22,
    ERR_NO_TARGET = -23,
    ERR_TARGET_STORE_FULL = -24,
    ERR_TARGET_STORE_EMPTY = -25,
    ERR_SPAWN_CONDITIONS_NOT_MET = -26,
    ERR_NO_SPAWN_FOUND = -27,
}

export const CallEvery = function (interval: number, callback: Function): void {
    if (Game.time % interval === 0) return callback();
}
    
export const GetFlagConfig = function (startsWith: string): object {
    _.forEach(Game.flags, (flag: Flag) => {
        const flagName = flag.name;
        const configName = flagName.slice(0, startsWith.length);
        const configArgs = flagName.slice(startsWith.length, flagName.length);
        if (flagName.startsWith(startsWith)) {
            console.log("Flag found: " +configArgs.trim());
            let args = JSON.parse(configArgs);
            console.log("parsed Args: "+args);
        }
    });
    
    return {};
}


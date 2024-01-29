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

export function IsStoreFull (target: AnyStoreStructure, resource: ResourceConstant): boolean {
    return target.store.getFreeCapacity(resource)! <= 0;
}

export function IsStoreEmpty (target: AnyStoreStructure, resource: ResourceConstant): boolean | undefined {
    if (!target || !target.store) return undefined;
    
    return target.store.getFreeCapacity(resource) === target.store.getCapacity(resource)
}

export function IsString (value: any): boolean {
    return typeof value === 'string';
}

export enum RoleType {
    Free = "Free",
    Harvester = "Harvester",
    Builder = "Builder",
    Hauler = "Hauler",
    Fixer = "Fixer",
    Upgrader = "Upgrader",
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
}

export const WorkTable = ["NOTHING", "No Work", "Build", "Harvest", "Transfer", "Withdraw", "Attack", "Repair", "Upgrade"];

export enum ReturnCode {
    ERR_STORE_FULL = -20,
    ERR_STORE_EMPTY = -21,
    ERR_NO_WORK = -22,
    ERR_NO_TARGET = -23,
    ERR_TARGET_STORE_FULL = -24,
    ERR_TARGET_STORE_EMPTY = -25,
    
}


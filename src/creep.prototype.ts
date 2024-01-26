import {Distance, IsStoreEmpty, IsStoreFull, ReturnCode, WorkType} from "./Utils";
import "./globals";


Creep.prototype._constructor = Creep.prototype.constructor;


Creep.prototype.TryMove = function (_target: Id<any>|undefined, work: WorkType): ReturnCode | CreepActionReturnCode | ScreepsReturnCode {
  
    console.log("WOrk type: "+work);
    if (!_target) return ERR_INVALID_TARGET; 
    
    const target = Game.getObjectById(_target as Id<any>);
    if (!target) return ERR_INVALID_TARGET;
    
    let workReturnCode: ReturnCode | CreepActionReturnCode | ScreepsReturnCode = ERR_NOT_IN_RANGE;
    
    
    
    switch (work) {
        case WorkType.Harvesting: {
            workReturnCode = this.TryHarvest(target);
            break;
        }
        case WorkType.Transferring: {
            // TODO: needs a better check for resource as it could be any resource
            workReturnCode = this.TryTransfer(target, RESOURCE_ENERGY);
            break;
        }
        case WorkType.Upgrading: {
            break;
        }
        case WorkType.Building: {
            break;
        }
        case WorkType.Repairing: {
            break;
        }
        
        case WorkType.Withdrawing: {
            break;
        }
        case WorkType.Attacking: {
            break;
        }
    }
    
    if (workReturnCode === ERR_NOT_IN_RANGE) {
        return this.moveTo(target);
    } else {
        return workReturnCode;
    }
}


Creep.prototype.TryHarvest = function (target: Source | Mineral | Deposit): ReturnCode | CreepActionReturnCode | ScreepsReturnCode {
    
    if (this.IsStoreFull(RESOURCE_ENERGY))
        return ReturnCode.ERR_STORE_FULL;
    
    return this.harvest(target);
}

Creep.prototype.TryTransfer = function (target: AnyStoreStructure, resource: ResourceConstant): ReturnCode | CreepActionReturnCode | ScreepsReturnCode {
    if(IsStoreFull(target, RESOURCE_ENERGY)) {
        return ReturnCode.ERR_TARGET_STORE_FULL;
    }
    
    if (IsStoreEmpty(target, RESOURCE_ENERGY)) {
        return ReturnCode.ERR_TARGET_STORE_EMPTY;
    }
    
    return this.transfer(target, resource);
}


/////////// Memory  /////////////
Creep.prototype.SetSourceID = function (id: Id<Source>): void {
    this.memory.sourceID = id;
}

Creep.prototype.SetTargetID = function (id: Id<Structure>): void {
    this.memory.targetID = id;
}

Creep.prototype.GetSourceID = function (): Id<Source> | undefined {
    return this.memory.sourceID;
}

Creep.prototype.GetTargetID = function (): Id<Structure> | undefined {
    return this.memory.targetID;
}
////////////////////////////////////////////////////////////////////

Creep.prototype.SetWaitingFlag = function (name: string) : void {

    let flag = Game.flags[name];
    if (flag)
        this.memory.waitingFlagId = flag.pos;
}

Creep.prototype.FindValidHarvestID = function (args: Search): Id<Source> | undefined {
    
    let result: Source | Source[] | null = null;
    
    const filter: any = {filter: (source: Source) => source.energy > 0}
    
    console.log(JSON.stringify(args.distance === Distance.Any))
    
    if (args.distance === Distance.Closest) {
        let pos = args.searchPos || this.pos;
        
        result = pos.findClosestByPath(FIND_SOURCES, filter);
        console.log("Result: " + JSON.stringify(result))
        if (result)
            return result.id;
        
    } else if (args.distance === Distance.Any) {
        result = this.room.find(FIND_SOURCES, filter)
        console.log()
        if (result.length > 0) return result[0]?.id;
    } else {
        console.log("Weird??")
    }
    
    return undefined;
}

Creep.prototype.FindValidTransferID = function (args: Search): any {
    
    const defaultStructures: StructureConstant[] = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION];
    let structuresConsts: StructureConstant[] = args.structure || defaultStructures;
    
    let orderDict = Object.fromEntries(
        structuresConsts.map((struct, index) => [struct, index + 1])
    );
    
    const filter = {
        filter: (structure: Structure) => structuresConsts?.includes(structure.structureType)
    };
    //
    let targets: Structure | Structure[] | null | any = null;
    
    if (args.distance && args.distance === Distance.Closest) {
        let pos = args.searchPos || this.pos;
        
        targets = this.room.find(args.find || FIND_STRUCTURES, filter);
        targets.sort((a: Structure, b: Structure) => {
            const order: { [key: string]: number } = orderDict;
            return order[a.structureType] - order[b.structureType];
        })
        
        console.log(targets)
        
        if (targets.length > 0) {
            for (let i = 0; i < targets.length; i++) {
                console.log("Target: " + targets[i].name + " " + " capacity: " + targets[i].store.getFreeCapacity(RESOURCE_ENERGY));
                if (targets[i].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    return targets[i].id;
                }
            }
        }
        
        return null;
    }
}

/////////////////////////////////////////////////////////////////

Creep.prototype.IsStoreFull = function (resource: ResourceConstant): boolean {
    // console.log("Store is full: "+ (this.store.getFreeCapacity(RESOURCE_ENERGY)<=0));
    return (this.store.getFreeCapacity(resource) <= 0);
}

Creep.prototype.IsStoreEmpty = function (resource: ResourceConstant): boolean {
    return this.store.getFreeCapacity(resource || RESOURCE_ENERGY)
        === this.store.getCapacity(resource || RESOURCE_ENERGY);
}

Creep.prototype.SetWork = function (work: WorkType): void {
    this.memory.currentWork = work;
}

Creep.prototype.IsWorking = function (work: WorkType): boolean {
    return this.memory.currentWork === work;
}

Creep.prototype.GetWork = function ( ): WorkType {
    if (this.memory.currentWork)
        return this.memory.currentWork;
    
    return WorkType.NoWork;
}


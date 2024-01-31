import {Distance, IsEnergyFull, IsStoreEmpty, IsStoreFull, ReturnCode, WorkTable, WorkType} from "./Utils";
import "./globals";


Creep.prototype._constructor = Creep.prototype.constructor;

Creep.prototype.TryRenew = function (): void {
    if (this.ticksToLive! <= 200) {
        this.memory.renewing = true;
    }
    
    if (this.memory.renewing) {
        console.log(this.name + " is renewing")
        let spawn = this.room.find(FIND_MY_SPAWNS);
        if (spawn && spawn.length > 0) {
            if (spawn[0].renewCreep(this) === ERR_NOT_IN_RANGE)
                this.moveTo(spawn[0]);
        }
        
        if (this.ticksToLive! >= 1400)
            this.memory.renewing = false;
    }
    
    return;
}

Creep.prototype.CheckRenew = function (primaryWork: WorkType): void  {
    if (this.ticksToLive) {
        if (this.ticksToLive <= 500 && this.GetWork() !== WorkType.Renew) {
            this.SetWork(WorkType.Renew);
        } else if (this.ticksToLive >= 1400) {
            if (this.GetWork() === WorkType.Renew)
                this.SetWork(primaryWork);
            
            return;
        }
    }
    if (this.GetWork() === WorkType.Renew) {
        const renewID = this.GetRenewTargetID();
        
        let returnCode: ReturnCode | ScreepsReturnCode = ERR_INVALID_TARGET;
        
        if (renewID) {
            returnCode = this.TryMove(renewID, this.GetWork())
        } else {
            let spawn = this.room.find(FIND_MY_SPAWNS, {
                filter: (spawn: StructureSpawn) => {
                    return spawn.room.name === this.room.name
                }
            });
            
            
            if (spawn && spawn.length > 0) {
                this.SetRenewTargetID(spawn[0].id);
                returnCode = this.TryMove(spawn[0].id, this.GetWork());
            }
        }
        
        if (returnCode === ERR_INVALID_TARGET || returnCode === ReturnCode.ERR_NO_SPAWN_FOUND) {
            console.log("******* ERROR: No spawn found to renew "+this.name);
        } else {
            console.log("**** Renew returned code: "+ returnCode);
        }
    }
}


Creep.prototype.ResetMemoryEvery = function (memVal: keyof CreepMemory, interval: number, callback: Function | null): void {
    if (this.memory[memVal]) {
        if (Game.time % interval === 0) {
            
            // The memory value being deleted will regenerate on the next tick
            delete this.memory[memVal];
            if (callback)
                return callback();
            
        }
    } else {
        console.log("ResetMemory " + memVal + " isn't set..")
    }
}

Creep.prototype.CallEvery = function (interval: number, callback: Function): void {
    
    if (callback) {
        // console.log(`call ${callback.name} every: ${Game.time} % ${interval} = ${Game.time % interval} ` + (Game.time % interval === 0))
        if (Game.time % interval === 0) return callback();
    }
}

Creep.prototype.TryMove = function (_target: Id<any> | undefined, work: WorkType): ReturnCode | CreepActionReturnCode | ScreepsReturnCode {
    
    // console.log("Work type: " + work);
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
            // console.log("Transferring attempt returned code: " + workReturnCode);
            break;
        }
        case WorkType.Upgrading: {
            workReturnCode = this.TryUpgrading(target)
            break;
        }
        case WorkType.Building: {
            workReturnCode = this.TryBuilding(target);
            break;
        }
        case WorkType.Repairing: {
            workReturnCode = this.TryRepairing(target);
            break;
        }
        
        case WorkType.Withdrawing: {
            workReturnCode = this.TryWithdraw(target, RESOURCE_ENERGY);
            break;
        }
        case WorkType.Attacking: {
            break;
        }
        case WorkType.Renew: {
            // workReturnCode = this.TryRenew(target)
            break;
        }
    }
    
    if (workReturnCode === ERR_NOT_IN_RANGE) {
        return this.moveTo(target,{reusePath: 0,visualizePathStyle: {lineStyle: "dotted", strokeWidth: 0.25, stroke: "#ff88ff"}});
    } else {
        return workReturnCode;
    }
}

Creep.prototype.TryUpgrading = function (target: StructureController): ReturnCode | ScreepsReturnCode | CreepActionReturnCode {
    if (this.IsStoreEmpty(RESOURCE_ENERGY))
        return ReturnCode.ERR_STORE_EMPTY
    
    return this.upgradeController(target);
    
}

Creep.prototype.TryRepairing = function (target: AnyStructure): ReturnCode | ScreepsReturnCode | CreepActionReturnCode {
    return this.repair(target);
}


Creep.prototype.TryHarvest = function (target: Source): ReturnCode | CreepActionReturnCode | ScreepsReturnCode {
    
    if (target.energy === 0) {
        return ReturnCode.ERR_TARGET_STORE_EMPTY;
    }
    
    if (this.IsStoreFull(RESOURCE_ENERGY))
        return ReturnCode.ERR_STORE_FULL;
    
    return this.harvest(target);
}

Creep.prototype.TryTransfer = function (target: AnyStoreStructure, resource: ResourceConstant): ReturnCode | CreepActionReturnCode | ScreepsReturnCode {
    
    if (target.structureType === STRUCTURE_SPAWN || target.structureType === STRUCTURE_EXTENSION) {
        if (IsEnergyFull(target))
            return ReturnCode.ERR_TARGET_STORE_FULL
    }
    
    if (IsStoreFull(target, RESOURCE_ENERGY)) {
        return ReturnCode.ERR_TARGET_STORE_FULL;
    }
    
    if (this.IsStoreEmpty(resource))
        return ReturnCode.ERR_STORE_EMPTY
    
    return this.transfer(target, resource);
}

Creep.prototype.TryBuilding = function (target: ConstructionSite): ReturnCode | ScreepsReturnCode | CreepActionReturnCode {
    
    if (this.IsStoreEmpty(RESOURCE_ENERGY))
        return ReturnCode.ERR_STORE_EMPTY
    
    
    return this.build(target);
}

Creep.prototype.TryWithdraw = function (target: AnyStoreStructure, source: ResourceConstant): ReturnCode | ScreepsReturnCode | CreepActionReturnCode {
    
    if (IsStoreEmpty(target, RESOURCE_ENERGY)) {
        return ReturnCode.ERR_TARGET_STORE_EMPTY
    }
    
    if (this.IsStoreFull(source)) {
        return ReturnCode.ERR_STORE_FULL
    }
    
    
    return this.withdraw(target, source);
}


/////////// Memory  /////////////

Creep.prototype.SetSourceID = function (id: Id<Source>): void {
    this.memory.sourceID = id;
}

Creep.prototype.SetTargetID = function (id: Id<Structure>): void {
    this.memory.targetID = id;
}

Creep.prototype.SetRenewTargetID = function (id: Id<StructureSpawn>): void {
    this.memory.renewTargetID = id;
}

Creep.prototype.GetSourceID = function (): Id<Source> | undefined {
    return this.memory.sourceID;
}

Creep.prototype.GetTargetID = function (): Id<Structure> | undefined {
    return this.memory.targetID;
}

Creep.prototype.GetRenewTargetID = function (): Id<StructureSpawn> | undefined {
    return this.memory.renewTargetID;
}


////////////////////////////////////////////////////////////////////

Creep.prototype.SetWaitingFlag = function (name: string): void {
    this.memory.waitingFlagName = name;
}

Creep.prototype.SwapPrimaryID = function (memVal: TargetIDMemory): void {
    let current: Id<Source | Creep | Structure> = memVal.primaryTargetID;
    let newres: Id<Source | Creep | Structure> = memVal?.secondaryTargetsID![0];
    memVal.secondaryTargetsID?.push(current)
}

//////////////////////////////////////////////////////////////////

Creep.prototype.FindValidBuildTarget = function (args: Search): Id<ConstructionSite> | undefined {
    
    const distance: Distance = args.distance || Distance.Any;
    const find: FindConstant = args.find || FIND_CONSTRUCTION_SITES;
    const order = args.order || [STRUCTURE_EXTENSION, STRUCTURE_TOWER, STRUCTURE_STORAGE, STRUCTURE_CONTAINER, STRUCTURE_ROAD, STRUCTURE_WALL];
    const filter = args.filter || {
        filter: (site: ConstructionSite) => {
            return order.includes(site.structureType)
        }
    };
    
    console.log("FILTER: " + JSON.stringify(filter));
    
    let orderDict: SortOrder = order.reduce((previousValue: SortOrder, currentValue: StructureConstant, currentIndex: number, array: StructureConstant[]) => {
        previousValue[currentValue] = currentIndex + 1;
        return previousValue;
    }, {});
    
    const targets: ConstructionSite[] = this.room.find(find, {
        filter: (site: ConstructionSite) => {
            return order.includes(site.structureType)
        }
    });
    console.log("BUILD TARGETS: " + JSON.stringify(targets));
    
    if (targets && targets.length > 0) {
        targets.sort((a: ConstructionSite, b: ConstructionSite) => {
            const order: { [key: string]: number } = orderDict;
            return order[a.structureType] - order[b.structureType];
        });
    } else {
        return undefined;
    }
    
    if (distance === Distance.Any) {
        if (targets && targets.length > 0) {
            return targets[0].id;
        }
    } else if (distance === Distance.Closest) {
        const closest = this.pos.findClosestByPath(targets);
        if (closest)
            return closest.id;
    }
    
    
    return undefined;
}

Creep.prototype.FindValidHarvestID = function (args: Search): Id<Source> | undefined {
    
    let result: Source | Source[] | null = null;
    
    const filter: any = {filter: (source: Source) => source.energy > 0}
    
    if (args.distance === Distance.Closest) {
        let pos = args.searchPos || this.pos;
        
        result = pos.findClosestByPath(FIND_SOURCES, filter);
        console.log("Result: " + JSON.stringify(result))
        if (result)
            return result.id;
        
    } else if (args.distance === Distance.Any) {
        result = this.room.find(FIND_SOURCES, filter)
        if (result.length > 0) return result[0]?.id;
    } else {
        console.log("Weird??")
    }
    
    return undefined;
}

Creep.prototype.FindValidTransferID = function (args: Search): Id<AnyStoreStructure> | undefined {
    
    const defaultStructures: StructureConstant[] = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION];
    
    let structuresConsts: StructureConstant[] = args.structure || defaultStructures;
    
    let orderDict: SortOrder = structuresConsts.reduce((previousValue: SortOrder, currentValue: StructureConstant, currentIndex: number, array: StructureConstant[]) => {
        previousValue[currentValue] = currentIndex + 1;
        return previousValue;
    }, {});
    
    const filter = {
        filter: (structure: Structure) => structuresConsts?.includes(structure.structureType)
    };
    //
    let targets: Structure | Structure[] | null | any = null;
    
    
    if (args.distance && args.distance === Distance.Closest) {
        let pos = args.searchPos || this.pos;
        targets = pos.findClosestByPath(args.find || FIND_STRUCTURES, {
            filter: (structure: AnyStoreStructure) =>
                structuresConsts?.includes(structure.structureType)
                && !IsStoreFull(structure, RESOURCE_ENERGY)
        });
        console.log(this.name +" closest target " + targets);
        
        if (targets) return targets.id;
    }
    
    if (args.distance && args.distance === Distance.Any || !args.distance) {
        
        targets = this.room.find(args.find || FIND_STRUCTURES, {
            filter: (structure: AnyStructure) => {
                return structuresConsts?.includes(structure.structureType)
            }
        });
        
        
        
        if (targets && targets.length > 0) {
            targets.sort((a: Structure, b: Structure) => {
                const order: { [key: string]: number } = orderDict;
                return order[a.structureType] - order[b.structureType];
            })
            
            
            targets = targets.filter((target: AnyStoreStructure) => {
                    return !IsStoreFull(target, RESOURCE_ENERGY)
            })
            
            // console.log(this.name +" Found free capacity @" + JSON.stringify(targets))
            console.log(this.name + " ************* Targets in findTargets ******" + targets);
            
            if (targets.length <= 0) return undefined;
            
            for (let i: number = 0; i < targets.length; i++) {
                // console.log("Target: " + targets[i] + " " + " capacity: " + targets[i].store.getFreeCapacity(RESOURCE_ENERGY));
                let target = targets[i];
                if (target.structureType === STRUCTURE_EXTENSION || target.structureType === STRUCTURE_SPAWN){
                    if (target.energy < target.energyCapacity) {
                        return target.id;
                    } else continue;
                }
                return target.id;
            }
        }
    }
    
    return undefined;
}

Creep.prototype.FindValidWithdrawID = function (args: Search): Id<AnyStoreStructure> | undefined {
    
    const distance: Distance = args.distance || Distance.Any;
    const find: FindConstant = args.find || FIND_STRUCTURES;
    const order = args.order || [STRUCTURE_STORAGE, STRUCTURE_CONTAINER];
    
    let orderDict: SortOrder = order.reduce((previousValue: SortOrder, currentValue: StructureConstant, currentIndex: number) => {
        previousValue[currentValue] = currentIndex + 1;
        return previousValue;
    }, {});
    
    const targets: AnyStoreStructure[] = this.room.find(find, {
        filter: (site: AnyStoreStructure) => {
            return (order.includes(site.structureType) && !IsStoreEmpty(site, RESOURCE_ENERGY))
        }
    });
    
    if (targets && targets.length > 0) {
        targets.sort((a: AnyStoreStructure, b: AnyStoreStructure) => {
            const order: { [key: string]: number } = orderDict;
            return order[a.structureType] - order[b.structureType];
        });
    } else {
        return undefined;
    }
    
    if (distance === Distance.Any) {
        if (targets && targets.length > 0) {
            return targets[0].id;
        }
    } else if (distance === Distance.Closest) {
        const closest = this.pos.findClosestByPath(targets);
        if (closest)
            return closest.id;
    }
    
    Game.rooms['sim'].controller
    
    
    return undefined
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
    this.say(WorkTable[work]);
    this.memory.currentWork = work;
}

Creep.prototype.IsWorking = function (work: WorkType): boolean {
    return this.memory.currentWork === work;
}

Creep.prototype.GetWork = function (): WorkType {
    if (this.memory.currentWork)
        return this.memory.currentWork;
    
    return WorkType.NoWork;
}

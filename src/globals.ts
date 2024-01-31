import {Distance, ReturnCode, RoleType, TaskType, WorkType} from "./Utils";

declare global {
    
    ////////////////////////////////////////////
    
    interface Memory {
        uuid: number,
        log: any,
        towers: {
            [key: string]: TowerMemory,
        }
    }
    
    interface TowerMemory {
        
        targetID?: Id<Creep>,
        repairID?: Id<AnyStructure>,
        healID?: Id<Creep>
        isAttacking: boolean,
    }
    
    interface Source {
        update (): void,
        
        _constructor: Function,
    }
    
    interface Flag {
        
    }
    
    interface StructureTower {
        memory: TowerMemory,
        
        FindNewTarget (): Id<Creep> | undefined,
        
        FindNewHealTarget (): Id<Creep> | undefined,
        
        FindNewRepairTarget (): Id<AnyStructure> | undefined,
        
        SetTarget (id: Id<Creep>): void,
        
        SetHealTarget (id: Id<Creep>): void,
        
        SetRepairTarget (id: Id<AnyStructure>): void,
        
        GetTargetID(): Id<Creep> | undefined,
        GetHealTargetID(): Id<Creep> | undefined,
        GetRepairTargetID(): Id<AnyStructure> | undefined,
    }
    
    interface Search {
        structure?: StructureConstant[],
        resource?: ResourceConstant[],
        find?: FindConstant,
        order?: any[],
        distance?: Distance,
        searchPos?: RoomPosition,
        filter?: any | undefined,
    }
    
    type SortOrder = {
        [k in StructureConstant]?: number
    }
    
    interface SpawnReq {
        role: RoleType,
        greater?: number,
        lesser?: number,
        equal?: number,
    }

    
    interface Creep {
        run (): void,
        // core creep needs
        
        CheckRenew(primaryWork: WorkType): void,
        
        TryRenew (): void,
        
        TryMove (target: Id<any> | undefined, workType: WorkType): ReturnCode | CreepActionReturnCode | ScreepsReturnCode,
        
        TryHarvest (target: Source | Mineral | Deposit): ReturnCode | CreepActionReturnCode | ScreepsReturnCode,
        
        TryTransfer (target: AnyStoreStructure, resource: ResourceConstant): ReturnCode | CreepActionReturnCode | ScreepsReturnCode,
        
        TryWithdraw (target: AnyStoreStructure, source: ResourceConstant): ReturnCode | CreepActionReturnCode | ScreepsReturnCode,
        
        TryUpgrading (target: StructureController): ReturnCode | CreepActionReturnCode | ScreepsReturnCode,
        
        TryBuilding (target: ConstructionSite): ReturnCode | ScreepsReturnCode | CreepActionReturnCode,
        
        TryRepairing (target: AnyStructure): ReturnCode | ScreepsReturnCode | CreepActionReturnCode,
        
        /////////// Memory  /////////////
        
        SetSourceID (id: Id<any>): void,
        
        GetSourceID (): Id<any> | undefined,
        
        SetTargetID (id: Id<any> | undefined): void,
        
        GetTargetID (): Id<any> | undefined,
        
        SwapPrimaryID (memVal: TargetIDMemory): void,
        
        GetRenewTargetID () : Id<StructureSpawn> | undefined,
        SetRenewTargetID(id: Id<StructureSpawn>): void,
        
        /////////////////////////////////
        
        FindValidHarvestID (args: Search): Id<Source> | undefined, // for using creep.harvest
        FindValidTransferID (args: Search): Id<Structure> | undefined,
        
        FindValidSourceID (args: Search): void, // for using creep.withdraw
        
        FindValidWithdrawID (args: Search): Id<AnyStoreStructure> | undefined,
        
        FindValidRepairID (args: Search): void,
        
        FindValidBuildTarget (args: Search): Id<ConstructionSite> | undefined,
        
        //////////////////////////////////
        
        // ResetHarvestTargetID (args: Search): void,
        //
        // ResetWithdrawTargetID (args: Search): void,
        
        //////////////////////////////////
        
        ResetMemoryEvery (memVal: keyof CreepMemory, interval: number, callback: Function | null): void,
        
        CallEvery (interval: number, callback: Function): void,
        
        //////////////////////////////////
        
        IsWorking (work: WorkType): boolean,
        
        SetWork (work: WorkType): void,
        
        GetWork (): WorkType,
        
        //////////////////////////////////
        
        IsStoreEmpty (resource: ResourceConstant): boolean,
        
        IsStoreFull (resource: ResourceConstant): boolean,
        
        //////////////////////////////////
        
        SetWaitingFlag (name: string): void,
        
        DoWaitingTick (): void,
        
        //////////////////////////////////
        
        _constructor: Function,
    }
    
    interface CreepMemory {
        role?: RoleType,
        sourceID?: Id<Source>, // where does the creep get its source?
        targetID?: Id<Structure>, // what do we perform our action on?
        renewTargetID?: Id<StructureSpawn>,
        currentWork?: WorkType,
        waitingFlagID?: string,
        waitingFlagName?: string,
        renewing?: boolean,
        _move?: {
            dest?: {
                x?: number,
                y?: number,
                room?: string,
            },
            time?: number,
            path?: number,
        },
        
        handi?: {
            pos: {x: number, y:number},
            task?: TaskType,
            targetID?: Id<Creep>,
        }
        
        harvestTarget?: TargetIDMemory,
        transferTarget?: TargetIDMemory,
        upgradeTarget?: TargetIDMemory,
        withdrawTarget?: TargetIDMemory,
        repairTarget?: TargetIDMemory,
    }
    
    interface TargetIDMemory {
        primaryTargetID: Id<Source | Creep | Structure>,
        // this list will hold source locations on the map
        // the primary will be swapped to one of these if its unreachable or empty
        secondaryTargetsID?: Id<Source | Creep | Structure>[],
    }
    
    interface StructureSpawn {
        SpawnCreep (role: RoleType, name: string, body: (string)[], opts?: SpawnOptions): ReturnCode,
        
        _constructor: Function,
    }
    
    interface IStructureDict {
        [key: string]: number;
    }
    
    namespace NodeJS {
        interface Global {
            log: any;
        }
    }
}
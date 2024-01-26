
import {Distance, ReturnCode, RoleType, WorkType} from "./Utils";

declare global {
    
    ////////////////////////////////////////////
    
    interface Memory {
        uuid: number;
        log: any;
    }
    
    interface Search {
        structure?: StructureConstant[],
        resource?: ResourceConstant[],
        find?: FindConstant,
        distance?: Distance,
        searchPos?: RoomPosition
    }
    
    
    interface Creep {
        run (): void,
        
        TryMove (target: Id<any> | undefined, workType: WorkType): ReturnCode | CreepActionReturnCode | ScreepsReturnCode,
        TryHarvest (target: Source | Mineral | Deposit): ReturnCode | CreepActionReturnCode | ScreepsReturnCode,
        TryTransfer (target: AnyStoreStructure, resource: ResourceConstant): ReturnCode | CreepActionReturnCode | ScreepsReturnCode,
        TryWithdraw (target: DepositConstructor): ReturnCode | CreepActionReturnCode| ScreepsReturnCode,
        TryUpgrading (target: StructureController): ReturnCode | CreepActionReturnCode| ScreepsReturnCode,
       
       
        /////////// Memory  /////////////
        
        SetSourceID (id: Id<any>): void,
        GetSourceID (): Id<any> | undefined,
        SetTargetID (id: Id<any> | undefined): void,
        GetTargetID (): Id<any> | undefined,
        
        /////////////////////////////////
        
        FindValidHarvestID (args: Search): Id<Source> | undefined, // for using creep.harvest
        FindValidTransferID (args: Search): Id<Structure> | undefined,
        FindValidSourceID (args: Search): void, // for using creep.withdraw
        FindValidWithdrawID (args: Search): void,
        FindValidRepairID (args: Search): void,
        FindValidTargetID (args: Search): void, // to be overridden in classes
        
        //////////////////////////////////
        
        ResetMemoryEvery (memVal: string, interval: number): void,
        
        //////////////////////////////////
        
        IsWorking (work: WorkType): boolean,
        SetWork (work: WorkType): void,
        GetWork (): WorkType,
        
        //////////////////////////////////
        IsStoreEmpty (resource: ResourceConstant): boolean,
        IsStoreFull (resource: ResourceConstant): boolean,
        
        //////////////////////////////////
        
        SetWaitingFlag(name: string): void,
        
        //////////////////////////////////
        
        _constructor: Function,
    }
    
    
    interface CreepMemory {
        role?: RoleType,
        sourceID?: Id<Source>, // where does the creep get its source?
        targetID?: Id<Structure>, // what do we perform our action on?
        currentWork?: WorkType,
        waitingFlagId?: RoomPosition,
    }
    
    interface StructureSpawn {
        SpawnCreep (role: RoleType, name: string, body: (string)[], opts?: SpawnOptions): ReturnCode,
        
        _constructor: Function,
    }
    
    namespace NodeJS {
        interface Global {
            log: any;
        }
    }
}
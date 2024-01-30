import {Distance, ReturnCode, WorkType} from "Utils";

export class RoleBuilder extends Creep {
    
    private sourceOrder = [STRUCTURE_STORAGE, STRUCTURE_CONTAINER];
    
    private searchAgrs: Search = {
        find: FIND_CONSTRUCTION_SITES, distance: Distance.Any,
        order: [STRUCTURE_EXTENSION, STRUCTURE_TOWER, STRUCTURE_STORAGE, STRUCTURE_CONTAINER, STRUCTURE_ROAD, STRUCTURE_WALL],
        
    }
    
    constructor (id: Id<Creep>) {
        super(id);
        
        this.searchAgrs['filter'] = {
            filter: (structure: Structure) => {
                return this.searchAgrs.order?.includes(structure.structureType)
            }
        }
    }
    
    private ResetTargetID (): void {
        let target = this.FindValidBuildTarget(this.searchAgrs);
        console.log("Builder targets " + JSON.stringify(target));
        if (target) {
            this.SetTargetID(target);
        } else {
            console.log(this.name + " has no valid target..");
            
            
            // do repair on walls up to 5k, the
            let walls = this.room.find(FIND_STRUCTURES, {
                filter: (struct: AnyStructure) => {
                    return (struct.structureType === STRUCTURE_WALL && struct.hits <= 5000)
                }
            });
            if (walls && walls.length > 0) {
                this.SetWork(WorkType.Repairing);
                this.SetTargetID(walls[0].id);
                return;
            }
            
            this.SetWork(WorkType.NoWork)
        }
    }
    
    private ResetSourceID (): void {
        let target = this.FindValidWithdrawID({});
        console.log("Source ID Target " + JSON.stringify(target))
        if (target)
            this.SetSourceID(target);
        else
            console.log("No source id for " + this.name);
    }
    
    run (): void {
        
        if (!this.memory.currentWork)
            this.SetWork(WorkType.Withdrawing)
        
        if (!this.GetTargetID())
            this.ResetTargetID()
        
        if (!this.GetSourceID())
            this.ResetSourceID()
        
        
        if (!this.memory.waitingFlagName) {
            this.SetWaitingFlag('waiting')
        }
        
        if (this.IsWorking(WorkType.NoWork)) {
            this.CallEvery(15, () => {
                this.SetWork(WorkType.Withdrawing);
                this.ResetSourceID();
            });
            
            this.moveTo(Game.flags[this.memory.waitingFlagName!].pos);
            return;
        }
        
        // this.CheckRenew(WorkType.Building);
        
        let targetOfAction = this.GetTargetID();
        
        if (this.GetWork() === WorkType.Withdrawing)
            targetOfAction = this.GetSourceID();
        
        if (this.GetWork() === WorkType.Repairing)
            targetOfAction = this.GetTargetID();
        
        
        let actionResult: ReturnCode | ScreepsReturnCode | CreepActionReturnCode = ERR_INVALID_TARGET;
        // if no energy, get energy from storage, container, source if needed
        // if have energy find valid buildable target 
        
        
        if (targetOfAction) {
            
            actionResult = this.TryMove(targetOfAction, this.GetWork())
        } else {
            this.ResetTargetID();
        }
        
        if (actionResult === ERR_INVALID_TARGET) {
            
            this.ResetTargetID()
            
        } else if (actionResult === ReturnCode.ERR_STORE_FULL) {
            
            this.SetWork(WorkType.Building)
            
        } else if (actionResult === ReturnCode.ERR_STORE_EMPTY) {
            
            this.SetWork(WorkType.Withdrawing);
        } else if (actionResult === ReturnCode.ERR_TARGET_STORE_EMPTY) {
            this.ResetSourceID();
            
        } else if (actionResult === ERR_NOT_ENOUGH_ENERGY) {
            this.SetWork(WorkType.Withdrawing)
        }
        
    }
}
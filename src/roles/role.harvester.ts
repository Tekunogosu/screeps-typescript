import {Distance, ReturnCode, WorkType} from "../Utils";
import "globals";


export class RoleHarvester extends Creep {
    
    constructor (id: Id<Creep>) {
        super(id);
    }
    
    private ResetHarvestID () {
        if (!this) {
            console.log("Im not alive?????");
            return;
        }
        let harvestID: Id<Source> | undefined = this.FindValidHarvestID({distance: Distance.Closest});
        // console.log("Reset: " + harvestID);
        if (harvestID) {
            if (this.GetWork() === WorkType.NoWork) this.SetWork(WorkType.Harvesting)
            this.SetSourceID(harvestID);
            return
        } else
            console.log("no valid source id set.. go to wait point or do something else");
        
        this.SetWork(WorkType.NoWork);
    }
    
    private ResetTargetID () {
        if (!this) {
            console.log("Im not alive?????");
            return;
        }
        let transferTargetID: Id<Structure> | any = this.FindValidTransferID({
            find: FIND_STRUCTURES,
            structure: [STRUCTURE_STORAGE, STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER, STRUCTURE_TOWER],
            distance: Distance.Closest,
        });
        
        if (transferTargetID) {
            if (this.GetWork() === WorkType.NoWork) this.SetWork(WorkType.Transferring)
            // console.log(this.name + " FOUND: + " + JSON.stringify(transferTargetID));
            this.SetTargetID(transferTargetID);
            return;
        } else {
            console.log("tried setting a new target but got " + transferTargetID)
        }
        
        this.SetWork(WorkType.NoWork);
    }
    
    run () {
        
        // // seed the start, 
        if (!this.memory.currentWork)
            this.SetWork(WorkType.Harvesting)
        
        if (!this.memory.waitingFlagName) {
            console.log("Resetting")
            this.SetWaitingFlag('waiting')
        }
        
        // Check for updated target every 30 ticks
        this.CallEvery(30, () => {
            this.ResetTargetID();
        });
        
        if (this.IsWorking(WorkType.NoWork)) {
            
            this.CallEvery(15, () => {
                this.SetWork(WorkType.Harvesting)
                this.ResetHarvestID()
            });
            
            this.moveTo(Game.flags[this.memory.waitingFlagName!].pos)
        }
        
        
        let returnCode: ReturnCode | CreepActionReturnCode | ScreepsReturnCode = ERR_INVALID_TARGET;
        
        let targetOfAction: Id<any> | undefined = undefined;
        
        if (this.IsWorking(WorkType.Harvesting)) {
            if (!this.GetSourceID())
                this.ResetHarvestID();
            
            targetOfAction = this.GetSourceID()!;
            
        } else if (this.IsWorking(WorkType.Transferring)) {
            
            if (!this.GetTargetID())
                this.ResetTargetID();
            
            console.log("Has ID " + this.GetTargetID());
            targetOfAction = this.GetTargetID()!;
        }
        
        if (targetOfAction) {
            // do action or move
            returnCode = this.TryMove(targetOfAction!, this.GetWork());
            // console.log("Action result: " + returnCode);
            
            if (returnCode === ERR_INVALID_TARGET) {
                if (this.IsWorking(WorkType.Harvesting))
                    this.ResetHarvestID();
                
                else if (this.IsWorking(WorkType.Transferring))
                    this.ResetTargetID();
                
            }
            
            if (this.IsWorking(WorkType.Harvesting)) {
                if (returnCode === ReturnCode.ERR_STORE_FULL)
                    this.SetWork(WorkType.Transferring);
                
                if (returnCode === ReturnCode.ERR_TARGET_STORE_FULL)
                    this.ResetHarvestID();
                
                if (returnCode === ReturnCode.ERR_TARGET_STORE_EMPTY)
                    this.ResetHarvestID();
                
                if (returnCode === ERR_NO_PATH)
                    this.ResetHarvestID();
                
                // if target source is empty or unreachable, look for another source
            } else if (this.IsWorking(WorkType.Transferring)) {
                console.log("Work: Transferring: code: " + returnCode);
                console.log("Getting new transfer target")
                
                if (returnCode === ReturnCode.ERR_TARGET_STORE_FULL)
                    this.ResetTargetID();
                
                if (returnCode === ReturnCode.ERR_STORE_EMPTY)
                    this.SetWork(WorkType.Harvesting);
                
                if (returnCode === ERR_NOT_ENOUGH_ENERGY)
                    this.SetWork(WorkType.Harvesting);
            }
        }
    }
    
}

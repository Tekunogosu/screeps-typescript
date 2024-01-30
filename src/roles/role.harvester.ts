import {Distance, ReturnCode, WorkType} from "../Utils";
import "globals";


export class RoleHarvester extends Creep {
    
    constructor (id: Id<Creep>) {
        super(id);
    }
    
    private ResetHarvestID () {
        if (!this) {
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
            return;
        }
        
        let transferTargetID: Id<Structure> | any = this.FindValidTransferID({
            find: FIND_STRUCTURES,
            structure: [STRUCTURE_STORAGE, STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER, STRUCTURE_TOWER],
            distance: Distance.Any,
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
            this.SetWaitingFlag('waiting')
        }
        
        // Check for updated target every 30 ticks
        this.CallEvery(15, () => {
            this.ResetTargetID();
        });
        
        this.CallEvery(30, () => {
            this.ResetHarvestID(); // make sure we are getting the best source 
        });
        
        if (this.IsWorking(WorkType.NoWork)) {
            
            this.CallEvery(15, () => {
                this.SetWork(WorkType.Harvesting)
                this.ResetHarvestID()
            });
            
            this.moveTo(Game.flags[this.memory.waitingFlagName!].pos)
        }
        
        if(this.ticksToLive! <= 200) {
            this.memory.renewing = true;
        }
        
        if (this.memory.renewing) {
            console.log(this.name +" is renewing")
            let spawn =this.room.find(FIND_MY_SPAWNS);
            if (spawn && spawn.length > 0){
                if(spawn[0].renewCreep(this) === ERR_NOT_IN_RANGE)
                    this.moveTo(spawn[0]);
            }
            
            if (this.ticksToLive! >= 1400)
                this.memory.renewing = false;
        }
        
        
        //this.CheckRenew(WorkType.Harvesting);
        
        let returnCode: ReturnCode | CreepActionReturnCode | ScreepsReturnCode = ERR_INVALID_TARGET;
        
        let targetOfAction: Id<any> | undefined = undefined;
        
        if (this.IsWorking(WorkType.Harvesting)) {
            if (!this.GetSourceID())
                this.ResetHarvestID();
            
            targetOfAction = this.GetSourceID()!;
            
        } else if (this.IsWorking(WorkType.Transferring)) {
            
            if (!this.GetTargetID())
                this.ResetTargetID();
            
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
                
                if (returnCode === ReturnCode.ERR_TARGET_STORE_EMPTY||
                    returnCode === ERR_INVALID_TARGET ||
                    returnCode === ERR_NO_PATH) {
                    
                    this.ResetHarvestID();
                }
                
                
                // if target source is empty or unreachable, look for another source
            } else if (this.IsWorking(WorkType.Transferring)) {
                if (returnCode === ReturnCode.ERR_TARGET_STORE_FULL || 
                    returnCode === ERR_INVALID_TARGET)
                    this.ResetTargetID();
                
                if (returnCode === ReturnCode.ERR_STORE_EMPTY || 
                    returnCode === ERR_NOT_ENOUGH_ENERGY)
                    this.SetWork(WorkType.Harvesting);
            }
        }
    }
    
}

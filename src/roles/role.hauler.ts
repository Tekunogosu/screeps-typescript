import "../globals";
import {Distance, ReturnCode, WorkTable, WorkType} from "../Utils";

export class RoleHauler extends Creep {
    
    constructor (id: Id<Creep>) {
        super(id);
    }
    
  
    private ResetSourceTarget(): void {
        let target = this.FindValidWithdrawID({
            distance: Distance.Closest, order: [STRUCTURE_STORAGE, STRUCTURE_CONTAINER], find: FIND_STRUCTURES,
            structure: [STRUCTURE_STORAGE, STRUCTURE_CONTAINER],
        });
        
        console.log(this.name + " ******* sourceTarget: "+target)
        
        if (target) {
            this.SetSourceID(target);
            console.log("hauler found: " + target);
            return
        }
        
        // no withdraw target, go and wait
        // TODO: creeps need to have a backup, but haulers don't have any work parts, just move and carry maybe tough?
        this.SetWork(WorkType.NoWork);
    }
    
    private ResetTransferTarget = () => {
        let target = this.FindValidTransferID({
            find: FIND_STRUCTURES, order: [STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_EXTENSION],
            structure: [STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_EXTENSION],
        });
        
        console.log(this.name + " *********** transferTarget: " + target)
        
        if (target) {
            this.SetTargetID(target);
            console.log("Hauler found transfer location")
            return;
        }
        
        console.log("Haler couldn't find a valid transfer location, going to wait...");
        this.SetWork(WorkType.NoWork)
    }
    
    run (): void {
        if (!this.memory.currentWork)
            this.SetWork(WorkType.Withdrawing)
        
        if (!this.memory.waitingFlagName) {
            this.SetWaitingFlag('waiting')
        }
        
        if (this.IsWorking(WorkType.NoWork)) {
            this.CallEvery(15, () => {
                this.SetWork(WorkType.Withdrawing);
                this.ResetSourceTarget();
            });
            
            this.moveTo(Game.flags[this.memory.waitingFlagName!].pos);
            return;
        }
        
        
        let actionTarget = undefined;
        
        if (this.GetWork() === WorkType.Withdrawing) {
            if (!this.GetSourceID())
                this.ResetSourceTarget()
            
            actionTarget = this.GetSourceID();
        } else if (this.GetWork() === WorkType.Transferring) {
            if (!this.GetTargetID())
                this.ResetTransferTarget()
            
            actionTarget = this.GetTargetID();
        }
        
        console.log(this.name+" current target: "+actionTarget);
        
        if (actionTarget) {
            const actionCode = this.TryMove(actionTarget, this.GetWork());
            
            if (actionCode === ERR_INVALID_TARGET) {
                console.log(this.name + " can't find a valid location for : " + WorkTable[this.GetWork()])
                
            } else if (this.GetWork() === WorkType.Transferring) {
                if (actionCode === ReturnCode.ERR_STORE_EMPTY)
                    this.SetWork(WorkType.Withdrawing)
                
                if (actionCode === ReturnCode.ERR_TARGET_STORE_FULL) {
                    this.ResetTransferTarget()
                }
            } else if (this.GetWork() === WorkType.Withdrawing) {
                if (actionCode === ReturnCode.ERR_STORE_FULL)
                    this.SetWork(WorkType.Transferring)
                
                if (actionCode === ReturnCode.ERR_TARGET_STORE_EMPTY)
                    this.ResetSourceTarget()
            }
        } else {
            console.log(this.name + " has no target for work: "+WorkTable[this.GetWork()]);
        }
        
       
        
        
    }
}
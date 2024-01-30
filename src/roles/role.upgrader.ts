import "../globals";
import "../Utils";
import {ReturnCode, WorkType} from "../Utils";


export class RoleUpgrader extends Creep {
    
    constructor (id: Id<Creep>) {
        super(id);
    }
    
    private ResetSourceID(): void {
        let target = this.FindValidWithdrawID({})
        if (target)
            this.SetSourceID(target);
    }
    
    run(): void {
        if (!this.memory.currentWork)
            this.SetWork(WorkType.Withdrawing)
       
        if(!this.GetTargetID()) {
            this.SetTargetID(this.room.controller!.id);
        }
        
        if (!this.GetSourceID()){
           this.ResetSourceID();
        }
        
        // this.CheckRenew(WorkType.Upgrading);
        
        
        let returnCode: ReturnCode | CreepActionReturnCode | ScreepsReturnCode = ERR_INVALID_TARGET;
        
        let targetOfAction: Id<any> | undefined = undefined;
        
        if (this.GetWork() === WorkType.Upgrading)
            targetOfAction = this.GetTargetID();
        
        if (this.GetWork() === WorkType.Withdrawing)
            targetOfAction = this.GetSourceID();
        
        if (targetOfAction) {
            let t = Game.getObjectById(targetOfAction)
            if (t) {
                returnCode = this.TryMove(targetOfAction, this.GetWork());
                console.log("Return code: " + returnCode)
            }
        }
        
        if(returnCode === ERR_INVALID_TARGET)
            console.log('Invalid upgrade target...');
        else if(returnCode === ReturnCode.ERR_STORE_FULL)
            this.SetWork(WorkType.Upgrading);
        else if (returnCode === ReturnCode.ERR_STORE_EMPTY)
            this.SetWork(WorkType.Withdrawing);
        else if (returnCode === ReturnCode.ERR_TARGET_STORE_EMPTY) 
            this.ResetSourceID();
        
    }
}
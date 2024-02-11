import "../globals"
import "../Utils"
import {Distance, TaskType, WorkType} from "../Utils";

const enum FlagConfig {
    Collect = "collect:",
    
}

export class RoleHandi extends Creep {
    
    constructor (id: Id<Creep>) {
        super(id);
    }
    
    private GetTaskType (): TaskType | undefined {
        return this.memory.handi?.task;
    }
    
    private SetTaskType (task: TaskType): void {
        this.memory.handi!.task = task;
    }
    
    private ResetTarget() : void {
        // where to transfer
        
        let targets = this.FindValidTransferID({
            find: FIND_STRUCTURES, distance: Distance.Any, structure: [STRUCTURE_STORAGE]
        });
        
        if (targets && targets.length > 0) {
            // let target: Id<Structure> = targets[0];
            // this.SetTargetID()
        }
    }
    
    private ResetSource() : void {
        // where to collect
        
    }
    
    run (): void {
        
        if (!this.memory.currentWork)
            this.SetWork(WorkType.NoWork)
        
        if (this.GetWork() === WorkType.NoWork) {
            
            if (!this.memory.waitingFlagName) {
                this.memory.waitingFlagName = "waiting";
            }
            
            let flag = Game.flags[this.memory.waitingFlagName];
            if (flag) {
                this.moveTo(flag.pos)
            }
        }
        
        
        
       
        
    }
}
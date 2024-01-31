import "../globals"
import "../Utils"
import {IsStoreEmpty, TaskType, WorkType} from "../Utils";
import _ from "lodash";

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
        
        if (!this.memory.handi) {
            this.memory.handi = {
                pos: {x: 0, y: 0},
                task: TaskType.none,
            }
        }
        
        if (this.memory.handi) {
            
            this.room.find(FIND_TOMBSTONES, {
                filter: (tomb) => {
                    if (IsStoreEmpty(tomb, RESOURCE_ENERGY)) {
                        
                    }
                    let code = this.withdraw(tomb, RESOURCE_ENERGY
                        || RESOURCE_GHODIUM_OXIDE || RESOURCE_KEANIUM_OXIDE
                        || RESOURCE_ZYNTHIUM_HYDRIDE || RESOURCE_UTRIUM_HYDRIDE);
                    
                    if (code === ERR_NOT_IN_RANGE)
                        this.moveTo(tomb.pos)
              
                }
            });
            
            
            if (this.memory.handi.task === TaskType.move) {
                if (this.memory.handi.pos) {
                    let p = this.memory.handi.pos;
                    let pos = new RoomPosition(p.x, p.y, this.room.name)
                    this.moveTo(pos)
                }
                
            }
        }
        
    }
}
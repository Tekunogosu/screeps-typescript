import {WorkType} from "Utils"


class RoleAttacker extends Creep {
    
    constructor (id: Id<Creep>) {
        super(id);
    }
    
    private attackRoom: string = "W54N32"
    
    run(): void {
        let mem : SortieMemory= this.memory;
        
        if (!this.memory.currentWork)
            this.SetWork(WorkType.Sortie)
        
        // Check for sortie flag and gather, when it cannot find the flag, go to the room and do the combat and stuff
        if (!mem.startSortie)
            mem.startSortie = false;
        
        if (!mem.sortieRoom) {
            Ga
        }
        
        let sortieFlag = "sortie"
        if (Game.flags[sortieFlag]) {
            this.moveTo(Game.flags[sortieFlag])
        }
        
        // make sure in the correct room
        // look for enemies, if we have more creeps, go and attack. 
        
    }
    
}
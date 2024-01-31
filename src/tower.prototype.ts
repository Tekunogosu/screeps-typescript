import "./globals";
import {Distance, CallEvery} from "Utils";


StructureTower.prototype.SetTarget = function (id: Id<Creep>): void {
    Memory.towers[this.id].targetID = id;
}
StructureTower.prototype.SetHealTarget = function (id: Id<Creep>): void {
    Memory.towers[this.id].healID = id;
}
StructureTower.prototype.SetRepairTarget = function (id: Id<AnyStructure>): void {
    Memory.towers[this.id].repairID = id;
}

StructureTower.prototype.GetTargetID = function (): Id<Creep> | undefined {
    return Memory.towers[this.id].targetID || undefined;
}
StructureTower.prototype.GetHealTargetID = function (): Id<Creep> | undefined {
    return Memory.towers[this.id].healID;
}
StructureTower.prototype.GetRepairTargetID = function (): Id<AnyStructure> | undefined {
    return Memory.towers[this.id].repairID;
}

StructureTower.prototype.FindNewTarget = function (): Id<Creep> | undefined {
    
    const target: Creep[] | undefined = this.room.find(FIND_HOSTILE_CREEPS);
    
    if (target && target.length > 0) {
        
        this.SetTarget(target[0].id);
        return target[0].id;
        
    }
    
    return undefined;
}
StructureTower.prototype.FindNewHealTarget = function (): Id<Creep> | undefined {
    
    return undefined;
}
StructureTower.prototype.FindNewRepairTarget = function (): Id<AnyStructure> | undefined {
 
    const target: AnyStructure[] | undefined = this.room.find(FIND_STRUCTURES, {
        filter: (structure: Structure) => {
            return ((structure.hits < (structure.hitsMax / 1.25)) && structure.structureType !== STRUCTURE_WALL);
        }
    })
    
    if(target && target.length > 0) {
        this.SetRepairTarget(target[0].id);
        return target[0].id;
    }
    
    return undefined;
}


export class Tower extends StructureTower {
    constructor (id: Id<StructureTower>) {
        super(id);
    }
    
    public DoRepair (): void {
        if (Memory.towers[this.id].isAttacking) return;
        let target = this.GetRepairTargetID();
        if(target) {
            let repair = Game.getObjectById(target);
            if (repair) {
                let code = this.repair(repair);
                console.log("Repair code: "+code);
                
                if(repair?.hits >= repair?.hitsMax){
                    delete Memory.towers[this.id].repairID;
                }
            }
            
            
        }
        target = this.FindNewRepairTarget();
        if (!target){
            console.log("No target found: ...")
            delete Memory.towers[this.id].repairID;
        }
        
    }
    
    private DoAttack (room: Room): void {
        let target: Id<Creep> | undefined = this.GetTargetID();
        if (target) {
            let attack = Game.getObjectById(target);
            if (attack) {
                Memory.towers[this.id].isAttacking = true;
                let attackCode = this.attack(attack);
                console.log("Attack code: " + attackCode);
                return;
            }
        }
        target = this.FindNewTarget();
        if (!target) {
            Memory.towers[this.id].isAttacking = false;
            console.log("No target found: ...")
            delete Memory.towers[this.id].targetID;
        }
    }
    
    private DoHeal (): void {
        
    }
    
    private Init (): void {
        if (!Memory.towers[this.id]) {
            Memory.towers[this.id] = {} as TowerMemory;
            Memory.towers[this.id].isAttacking = false;
        }
    }
    
    run (room: Room): void {
        
        this.Init();
        
        this.DoAttack(room);
        this.DoHeal();
        this.DoRepair();
    }
}
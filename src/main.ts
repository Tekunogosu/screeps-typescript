import {ErrorMapper} from "utils/ErrorMapper";
import "./globals";
import "./creep.prototype";

import {CreepCount, generateUUID, GetFlagConfig, ReturnCode, RoleType} from "./Utils";
import {RoleHarvester} from "./roles/role.harvester";
import {RoleBuilder} from "./roles/role.builder";

import "memory.prototype";

import _ from "lodash";
import {Tower} from "./tower.prototype";
import {RoleUpgrader} from "./roles/role.upgrader";
import {RoleHauler} from "./roles/role.hauler";
import {RoleHandi} from "./roles/role.handi";

StructureSpawn.prototype.SpawnCreep = function (role, name, body: BodyPartConstant[], opts): ReturnCode {
    if (name)
        name += generateUUID();
    else
        name = role + generateUUID();
    
    if (CalcBodyCost(body) >= 1000)
        name += "XL";
    
    return this.spawnCreep(body, name, {...opts, memory: {role: role}})
}

const ClearStaleMemory = (): void => {
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }
};

const Spawner = function (role: RoleType, body: BodyPartConstant[], spawnRequirements: boolean = true, name: string = ""): ReturnCode {
    if (spawnRequirements) {
        let spawn = Game.spawns["Gothic Queen"]
       
        return spawn.SpawnCreep(role, name, body);
    } else 
        return ReturnCode.ERR_SPAWN_CONDITIONS_NOT_MET;
}

const print = function (thing: any) {
    console.log(JSON.stringify(thing));
}
const SetupTowersInMemory = function () : void {
    if (!Memory.towers) {
        Memory['towers'] = {};
        if (Memory.towers) {
            _.forEach(Game.structures, (struct: Structure) => {
                if (struct.structureType === STRUCTURE_TOWER) {
                    Memory.towers[struct.id] = {isAttacking: false};
                }
            })
        }
    }
}

const CalcBodyCost = function (body: BodyPartConstant[]): number {
    let total = 0;
    body.forEach(bp => {
        switch (bp) {
            case WORK:
                total += 100;
                break;
            case MOVE:
            case CARRY:
                total += 50;
                break;
        }
    });
    
    return total;
}

export const primaryRoom = 'W53N32';
export const loop = ErrorMapper.wrapLoop(() => {
    // console.log(`Current game tick is ${Game.time}`);
    
    if (Game.cpu.bucket === 10000)
        Game.cpu.generatePixel()
    
    if (!Game.flags['waiting']) {
        console.log("***********CREATE WAITING FLAG********")
        return;
    }
    
    SetupTowersInMemory();
    ClearStaleMemory();
    
    GetFlagConfig("WallConfig:");
    
    const towers = Game.rooms[primaryRoom].find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});

    if (towers){
        _.forEach(towers, (tower: StructureTower) => {

            let t = new Tower(tower.id);
            t.run(Game.rooms[primaryRoom]);
        });
    }
    
    Game.rooms[primaryRoom].visual.text("Harvesters: "+CreepCount(RoleType.Harvester), 12 ,12, {align: 'left',
        strokeWidth: 0.15,
        stroke: "#b95faa",
        color: "#000"
    })
    Game.rooms[primaryRoom].visual.text("Builders: "+CreepCount(RoleType.Builder), 12 ,13, {align: 'left',
        strokeWidth: 0.15,
        stroke: "#b95faa",
        color: "#000"
    })
    Game.rooms[primaryRoom].visual.text("Haulers: "+CreepCount(RoleType.Hauler), 12 ,14, {align: 'left',
        strokeWidth: 0.15,
        stroke: "#b95faa",
        color: "#000"
    })
    Game.rooms[primaryRoom].visual.text("Upgraders: "+CreepCount(RoleType.Upgrader), 12 ,15, {align: 'left',
        strokeWidth: 0.15,
        stroke: "#b95faa",
        color: "#000"
    })
    
    Game.rooms[primaryRoom].visual.text("CPU Bucket: "+Game.cpu.bucket, 12 ,19, {align: 'left',
        strokeWidth: 0.15,
        stroke: "#a203ff",
        color: "#000"})
    Game.rooms[primaryRoom].visual.text("CPU: "+Game.cpu.getUsed().toFixed(5), 12 ,20, {
        align: 'left', strokeWidth: 0.1, stroke: "#46a296", color: "#000",
    })
    
    // carry = 50, work = 100, move = 50
    
    
    //// Spawn Harvesters
    
    // if we have X amount of energy stored in spawn + extensions, spawn big harvester
    // have tier ?? 200, 500, 1000?
    
    
    //// Spawn Builders
    
    
    
    //// Spawn Upgraders
    

    if (CreepCount(RoleType.Harvester) < 4) {
        console.log(Spawner(RoleType.Harvester, 
            [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE]
            // [WORK, WORK, CARRY, CARRY, MOVE, MOVE]
        ));
    }

    if (CreepCount(RoleType.Builder) < 1) {
        console.log(Spawner(RoleType.Builder, [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], 
            CreepCount(RoleType.Harvester) >= 2 && CreepCount(RoleType.Upgrader) >= 2));
    }

    if (CreepCount(RoleType.Upgrader) < 2) {
        console.log(Spawner(RoleType.Upgrader, [WORK, WORK, WORK, WORK,CARRY, CARRY, MOVE, MOVE]), CreepCount(RoleType.Harvester) >= 3);
    }
   
    if (CreepCount(RoleType.Hauler) < 2) {
        console.log(Spawner(RoleType.Hauler, 
            [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
            // [CARRY, CARRY, CARRY, MOVE, MOVE]
        ));
    }
    
    if(CreepCount(RoleType.Handi) < 0) {
        console.log(Spawner(RoleType.Handi, [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]), CreepCount(RoleType.Harvester) > 2);
    }
    
    for (const name in Game.creeps) {
        let creep: Creep = Game.creeps[name];
        
        let role: RoleType | undefined = creep.memory.role;
        let job = undefined;
        
        switch (role) {
            case RoleType.Harvester: job = new RoleHarvester(creep.id) 
                break;
            case RoleType.Builder: job = new RoleBuilder(creep.id)
                break;
            case RoleType.Upgrader: job = new RoleUpgrader(creep.id)
                break;
            case RoleType.Hauler: job = new RoleHauler(creep.id)
                break;
            case RoleType.Handi: job = new RoleHandi(creep.id)
                break;
        }
        
        if (job) 
            job.run();
    }
});

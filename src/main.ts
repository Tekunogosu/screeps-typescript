import {ErrorMapper} from "utils/ErrorMapper";
import "./globals";
import "./creep.prototype";

import {generateUUID, ReturnCode, RoleType} from "./Utils";
import {RoleHarvester} from "./roles/role.harvester";
import {RoleBuilder} from "./roles/role.builder";

import  "memory.prototype";

import _ from "lodash";

StructureSpawn.prototype.SpawnCreep = function (role, name, body, opts): ReturnCode {
    if (name)
        name += generateUUID();
    else
        name = role + generateUUID();
    
    return this.spawnCreep([WORK, CARRY, MOVE], name, {...opts, memory: {role: role}})
}


const ClearStaleMemory = (): void => {
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }
};

const SpawnTester = function (role: RoleType, body: BodyPartConstant[] = [WORK, CARRY, MOVE],name: string = ""): ReturnCode {
    let spawn = Game.spawns["Gothic Queen"]
    return spawn.SpawnCreep(role, name, body);
}


const print = function (thing: any) {
    console.log(JSON.stringify(thing));
}


const CreepCount = function (role: RoleType): number {
    return _.filter(Game.creeps, (creep) => creep.memory.role === role).length
}

const SetupTowersInMemory = function () : void {
    if (!Memory.towers) {
        Memory['towers'] = {};
        if (Memory.towers) {
            _.forEach(Game.structures, (struct: Structure) => {
                if (struct.structureType === STRUCTURE_TOWER) {
                    Memory.towers[struct.id] = {};
                }
            })
        }
    }
}


export const loop = ErrorMapper.wrapLoop(() => {
    // console.log(`Current game tick is ${Game.time}`);
    
    if (!Game.flags['waiting']) {
        console.log("***********CREATE WAITING FLAG********")
        return;
    }
    
    SetupTowersInMemory();
    
    ClearStaleMemory();
    
    Game.rooms["sim"].visual.text("Harvesters: "+CreepCount(RoleType.Harvester), 21 ,28, {align: 'left'})
    
    // carry = 50
  
    if (CreepCount(RoleType.Harvester) < 2) {
        console.log(SpawnTester(RoleType.Harvester));
    }
    
    if (CreepCount(RoleType.Builder) < 2) {
        console.log(SpawnTester(RoleType.Builder, [WORK, WORK, CARRY, MOVE]));
    }
  
    
    
    for (const name in Game.creeps) {
        let creep: Creep = Game.creeps[name];
        
        if (creep.neededRenew())
            return;
        let role: RoleType | undefined = creep.memory.role;
        
        if (creep.memory.role === RoleType.Harvester) {
            let harvester: RoleHarvester = new RoleHarvester(creep.id);
            if (harvester)
                harvester.run();
        } else if (creep.memory.role === RoleType.Builder) {
            let builder: RoleBuilder = new RoleBuilder(creep.id);
            if (builder)
                builder.run();
        }
    }
});

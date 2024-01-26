import {ErrorMapper} from "utils/ErrorMapper";

import "./globals";
import "./creep.prototype";

import {Distance, generateUUID, RoleType, WorkType, ReturnCode} from "./Utils";
import {RoleHarvester} from "./roles/role.harvester";

import _ from "lodash";



StructureSpawn.prototype.SpawnCreep = function (role, name, body, opts): ReturnCode {
    if (name)
        name += generateUUID();
    else
        name = role + generateUUID();
    
    return this.spawnCreep([WORK, MOVE, CARRY], name, {...opts, memory: {role: role}})
}


const ClearStaleMemory = (): void => {
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }
};

const SpawnTester = function (role: RoleType, name: string = ""): ReturnCode {
    let spawn = Game.spawns["Gothic Queen"]
    return spawn.SpawnCreep(role, name, [WORK, CARRY, MOVE]);
}


const print = function (thing: any) {
    console.log(JSON.stringify(thing));
}

const CreepCount = function (role: RoleType): number {
    return _.filter(Game.creeps, (creep) => creep.memory.role === role).length
}

export const loop = ErrorMapper.wrapLoop(() => {
    // console.log(`Current game tick is ${Game.time}`);
    
    ClearStaleMemory();
    
    // let newSpan = SpawnTester(RoleType.Harvester);
    // console.log(newSpan);
    
    if (CreepCount(RoleType.Harvester) < 2) {
        console.log(SpawnTester(RoleType.Harvester));
    }
    
    
    for (const name in Game.creeps) {
        let creep: Creep = Game.creeps[name];
        
        let role: RoleType | undefined = creep.memory.role;
        
        if (creep.memory.role === RoleType.Harvester) {
            let harvester = new RoleHarvester(creep.id);
            harvester.run();
        }
        
    }
});

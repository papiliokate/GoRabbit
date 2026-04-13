import { TimeService } from '../src/time_service.js';
import { GameMode } from '../src/game.js';
import { Random } from '../src/random.js';
import { Generator } from '../src/generator.js';

function simulateDate(isoString) {
    const simDate = new Date(isoString);
    let ms = simDate.getTime();
    
    const adjustedDate = new Date(ms - 60000);
    TimeService.currentUtcDateStr = adjustedDate.toISOString().split('T')[0];
    return TimeService.currentUtcDateStr;
}

function getMapForTimeAndDiff(isoString, diff) {
    const seedDateStr = simulateDate(isoString);
    if (diff !== 'tutorial') {
        Random.setSeed(seedDateStr + "-" + diff);
    } else {
        Random.setSeed(null);
    }
    
    if (diff === 'tutorial') {
        return "TUTORIAL_FIXED_MAP";
    } else {
        const gen = Generator.generate(diff, true);
        return gen.map.map(r => r.join('')).join('\n');
    }
}

const t1 = "2026-04-14T23:59:00Z";
const t2 = "2026-04-15T00:00:30Z";
const t3 = "2026-04-15T00:01:30Z";

const mapSmall_t1 = getMapForTimeAndDiff(t1, 'small');
const mapSmall_t2 = getMapForTimeAndDiff(t2, 'small');
const mapSmall_t3 = getMapForTimeAndDiff(t3, 'small');

const mapTut_t1 = getMapForTimeAndDiff(t1, 'tutorial');
const mapTut_t2 = getMapForTimeAndDiff(t2, 'tutorial');
const mapTut_t3 = getMapForTimeAndDiff(t3, 'tutorial');

console.log("T1 -> T2 (23:59 -> 00:00): Map should NOT change.");
console.log("Same?", mapSmall_t1 === mapSmall_t2 ? "YES" : "NO");

console.log("T2 -> T3 (00:00 -> 00:01): Map SHOULD change.");
console.log("Different?", mapSmall_t2 !== mapSmall_t3 ? "YES" : "NO");

console.log("Tutorial Map across all times: Map should NOT change.");
console.log("Same?", (mapTut_t1 === mapTut_t2 && mapTut_t2 === mapTut_t3) ? "YES" : "NO");

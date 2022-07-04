// ==UserScript==
// @name         Jstris Tutor Maker
// @namespace    http://tampermonkey.net/
// @version      0.0.0
// @description  Helps you make a Jstris usermode for placing a queue of pieces in the right spots
// @author       TSTman
// @match        https://jstris.jezevec10.com/usermodes/create*
// @match        https://jstris.jezevec10.com/usermodes/*/edit*
// @icon         https://jstris.jezevec10.com/favicon.ico
// @grant        none
// ==/UserScript==
function setupTrainingMaker() {'use strict';

// Add an "H" right before the first piece that you are supposed to hold
const BlockQueue = 'TIHLZJOSHOZILHTJSHIJSZTLOIOZJSTLJOLITZSILTSOZJLTJOISZJZLHOHSTISHIJLZOTSLIZTHOJHILHZHOSJHTHIZTOHSJLHTJSZHIOLZSJTOLISHJOIZLTIOS';

// Set HowManyBlocks to the number of blocks the player must use in order to complete your usermode
const HowManyBlocks = 20;

// Set HowManyBlocksPerSegment to 0 to disable the tutor
const HowManyBlocksPerSegment = 4;

// PauseHowLongBetweenPieces is the number of seconds to pause between steps in tutor mode
const PauseHowLongBetweenPieces = 1;

// Keeps the page from locking up while the components are generated, even when ms is 0
function sleep() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

// latestComponent gets the component that was just generated (assumes it was created by click, not drag)
function latestComponent() {
    const latestComponentLabelSlice = [...document.querySelectorAll('span.cid-disp')].slice(-1);
    if (latestComponentLabelSlice.length === 0) {
        return null;
    }
    const latestComponentLabel = latestComponentLabelSlice[0];
    const panelElement = latestComponentLabel.closest('div.panel.panel-primary');
    return panelElement.querySelector(':scope form');
}

// removeComponent removes the given component.
async function removeComponent(component) {
    const removeButton = component.closest('div[data-cid]').querySelector(':scope a.js-clear');
    removeButton.click();
    await sleep();
}

const TriggerTypeBeforeGame = 'Before the game';
const TriggerTypeOnGameStart = 'On game start';
const TriggerTypeOnSpecificBlockNumber = 'On specific block #';
const TriggerTypeExternalConditional = 'External/conditional';

async function selectOption(optionElement) {
    const selectElement = optionElement.closest('select');
    optionElement.selected = true;
    await saveInput(selectElement);
}

async function saveTextInput(element, value) {
    element.value = value;
    element.setAttribute('value', value);
    await saveInput(element);
}

async function saveTextAreaInput(element, value) {
    element.textContent = value;
    element.value = value;
    await saveInput(element);
}

async function saveCheckBox(element, checked) {
    element.checked = checked;
    await saveInput(element);
}

async function saveInput(element) {
    element.dispatchEvent(new Event('input'));
    await sleep();
}

// newTrigger creates a new Trigger component
async function newTrigger(triggerType, triggerArg) {
    const triggerButton = document.querySelector('a[data-field-type=trig]');
    document.querySelector('a[data-field-type=trig]');
    triggerButton.click();
    await sleep();
    const trigger = latestComponent();
    await selectOption([...trigger.querySelectorAll(':scope select[data-rv-input="model.opts.when"] option')].filter(el => el.textContent === triggerType)[0]);
    if (typeof triggerArg === 'string') {
        await saveTextInput(trigger.querySelector(':scope input[data-rv-input="model.opts.when2"]'), triggerArg);
    }
}

const QueueIPiece = 'I';
const QueueHoldPiece = 'H';
const QueueHoldPieceNone = 'NONE';
const QueueClassBlockFont = 'blockFont';

// newQueueChange creates a new Queue Change component
async function newQueueChange(queue, holdPiece, replace = true, repeat = false) {
    const workaroundExtraPiece = [];
    if (holdPiece === '' || holdPiece === QueueHoldPieceNone) {
        holdPiece = QueueHoldPieceNone;
    }
    queue = [`h=${holdPiece}`].concat(workaroundExtraPiece).concat(queue.replace(new RegExp(QueueHoldPiece, 'g'), '').split('')).join(',');
    const queueButton = document.querySelector('a[data-field-type="queue"]');
    queueButton.click();
    await sleep();
    const queueElement = latestComponent();
    if (replace) {
        await saveCheckBox(queueElement.querySelector(':scope input[data-rv-input="model.opts.wipe"]'), replace);
    }
    if (repeat) {
        await saveCheckBox(queueElement.querySelector(':scope input[data-rv-input="model.opts.repeat"]'), repeat);
    }
    if (typeof queue === 'string') {
        const queueField = queueElement.querySelector(':scope input[data-rv-input="model.opts.queue"]');
        queueField.classList.remove(QueueClassBlockFont);
        await saveTextInput(queueField, queue);
    }
}

const RelativeTriggerTypeTime = 'Time';
const RelativeTriggerTypeLines = 'Lines';
const RelativeTriggerTypeBlocks = 'Blocks';

// newRelativeTrigger creates a new Relative Trigger component
async function newRelativeTrigger(relativeTriggerType, amount, triggerID) {
    document.querySelector('a[data-field-type=rtrig]').click();
    await sleep();
    const relativeTrigger = latestComponent();
    await selectOption([...relativeTrigger.querySelectorAll(':scope select[data-rv-input="model.opts.af"] option')].filter(el => el.textContent === relativeTriggerType)[0]);
    await saveTextInput(relativeTrigger.querySelector(':scope input[data-rv-input="model.opts.when"]'), amount);
    await saveTextInput(relativeTrigger.querySelector(':scope input[data-rv-input="model.opts.id"]'), triggerID);
}

const MapTypeSubtractFromCurrentBoard = 'Subtract from current board';
const MapTypeAddToCurrentBoardOnTop = 'Add to current board (on top)';
const MapTypeReplaceBoard = 'Replace board';
// MapDataLineClear a place for an I piece to complete a 2-line PC. It is used to trigger a line clear after subtracting the expected field from the board, in order to make sure the whole board is clear (there was a PC)
const MapDataLineClear = 'ERAAAREREREREQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
let newMapIndex = 1;
let newMapContent;

// syncMaps takes the content of the map that was just updated and updates all of the "Replace board" and "Subtract from current board" maps that occur after this map.
async function syncMaps() {
    await updateStatus('Syncing maps...');
    const changedInput = inputElementFromMap(this.closest('form'));
    newMapContent = changedInput.value;
    const changedMap = changedInput.closest('form');
    let foundMapYet = false;
    let blockIndex = 0;
    let sectionIndex = 1;
    // The initial value suppresses a warning about how it might not have been initialized. But it will always be initialized
    let progressInterval = 0;
    for (const key in mapListsByPieceIndex) {
        const maps = mapListsByPieceIndex[sectionIndex];
        for (const map of maps) {
            if (changedMap === map) {
                foundMapYet = true;
                newMapIndex = sectionIndex;
                await updateSectionMapContent(maps, newMapContent, changedMap);
                const totalMapCount = HowManyBlocksPerSegment * 3 - blockIndex;
                const mapSyncProgress = async () => await updateStatus(`Syncing maps (${blockIndex}/${totalMapCount})`);
                // Periodic updates so you know if it's still busy generating stuff
                progressInterval = setInterval(mapSyncProgress, 1000);
                await mapSyncProgress();
            }
            blockIndex++;
            if (!foundMapYet) {
                continue;
            }
            await updateMapContent(map, newMapContent);
        }
        sectionIndex++;
    }
    clearInterval(progressInterval);
    newMapIndex++;
    if (newMapIndex <= Object.keys(mapListsByPieceIndex).length) {
        const editButton = mapListsByPieceIndex[newMapIndex][0].querySelector(':scope a.open-map-edit');
        editButton.click();
    }
    await resetStatus();
}

function inputElementFromMap(map) {
    return map.querySelector(':scope input[data-rv-input="model.opts.map"]');
}

async function updateSectionMapContent(maps, mapContent, mapToSkip = null) {
    for (const map of maps) {
        if (map === mapToSkip) {
            continue;
        }
        await updateMapContent(map, mapContent);
    }
}

async function updateMapContent(map, mapContent) {
    const mapInput = inputElementFromMap(map);
    if (mapContent !== null) {
        await saveTextInput(mapInput, mapContent);
    }
}

function setMapSubmitButtonText(map, pieceIndex) {
    const saveButton = map.querySelector(':scope button.save_btn');
    saveButton.textContent = `Save changes for block ${pieceIndex} and up`;
    saveButton.addEventListener('click', syncMaps);
    map.querySelector(':scope a.open-map-edit').textContent = `Edit map for block ${pieceIndex}`;
}

function setAllMapSubmitButtonText(totalSections) {
    let pieceIndex = 1;
    const maps = [...document.querySelectorAll('select[data-rv-input="model.opts.spawn"] option:checked')]
        .filter(el => el.textContent === MapTypeSubtractFromCurrentBoard || el.textContent === MapTypeReplaceBoard)
        .map(el => el.closest('form'));
    let mapIndex = 0;
    for (let section = 1; section <= totalSections; section++) {
        let sectionBeginningBlockCount = (section - 1) * HowManyBlocksPerSegment + 1;
        if (sectionBeginningBlockCount > HowManyBlocks) {
            break;
        }
        let sectionFinalBlockCount = HowManyBlocksPerSegment > 0 ? section * HowManyBlocksPerSegment : HowManyBlocks;
        if (sectionFinalBlockCount > HowManyBlocks) {
            sectionFinalBlockCount = HowManyBlocks;
        }
        if (HowManyBlocksPerSegment > 0) {
            for (let blockCount = sectionBeginningBlockCount; blockCount <= sectionFinalBlockCount; blockCount++) {
                mapListsByPieceIndex[blockCount] = new Array();
                mapListsByPieceIndex[blockCount].push(maps[mapIndex++]);
            }
            // The map after the tutor that resets the board to the beginning of the section
            if (sectionBeginningBlockCount !== 1) {
                mapListsByPieceIndex[sectionBeginningBlockCount - 1].push(maps[mapIndex]);
            }
            mapIndex++;
        }
        for (let blockCount = sectionBeginningBlockCount; blockCount <= sectionFinalBlockCount; blockCount++) {
            if (!(mapListsByPieceIndex[blockCount] instanceof Array)) {
                mapListsByPieceIndex[blockCount] = new Array();
            }
            mapListsByPieceIndex[blockCount].push(maps[mapIndex++]);
            mapListsByPieceIndex[blockCount].push(maps[mapIndex++]);
        }
    }
    for (const key in mapListsByPieceIndex) {
        const maps = mapListsByPieceIndex[key];
        maps.forEach((map) => {
            const saveButton = map.querySelector(':scope button.save_btn');
            saveButton.addEventListener('click', syncMaps);
            saveButton.textContent = `Save changes for block ${pieceIndex} and up`;
            const editButton = map.querySelector(':scope a.open-map-edit');
            editButton.textContent = `Edit map for block ${pieceIndex}`;
        });
        pieceIndex++;
    }
}

// newMap creates a new Map component
async function newMap(mapType, pieceIndex) {
    const mapButton = document.querySelector('a[data-field-type=map]');
    mapButton.click();
    await sleep();
    const map = latestComponent();
    const mapTypeElement = [...map.querySelectorAll(':scope select[data-rv-input="model.opts.spawn"] option')].filter(el => el.textContent === mapType)[0];
    await selectOption(mapTypeElement);
    if (mapType === MapTypeAddToCurrentBoardOnTop) {
        await updateMapContent(map, MapDataLineClear);
    } else if ((mapType === MapTypeReplaceBoard || mapType === MapTypeSubtractFromCurrentBoard) && pieceIndex > 0) {
        setMapSubmitButtonText(map, pieceIndex);
    }
    return map;
}

// 28G and no lock delay
const RulesetTypeFastDropLock = JSON.stringify({lockDelay: [0, 5000, 20000], gravityLvl: 28});
const RulesetTypeDefault = JSON.stringify({});

async function newRuleset(rulesetType) {
    const rulesetButton = document.querySelector('a[data-field-type=rule]');
    rulesetButton.click();
    await sleep();
    const ruleset = latestComponent();
    await saveTextAreaInput(ruleset.querySelector(':scope textarea[data-rv-input="model.opts.rule"]'), rulesetType);
}

const ConditionTypePCs = 'PCs';
const ConditionTypeHolds = 'Holds';
const ConditionResultTypeGameOver = 'Game over';

// newCondition creates a new Condition component.
async function newCondition(conditionType, conditionValue, doIfTrue, conditionDo) {
    const conditionButton = document.querySelector('a[data-field-type=cond]');
    conditionButton.click();
    await sleep();
    const condition = latestComponent();
    await selectOption([...condition.querySelectorAll(':scope select[data-rv-input="model.opts.check"] option')].filter(el => el.textContent === conditionType)[0]);
    await saveTextInput(condition.querySelector(':scope input[data-rv-input="model.opts.check2"]'), conditionValue);
    const doIfTrueElement = condition.querySelector(':scope input[type="checkbox"][data-rv-input="model.opts.on"]');
    await saveCheckBox(doIfTrueElement, doIfTrue);
    await saveInput(doIfTrueElement);
    await selectOption([...condition.querySelectorAll(':scope select[data-rv-input="model.opts.do"] option')].filter(el => el.textContent === conditionDo)[0]);
}

const saveButtonOriginalText = [...document.querySelectorAll('#saveAll')].map(el => el.textContent).join('');
const ClassButtonSuccess = 'btn-success';
const ClassButtonDanger = 'btn-danger';

async function updateStatus(statusText) {
    const saveButton = document.querySelector('#saveAll');
    if (!(saveButton instanceof HTMLElement)) {
        return;
    }
    saveButton.classList.remove(ClassButtonSuccess);
    saveButton.classList.add(ClassButtonDanger);
    saveButton.textContent = statusText;
    await sleep();
}

async function resetStatus() {
    const saveButton = document.querySelector('#saveAll');
    if (!(saveButton instanceof HTMLElement)) {
        return;
    }
    saveButton.classList.remove(ClassButtonDanger);
    saveButton.classList.add(ClassButtonSuccess);
    saveButton.textContent = saveButtonOriginalText;
    await sleep();
}

async function demoCycle(blockCount, demoTriggerID, queue, holdPiece, mapListForBlock) {
    await newRelativeTrigger(RelativeTriggerTypeTime, PauseHowLongBetweenPieces, demoTriggerID);
    await newTrigger(TriggerTypeExternalConditional, demoTriggerID);
    mapListForBlock.push(await newMap(MapTypeReplaceBoard, blockCount));
    await newQueueChange(queue.slice(1), holdPiece, true);
}

// cycle goes through all the the steps to make sure the user placed a single piece correctly
async function cycle(blockCount, queue, holdPiece, holdCount, mapListForBlock) {
    await newQueueChange(queue, holdPiece, true, false);
    await newTrigger(TriggerTypeOnSpecificBlockNumber, (blockCount * 2 - 1).toString());
    mapListForBlock.push(await newMap(MapTypeSubtractFromCurrentBoard, blockCount));
    await newQueueChange(QueueIPiece, holdPiece, true, true);
    await newMap(MapTypeAddToCurrentBoardOnTop, null);
    await newRuleset(RulesetTypeFastDropLock);
    const judgeTriggerID = `judge_block_${blockCount}`;
    await newRelativeTrigger(RelativeTriggerTypeLines, 1, judgeTriggerID);
    await newTrigger(TriggerTypeExternalConditional, judgeTriggerID);
    await newCondition(ConditionTypePCs, `=${blockCount}`, false, ConditionResultTypeGameOver);
    await newCondition(ConditionTypeHolds, `=${holdCount}`, false, ConditionResultTypeGameOver);
    mapListForBlock.push(await newMap(MapTypeReplaceBoard, blockCount));
    await newRuleset(RulesetTypeDefault);
}

async function makeDemoCycles(blockCount, totalBlocks, queue, finalTriggerID, mapListsBySection, holdPiece) {
    for (; blockCount <= totalBlocks; blockCount++) {
        let triggerSuffix = '';
        let triggerSection = 1;
        let demoTriggerID = `demo_block_${blockCount}` + triggerSuffix;
        if (queue[0] === QueueHoldPiece) {
            let swap = queue[1];
            queue = holdPiece + queue.slice(2);
            holdPiece = swap;
            triggerSuffix = `_part_${triggerSection}`;
            let afterHoldTriggerID = demoTriggerID + triggerSuffix;
            await newRelativeTrigger(RelativeTriggerTypeTime, PauseHowLongBetweenPieces, afterHoldTriggerID);
            await newTrigger(TriggerTypeExternalConditional, afterHoldTriggerID);
            triggerSection++;
            triggerSuffix = `_part_${triggerSection}`;
            demoTriggerID = `demo_block_${blockCount}` + triggerSuffix;
            await newQueueChange(queue, holdPiece, true);
        }
        if (!(mapListsBySection[blockCount] instanceof Array)) {
            mapListsBySection[blockCount] = new Array();
        }
        await demoCycle(blockCount, demoTriggerID, queue, holdPiece, mapListsBySection[blockCount]);
        queue = queue.slice(1);
    }
    await newRelativeTrigger(RelativeTriggerTypeTime, PauseHowLongBetweenPieces * 2, finalTriggerID);
    return [holdPiece, queue];
}

// 1 cycle per block in BlockQueue
async function makeCycles(blockCount, totalBlocks, queue, holdPiece, holdCount, mapListsBySection) {
    for (; blockCount <= totalBlocks; blockCount++) {
        if (!(mapListsBySection[blockCount] instanceof Array)) {
            mapListsBySection[blockCount] = new Array();
        }
        const shouldHold = queue[0] === QueueHoldPiece;
        if (shouldHold) {
            holdCount++;
        }
        await cycle(blockCount, queue, holdPiece, holdCount, mapListsBySection[blockCount]);
        if (shouldHold) {
            let swap = queue[1];
            queue = holdPiece + queue.slice(2);
            holdPiece = swap;
        }
        const queueTriggerID = `block_${blockCount + 1}_queue`;
        await newRelativeTrigger(RelativeTriggerTypeBlocks, 0, queueTriggerID);
        await newTrigger(TriggerTypeExternalConditional, queueTriggerID);
        queue = queue.slice(1);
    }
    const queueTriggerID = `before_demo_${blockCount}`;
    await newQueueChange(queue, holdPiece, true, false);
    await newRelativeTrigger(RelativeTriggerTypeBlocks, 0, queueTriggerID);
    await newTrigger(TriggerTypeExternalConditional, queueTriggerID);
    return [queue, holdPiece, holdCount];
}

async function initUserMode(queue) {
    await newTrigger(TriggerTypeBeforeGame, null);
    await newQueueChange(queue, QueueHoldPieceNone, true, false);
    await newTrigger(TriggerTypeOnGameStart, null);
    await newQueueChange(queue, QueueHoldPieceNone, true, false);
}

const totalSections = HowManyBlocksPerSegment > 0 ? Math.round(HowManyBlocks / HowManyBlocksPerSegment + .5) : 1;

function totalComponents() {
    const initialComponents = 4 - 2;
    const componentsPerDemoCycle = HowManyBlocksPerSegment > 0 ? 4 : 0;
    const componentsPerCycle = 12 + 2;
    const componentsPerDemoCycleSection = HowManyBlocksPerSegment > 0 ? (1 + 2) : 0;
    const componentsPerCycleSection = 3;
    // Gets number of holds in within HowManyBlocks blocks
    const totalHolds = (BlockQueue.match(new RegExp(`([ZSJLOIT]H?){${HowManyBlocks}}`))[0].match(/H(?!$)/g) || []).length;
    const componentsPerHold = HowManyBlocksPerSegment > 0 ? 3 : 0;
    return initialComponents +
        (componentsPerDemoCycle + componentsPerCycle) * HowManyBlocks +
        (componentsPerDemoCycleSection + componentsPerCycleSection) * totalSections +
        componentsPerHold * totalHolds;
}

const mapListsByPieceIndex = {};
(async function () {
    // If this is a brand-new usermode
    if (latestComponent() === null) {
        // 11 components per cycle, plus the initial "Before the game" trigger and initial Queue component
        const expectedComponentCount = totalComponents();
        const componentProgress = async () => await updateStatus(`Generated ${document.querySelectorAll('span.cid-disp').length}/${expectedComponentCount} components`);
        // Periodic updates so you know if it's still busy generating stuff
        const progressInterval = setInterval(componentProgress, 1000);
        await componentProgress();
        let queue = BlockQueue;
        await initUserMode(queue);
        let firstSection = true;
        let holdPiece = '';
        let holdCount = 0;
        let nextQueue;
        for (let section = 1; section <= totalSections; section++) {
            let sectionBeginningBlockCount = (section - 1) * HowManyBlocksPerSegment + 1;
            let sectionFinalBlockCount = HowManyBlocksPerSegment > 0 ? section * HowManyBlocksPerSegment : HowManyBlocks;
            if (sectionFinalBlockCount > HowManyBlocks) {
                sectionFinalBlockCount = HowManyBlocks;
            }
            let playTriggerID = `play_block_${sectionBeginningBlockCount}`;
            if (HowManyBlocksPerSegment > 0) {
                await makeDemoCycles(sectionBeginningBlockCount, sectionFinalBlockCount, queue, playTriggerID, mapListsByPieceIndex, holdPiece);
                await newTrigger(TriggerTypeExternalConditional, playTriggerID);
                let transitionMap = await newMap(MapTypeReplaceBoard, sectionBeginningBlockCount - 1);
                if (firstSection) {
                    firstSection = false;
                } else {
                    mapListsByPieceIndex[sectionBeginningBlockCount - 1].push(transitionMap);
                }
            }
            const returnValue = await makeCycles(sectionBeginningBlockCount, sectionFinalBlockCount, queue, holdPiece, holdCount, mapListsByPieceIndex);
            nextQueue = returnValue[0];
            holdPiece = returnValue[1];
            holdCount = returnValue[2];
            queue = nextQueue;
        }
        // Remove the relative trigger and trigger at the end, trigger ID block_#_queue
        await removeComponent(latestComponent());
        await removeComponent(latestComponent());
        const editButton = mapListsByPieceIndex[newMapIndex][0].querySelector(':scope a.open-map-edit');
        editButton.click();
        clearInterval(progressInterval);
        await resetStatus();
    } else {
        // Otherwise, still add stuff for editing map sequences
        setAllMapSubmitButtonText(totalSections);
    }
})();
}

document.body.appendChild(document.createElement('script')).textContent = setupTrainingMaker.toString().match(/^function setupTrainingMaker\(\) \{((.|[\n\r])*)}$/)[1];
// Run the function instead of injecting if you need to debug/set breakpoints
//setupTrainingMaker();

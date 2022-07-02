// ==UserScript==
// @name         Setup Training Maker
// @namespace    http://tampermonkey.net/
// @version      0.0.0
// @description  Helps you make a Jstris usermode for placing a queue of pieces in the right spots
// @author       TSTman
// @match        https://jstris.jezevec10.com/usermodes/create*
// @match        https://jstris.jezevec10.com/usermodes/*/edit*
// @icon         https://jstris.jezevec10.com/favicon.ico
// @grant        none
// ==/UserScript==

document.body.appendChild(document.createElement('script')).textContent = (function () {'use strict';

// Set HowManyBlocks to the number of blocks the player must use in order to complete your usermode
const HowManyBlocks = 101;

// Add an "H" right before the first piece that you are supposed to hold
const BlockQueue = 'TILHZJOSOZILTJSIJSZTLOIOZJSTLJOLITZSILTSOZJLTJOISZJZLOSTISIJLZOTSLIZTOJILZOSJTIZTOSJLTJSZIOLZSJTOLISJOIZLTIOS';


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

const TriggerTypeBeforeGame = 'Before the game';
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
    element.checked = checked
    await saveInput(element);
}

async function saveInput(element) {
    element.dispatchEvent(new Event('input'));
    await sleep();
}

// newTrigger creates a new Trigger component
async function newTrigger(triggerType: string, triggerArg: string | null) {
    const triggerButton: HTMLAnchorElement = document.querySelector('a[data-field-type=trig]');
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
const QueueHoldPiece = 'H'

// newQueueChange creates a new Queue Change component
async function newQueueChange(queue, replace = false, repeat = false) {
    const hasAlreadyHeld = !(queue.match(new RegExp(QueueHoldPiece)) instanceof Array);
    queue = queue.replace(new RegExp(QueueHoldPiece, 'g'), '');
    const queueButton: HTMLAnchorElement = document.querySelector('a[data-field-type="queue"]');
    queueButton.click()
    await sleep();
    const queueElement = latestComponent();
    if (replace) {
        await saveCheckBox(queueElement.querySelector(':scope input[data-rv-input="model.opts.wipe"]'), replace)
        if (queue.length > 1 && !hasAlreadyHeld) {
            queue = 'Z' + queue;
        }
    }
    if (repeat) {
        await saveCheckBox(queueElement.querySelector(':scope input[data-rv-input="model.opts.repeat"]'), repeat)
    }
    if (typeof queue === 'string') {
        await saveTextInput(queueElement.querySelector(':scope input[data-rv-input="model.opts.queue"]'), queue)
    }
}

const RelativeTriggerTypeAfterLines = 'Lines';

// newRelativeTrigger creates a new Relative Trigger component
async function newRelativeTrigger(relativeTriggerType, amount, triggerID) {
    const relativeTriggerButton: HTMLAnchorElement = document.querySelector('a[data-field-type=rtrig]');
    relativeTriggerButton.click();
    await sleep();
    const relativeTrigger = latestComponent();
    await selectOption([...relativeTrigger.querySelectorAll(':scope select[data-rv-input="model.opts.af"] option')].filter(el => el.textContent === relativeTriggerType)[0]);
    await saveTextInput(relativeTrigger.querySelector(':scope input[data-rv-input="model.opts.when"]'), amount);
    await saveTextInput(relativeTrigger.querySelector(':scope input[data-rv-input="model.opts.id"]'), triggerID);
}

const MapTypeSubtractFromCurrentBoard = 'Subtract from current board';
const MapTypeAddToCurrentBoardOnTop = 'Add to current board (on top)';
const MapTypeReplaceBoard = 'Replace board';
// LineClearMapData a place for an I piece to complete a 2-line PC. It is used to trigger a line clear after subtracting the expected field from the board, in order to make sure the whole board is clear (there was a PC)
const LineClearMapData = 'ERAAAREREREREQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';


let newMapIndex = 0;
let newMapContent: string;

// syncMaps takes the content of the map that was just updated and updates all of the "Replace board" and "Subtract from current board" maps that occur after this map.
async function syncMaps() {
    await updateStatus('Syncing maps...');
    const changedInput = inputElementFromMap(this.closest('form'));
    newMapContent = changedInput.value;
    const changedMap = changedInput.closest('form');
    const isReplacementMap = changedMap.querySelector(':scope select[data-rv-input="model.opts.spawn"] option:checked').textContent === MapTypeReplaceBoard
    const maps = [...document.querySelectorAll('select[data-rv-input="model.opts.spawn"] option:checked')]
        .filter(el => el.textContent === MapTypeSubtractFromCurrentBoard || el.textContent === MapTypeReplaceBoard)
        .map(el => el.closest('form'));
    let foundMapYet = false;
    let index = 0;
    // The initial value suppresses a warning about how it might not have been initialized. But it will always be initialized
    let previousMap = {};
    let progressInterval = 0;
    for (const map of maps) {
        if (changedMap === map) {
            foundMapYet = true;
            newMapIndex = Math.floor(index / 2);
            if (isReplacementMap) {
                await updateMapContent(previousMap, newMapContent)
            }
            const mapCount = maps.length - index;
            const mapSyncProgress = async () => await updateStatus(`Syncing maps (${index}/${mapCount})`);
            // Periodic updates so you know if it's still busy generating stuff
            progressInterval = setInterval(mapSyncProgress,
                1000);
            await mapSyncProgress();
        }
        previousMap = map;
        if (!foundMapYet) {
            index++;
            continue;
        }
        index++;
        await updateMapContent(map, newMapContent)
    }
    clearInterval(progressInterval);

    newMapIndex++
    const subtractionMaps = getSubtractionMaps();
    if (newMapIndex < subtractionMaps.length) {
        const editButton: HTMLAnchorElement = subtractionMaps[newMapIndex].querySelector(':scope a.open-map-edit');
        editButton.click();
    }
    await resetStatus();
}

// Gets all of the "Subtract from current board" maps
function getSubtractionMaps() {
    return [...document.querySelectorAll('select[data-rv-input="model.opts.spawn"] option:checked')]
        .filter(el => el.textContent === MapTypeSubtractFromCurrentBoard)
        .map(el => el.closest('form'));
}

// Gets all of the "Replace board" maps
function getReplacementMaps() {
    return [...document.querySelectorAll('select[data-rv-input="model.opts.spawn"] option:checked')]
        .filter(el => el.textContent === MapTypeReplaceBoard)
        .map(el => el.closest('form'));
}

function inputElementFromMap(map) {
    return map.querySelector(':scope input[data-rv-input="model.opts.map"]');
}

async function updateMapContent(map, mapContent) {
    const mapInput = inputElementFromMap(map);
    if (mapContent !== null) {
        await saveTextInput(mapInput, mapContent);
    }
}

// newMap creates a new Map component
async function newMap(mapType) {
    const mapButton: HTMLAnchorElement = document.querySelector('a[data-field-type=map]');
    mapButton.click();
    await sleep();
    const map = latestComponent();
    const mapTypeElement = [...map.querySelectorAll(':scope select[data-rv-input="model.opts.spawn"] option')].filter(el => el.textContent === mapType)[0]
    await selectOption(mapTypeElement);
    if (mapType === MapTypeAddToCurrentBoardOnTop) {
        await updateMapContent(map, LineClearMapData);
    } else if (mapType === MapTypeSubtractFromCurrentBoard) {
        const mapButton = map.querySelector(':scope button.save_btn');
        mapButton.addEventListener('click', syncMaps);
    }
    return latestComponent();
}

// 28G and no lock delay
const RulesetTypeFastDropLock = JSON.stringify({lockDelay: [0, 5000, 20000], gravityLvl: 28});
const RulesetTypeDefault = JSON.stringify({});

async function newRuleset(rulesetType) {
    const rulesetButton: HTMLAnchorElement = document.querySelector('a[data-field-type=rule]');
    rulesetButton.click();
    await sleep();
    const ruleset = latestComponent();
    await saveTextAreaInput(ruleset.querySelector(':scope textarea[data-rv-input="model.opts.rule"]'), rulesetType);
}

const ConditionTypePCs = 'PCs';
const ConditionResultTypeGameOver = 'Game over';

// newCondition creates a new Condition component.
async function newCondition(conditionType, conditionValue, doIfTrue, conditionDo) {
    const conditionButton: HTMLAnchorElement = document.querySelector('a[data-field-type=cond]');
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

// cycle goes through all the the steps to make sure the user placed a single piece correctly
async function cycle(blockCount, queue) {
    await newQueueChange(queue, true);
    await newTrigger(TriggerTypeOnSpecificBlockNumber, (blockCount * 2 - 1).toString());
    const subtractionMap = await newMap(MapTypeSubtractFromCurrentBoard);
    setMapSubmitButtonText(subtractionMap, blockCount)
    await newQueueChange(QueueIPiece, true, true);
    await newMap(MapTypeAddToCurrentBoardOnTop);
    await newRuleset(RulesetTypeFastDropLock);
    const judgeTriggerID = `judge_block_${blockCount}`;
    await newRelativeTrigger(RelativeTriggerTypeAfterLines, 1, judgeTriggerID)
    await newTrigger(TriggerTypeExternalConditional, judgeTriggerID);
    await newCondition(ConditionTypePCs, `=${blockCount}`, false, ConditionResultTypeGameOver);
    const replacementMap = await newMap(MapTypeReplaceBoard);
    setMapSubmitButtonText(replacementMap, blockCount);
    await newRuleset(RulesetTypeDefault);
}

function setMapSubmitButtonText(map, pieceIndex) {
    const saveButton = map.querySelector(':scope button.save_btn');
    saveButton.textContent = `Save changes for block ${pieceIndex} and up`;
    saveButton.addEventListener('click', syncMaps);
    map.querySelector(':scope a.open-map-edit').textContent = `Edit map for block ${pieceIndex}`;
}

function setAllMapSubmitButtonText() {
    let pieceIndex = 1;
    getSubtractionMaps()
        .map(el => el.querySelector(':scope button.save_btn'))
        .forEach(button => button.textContent = `Save changes for block ${pieceIndex++} and up`)
    pieceIndex = 1;
    getReplacementMaps()
        .map(el => el.querySelector(':scope button.save_btn'))
        .forEach(button => button.textContent = `Save changes for block ${pieceIndex++} and up`);

    pieceIndex = 1;
    getSubtractionMaps()
        .map(el => el.querySelector(':scope a.open-map-edit'))
        .forEach(button => button.textContent = `Edit map for block ${pieceIndex++}`);
    pieceIndex = 1;
    getReplacementMaps()
        .map(el => el.querySelector(':scope a.open-map-edit'))
        .forEach(button => button.textContent = `Edit map ${pieceIndex++}`);
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

// 1 cycle per block in BlockQueue
async function makeCycles(totalBlocks, queue) {
    // 11 components per cycle, plus the initial "Before the game" trigger and initial Queue component
    const expectedComponentCount = 2 + 11 * HowManyBlocks;
    const componentProgress = async () => await updateStatus(`Generated of ${document.querySelectorAll('span.cid-disp').length}/${expectedComponentCount} components`);
    // Periodic updates so you know if it's still busy generating stuff
    const progressInterval = setInterval(componentProgress,
        1000);
    await componentProgress();

    for (let blockCount = 1; blockCount <= totalBlocks; blockCount++) {
        await cycle(blockCount, queue);
        queue = queue.slice(1);
        if (queue[0] === QueueHoldPiece) {
            queue = queue.replace(new RegExp(QueueHoldPiece, 'g'), '');
        }
    }
    await newQueueChange(queue, true);

    clearInterval(progressInterval);
    await resetStatus();

    const editButton: HTMLAnchorElement = getSubtractionMaps()[newMapIndex].querySelector(':scope a.open-map-edit');
    editButton.click();
}

async function initUserMode() {
    await newTrigger(TriggerTypeBeforeGame, null);
}

(async function () {
    // If this is a brand-new usermode
    if (latestComponent() === null) {
        const queue = BlockQueue;
        await initUserMode();
        await makeCycles(HowManyBlocks, queue);
    } else {
        // Otherwise, still add stuff for editing map sequences
        getSubtractionMaps()
            .map(el => el.querySelector(':scope button.save_btn'))
            .forEach(mapButton => mapButton.addEventListener('click', syncMaps))
        getReplacementMaps()
            .map(el => el.querySelector(':scope button.save_btn'))
            .forEach(mapButton => mapButton.addEventListener('click', syncMaps))
        setAllMapSubmitButtonText();
    }
})();
}).toString().match(/^function \(\) \{((.|[\n\r])*)}$/)[1]

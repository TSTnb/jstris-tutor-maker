// ==UserScript==
// @name         Jstris Tutor Maker
// @license      BSD-2-Clause
// @namespace    Jstris Tutor Maker
// @version      0.2.1
// @description  Helps you make a Jstris usermode for placing a queue of pieces in the right spots
// @author       TSTman
// @match        https://jstris.jezevec10.com/usermodes/create*
// @icon         https://jstris.jezevec10.com/favicon.ico
// @grant        none
// ==/UserScript==

import {Page, Pages} from "tetris-fumen/lib/decoder";
import {Mino} from "tetris-fumen";
import {PlayField} from "tetris-fumen/lib/inner_field";
import {Operation as FieldOperation} from "tetris-fumen/lib/field";
import {Quiz} from "tetris-fumen/lib/quiz";

function setupTrainingMaker() {
    'use strict';

    // Uncomment an ExampleFumen below (only 1 at a time) to see how it works with Jstris Tutor Maker.

    // 3 bags of fesh sprint
    let ExampleFumen = 'v115@vhU2OY9BFLDmClcJSAVDEHBEooRBPoAVBKNUFDU+Dx?CaeHgCzuPFDMXltCTXNPC0XEWCadNPCvuLuCMHmPCpyTxCa?eHgCsvTxCJnzPCJ3TWC6ujWCpvbgCU3jFDK+DxCzyKxCKez?PCMdFgC6OOMCvintC6P9VCa3TxCsAAAAzkBifB0sB9tBXjB?plBqrBFiBJmB+tBsrBnsBTpBOrBNqB6qBTpBxrBHtBMtB';

    // Test single line clears:
    //let ExampleFumen = 'v115@vhJSSYtAFLDmClcJSAVDEHBEooRBMoAVBU3LMC6f/w?CpHLWCTO1LCJO1LCJO1LCpAAAA1wBTpB3qBxpBUsBWtBOmB?FqBctB';

    // Test perfect clears with O pieces:
    //let ExampleFumen = 'v115@vhJTJYdAFLDmClcJSAVDEHBEooRBPoAVBP3SgCP3Sg?CvAAAATqBTrBTsBTtBTpBTqBTrBTsBTtB';

    // 6 pieces
    //let ExampleFumen = 'v115@vhF1OY/BFLDmClcJSAVDEHBEooRBUoAVBpizPCP9aF?DpCmPCTentC6OMgCJnzPCzOUPCvS9wCad9VCU9aFDqCmPCP?ujFDqXMgCzeltCp/TFDv+TWCpXegCK+TFDPt/wCpXegCz/D?xCKtbMCviLuCq+KWCJtHgCpXExCJ3zBApmBckBWyBToBvqB?';

    // 10 pieces
    //let ExampleFumen = 'v115@vhJ1OY/BFLDmClcJSAVDEHBEooRBUoAVBpizPCP9aF?DpCmPCTentC6OMgCJnzPCzOUPCvS9wCad9VCU9aFDqCmPCP?ujFDqXMgCzeltCp/TFDv+TWCpXegCK+TFDPt/wCpXegCz/D?xCKtbMCviLuCq+KWCJtHgCpXExCJ3zBApmBckBWyBToBvqB?CjBcaBZmBSeB';

    // 20 pieces
    //let ExampleFumen = 'v115@vhT1OY/BFLDmClcJSAVDEHBEooRBUoAVBpizPCP9aF?DpCmPCTentC6OMgCJnzPCzOUPCvS9wCad9VCU9aFDqCmPCP?ujFDqXMgCzeltCp/TFDv+TWCpXegCK+TFDPt/wCpXegCz/D?xCKtbMCviLuCq+KWCJtHgCpXExCJ3zBApmBckBWyBToBvqB?CjBcaBZmBSeB7TBGPB/gBVcBWKB3RBcQBNMB6SBTAB';

    // 30 pieces
    //let ExampleFumen = 'v115@vhd1OY/BFLDmClcJSAVDEHBEooRBUoAVBpizPCP9aF?DpCmPCTentC6OMgCJnzPCzOUPCvS9wCad9VCU9aFDqCmPCP?ujFDqXMgCzeltCp/TFDv+TWCpXegCK+TFDPt/wCpXegCz/D?xCKtbMCviLuCq+KWCJtHgCpXExCJ3zBApmBckBWyBToBvqB?CjBcaBZmBSeB7TBGPB/gBVcBWKB3RBcQBNMB6SBTABZnBTX?BcaB+NB/WBNQBCPBWKBTABC7A';

    // 101 pieces:
    //let ExampleFumen = 'v115@vh/1OY/BFLDmClcJSAVDEHBEooRBUoAVBpizPCP9aF?DpCmPCTentC6OMgCJnzPCzOUPCvS9wCad9VCU9aFDqCmPCP?ujFDqXMgCzeltCp/TFDv+TWCpXegCK+TFDPt/wCpXegCz/D?xCKtbMCviLuCq+KWCJtHgCpXExCJ3zBApmBckBWyBToBvqB?CjBcaBZmBSeB7TBGPB/gBVcBWKB3RBcQBNMB6SBTABZnBTX?BcaB+NB/WBNQBCPBWKBTABC7AJnBlgBsaBXXBJnBCmBNpBX?gBTaBUcBGXBSeBdWBWSBTIBZnBXoBckB+SBcbBCjBZnBjbB?NpBZgB/kB/aBWyBScB0QBToB9RBXHBCjBvhkZnBcmBNaB5S?BWyBDoBCjBZXB0QB/RBWeBbUB9HBMIBF+ADGBZnB2VBCjBX?MBWeB3GBUIBNBBTUBCPBU9A/DBWKB95ATABC7AZnB/MBZnB?TaBZnB';

    // Holdless:
    //let ExampleFumen = 'v115@vhFRQYoAFLDmClcJSAVDEHBEooRBJoAVB6ybgCq+yt?C6/7LCUtzPCpOMgCUmBKpBvsBTtB+jf8gg0Ieg0Heh0deFq?QiAFLDmClcJSAVDEHBEooRBUoAVBPtzPCM+9tC6P9wCMHBA?AvhEzpBvrBMjBOkB6lf/ghlIeglIeglZexhQcAFLDmClcJS?AVDEHBEooRBJoAVBUtzPCpOMgCvhAlsfGhAPgHBegWwDCeA?PhHxSgWxDCegWAtxSgWQpxDAegWKe3sQaAFLDmClcJSAVDE?HBEooRBToAVB6P9wCMHBAAvhC0pBmkBxnfNhzhdelrQWAFL?DmClcJSAVDEHBEooRBUoAVBMHBAAvhBCrBTrB';

    // Set HowManyBlocksPerSection to 0 to disable the tutor (enables challenge mode)
    let HowManyBlocksPerSection = 7;

    // PauseHowLongBetweenPieces is the number of seconds to pause between steps in tutor mode
    let PauseHowLongBetweenPieces = 0.7;

    // Set HowManyDemoBlocks if you want *only some* of the fumen to have Demo Blocks.
    let HowManyDemoBlocks = 0;

    // BlockQueue starts out empty and is filled in after you load a Fumen. It adds an "H" before each piece that is held.
    let BlockQueue = '';

    // HowManyBlocks starts out at 0 and is set after you load a Fumen. It becomes the number of blocks the player must
    // use in order to complete your usermode
    let HowManyBlocks = 0;

    // Keeps the page from locking up while the components are generated, even though it sleeps for 0 seconds
    function sleep() {
        return new Promise(resolve => setTimeout(resolve, 0));
    }

    // latestComponent gets the component that was just generated (assumes it was created by click, not drag)
    function latestComponent(): HTMLFormElement {
        const latestComponentLabelSlice = [...document.querySelectorAll('span.cid-disp')].slice(-1);
        if (latestComponentLabelSlice.length === 0) {
            return null;
        }
        const latestComponentLabel = latestComponentLabelSlice[0];
        const panelElement: HTMLDivElement = latestComponentLabel.closest('div.panel.panel-primary');
        return panelElement.querySelector(':scope form');
    }

    // removeComponent removes the given component.
    async function removeComponent(component: HTMLFormElement) {
        const removeButton: HTMLAnchorElement = component.closest('div[data-cid]').querySelector(':scope a.js-clear');
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
    const QueueHoldPieceNone = 'NONE';
    const QueueClassBlockFont = 'blockFont';

    function buildQueue(holdPiece: string, queue: string) {
        const holdPrefix = !hasHold ? [] : [`h=${holdPiece}`];
        return holdPrefix.concat(queue.replace(new RegExp(QueueHoldPiece, 'g'), '').split('')).join(',');
    }

    // newQueueChange creates a new Queue Change component
    async function newQueueChange(queue, holdPiece: string, replace = true, repeat = false, prependPieceToQueue: boolean = false) {
        if (holdPiece === '') {
            holdPiece = QueueHoldPieceNone;
        }
        if (prependPieceToQueue) {
            queue = 'O' + queue;
        }
        queue = buildQueue(holdPiece, queue);
        const queueButton: HTMLAnchorElement = document.querySelector('a[data-field-type="queue"]');
        queueButton.click()
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
        (document.querySelector('a[data-field-type=rtrig]') as HTMLAnchorElement).click();
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
    let newMapContent: string;

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
                    const totalMapCount = HowManyBlocksPerSection * 3 - blockIndex;
                    const mapSyncProgress = async () => await updateStatus(`Syncing maps (${blockIndex}/${totalMapCount})`);
                    // Periodic updates so you know if it's still busy generating stuff
                    progressInterval = window.setInterval(mapSyncProgress,
                        1000);
                    await mapSyncProgress();
                }
                blockIndex++;
                if (!foundMapYet) {
                    continue;
                }
                await updateMapContent(map, newMapContent)
            }
            sectionIndex++;
        }

        clearInterval(progressInterval);

        newMapIndex++
        if (newMapIndex <= Object.keys(mapListsByPieceIndex).length) {
            const editButton: HTMLAnchorElement = mapListsByPieceIndex[newMapIndex][0].querySelector(':scope a.open-map-edit');
            editButton.click();
        }
        await resetStatus();
    }

    function inputElementFromMap(map) {
        return map.querySelector(':scope input[data-rv-input="model.opts.map"]');
    }

    async function updateSectionMapContent(maps: Array<HTMLFormElement>, mapContent: string, mapToSkip: HTMLFormElement = null) {
        if (!(maps instanceof Array)) {
            return;
        }
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

    function setAllMapSubmitButtonText(totalSections: number): void {
        let pieceIndex = 1;
        const maps = [...document.querySelectorAll('select[data-rv-input="model.opts.spawn"] option:checked')]
            .filter(el => el.textContent === MapTypeSubtractFromCurrentBoard || el.textContent === MapTypeReplaceBoard)
            .map(el => el.closest('form'));

        let mapIndex = 0;

        let blockCount: number;
        for (let section = 1; section <= totalSections && mapIndex + 1 < maps.length; section++) {
            let sectionBeginningBlockCount = (section - 1) * HowManyBlocksPerSection + 1;
            if (sectionBeginningBlockCount > HowManyBlocks) {
                break;
            }
            let sectionFinalBlockCount;
            if (HowManyBlocksPerSection > 0 && sectionBeginningBlockCount < HowManyDemoBlocks) {
                sectionFinalBlockCount = section * HowManyBlocksPerSection;
                if (sectionFinalBlockCount > HowManyDemoBlocks) {
                    sectionFinalBlockCount = HowManyBlocks;
                } else if (sectionFinalBlockCount > HowManyBlocks) {
                    sectionFinalBlockCount = HowManyBlocks;
                }
                for (blockCount = sectionBeginningBlockCount; blockCount <= sectionFinalBlockCount; blockCount++) {
                    mapListsByPieceIndex[blockCount] = new Array<HTMLFormElement>();
                    const map = maps[mapIndex++];
                    if (map instanceof HTMLFormElement) {
                        mapListsByPieceIndex[blockCount].push(map);
                    }
                }
                // The map after the tutor that resets the board to the beginning of the section
                if (sectionBeginningBlockCount !== 1) {
                    const map = maps[mapIndex];
                    if (map instanceof HTMLFormElement) {
                        mapListsByPieceIndex[sectionBeginningBlockCount - 1].push(map);
                    }
                }
                mapIndex++;
            } else {
                sectionFinalBlockCount = HowManyBlocks;
            }
            for (let blockCount = sectionBeginningBlockCount; blockCount <= sectionFinalBlockCount; blockCount++) {
                if (!(mapListsByPieceIndex[blockCount] instanceof Array)) {
                    mapListsByPieceIndex[blockCount] = new Array<HTMLFormElement>();
                }
                let map = maps[mapIndex++];
                if (map instanceof HTMLFormElement) {
                    mapListsByPieceIndex[blockCount].push(map);
                }
                map = maps[mapIndex++];
                if (map instanceof HTMLFormElement) {
                    mapListsByPieceIndex[blockCount].push(map);
                }
            }
            if (sectionFinalBlockCount === HowManyBlocks) {
                break;
            }
        }
        --blockCount;
        if (blockCount < HowManyBlocks) {
            HowManyBlocks = blockCount;
        }
        if (HowManyDemoBlocks === 0) {
            HowManyDemoBlocks = HowManyBlocks;
        }
        if (blockCount === HowManyBlocks && mapIndex + 1 === maps.length) {
            const map = maps[mapIndex++];
            if (map instanceof HTMLFormElement) {
                mapListsByPieceIndex[blockCount].push(map);
            }
        }

        for (const key in mapListsByPieceIndex) {
            const maps = mapListsByPieceIndex[key];
            maps.forEach((map: HTMLFormElement) => {
                const saveButton = map.querySelector(':scope button.save_btn');
                saveButton.addEventListener('click', syncMaps);
                saveButton.textContent = `Save changes for block ${pieceIndex} and up`;
                const editButton = map.querySelector(':scope a.open-map-edit');
                editButton.textContent = `Edit map for block ${pieceIndex}`;
            })
            pieceIndex++;
        }
    }


    // newMap creates a new Map component
    async function newMap(mapType: string, pieceIndex: number) {
        const mapButton: HTMLAnchorElement = document.querySelector('a[data-field-type=map]');
        mapButton.click();
        await sleep();
        const map = latestComponent();
        const mapTypeElement = [...map.querySelectorAll(':scope select[data-rv-input="model.opts.spawn"] option')].filter(el => el.textContent === mapType)[0]
        await selectOption(mapTypeElement);
        if (mapType === MapTypeAddToCurrentBoardOnTop) {
            await updateMapContent(map, MapDataLineClear);
        } else if ((mapType === MapTypeReplaceBoard || mapType === MapTypeSubtractFromCurrentBoard) && pieceIndex > 0) {
            setMapSubmitButtonText(map, pieceIndex)
        }
        return map;
    }

    // 28G and no lock delay
    const RulesetTypeFastDropLock = JSON.stringify({lockDelay: [0, 5000, 20000], gravityLvl: 28});
    let RulesetTypeDefault = JSON.stringify({});

    async function newRuleset(rulesetType) {
        const rulesetButton: HTMLAnchorElement = document.querySelector('a[data-field-type=rule]');
        rulesetButton.click();
        await sleep();
        const ruleset = latestComponent();
        await saveTextAreaInput(ruleset.querySelector(':scope textarea[data-rv-input="model.opts.rule"]'), rulesetType);
    }

    const ConditionTypePCs = 'PCs';
    const ConditionTypeHolds = 'Holds';
    const ConditionTypeLines = 'Lines';
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

    function saveAllButton(): HTMLAnchorElement {
        return document.querySelector('#saveAll') as HTMLAnchorElement;
    }

    const saveButtonOriginalText = [...document.querySelectorAll('#saveAll')].map(el => el.textContent).join('');
    const ClassButtonSuccess = 'btn-success';
    const ClassButtonDanger = 'btn-danger';

    async function updateStatus(statusText) {
        const saveButton = saveAllButton();
        if (!(saveButton instanceof HTMLElement)) {
            return;
        }
        saveButton.classList.remove(ClassButtonSuccess);
        saveButton.classList.add(ClassButtonDanger);
        saveButton.textContent = statusText;
        await sleep();
    }

    async function resetStatus() {
        const saveButton = saveAllButton();
        if (!(saveButton instanceof HTMLElement)) {
            return;
        }
        saveButton.classList.remove(ClassButtonDanger);
        saveButton.classList.add(ClassButtonSuccess);
        saveButton.textContent = saveButtonOriginalText;
        await sleep();
    }

    async function demoCycle(blockCount: number, demoTriggerID: string, queue: string, holdPiece: string, mapListForBlock: Array<HTMLFormElement>): Promise<void> {
        await newRelativeTrigger(RelativeTriggerTypeTime, PauseHowLongBetweenPieces, demoTriggerID);
        await newTrigger(TriggerTypeExternalConditional, demoTriggerID)
        mapListForBlock.push(await newMap(MapTypeReplaceBoard, blockCount));
        await newQueueChange(queue.slice(1), holdPiece, true, false);
    }

    // cycle goes through all the the steps to make sure the user placed a single piece correctly
    async function cycle(blockCount: number, queues: Array<string>, holdPieces: Array<string>, mapListForBlock: Array<HTMLFormElement>): Promise<void> {
        await newTrigger(TriggerTypeOnSpecificBlockNumber, (blockCount * 2 - 1).toString());
        mapListForBlock.push(await newMap(MapTypeSubtractFromCurrentBoard, blockCount));
        let nextQueue: string;
        let nextHoldPiece: string;
        if (blockCount < BlockQueue.length) {
            nextQueue = queues[blockCount + 1];
            nextHoldPiece = holdPieces[blockCount + 1];
        } else {
            nextQueue = '';
            nextHoldPiece = QueueHoldPieceNone;
        }
        await newQueueChange(QueueIPiece + nextQueue, nextHoldPiece, true, false);
        await newMap(MapTypeAddToCurrentBoardOnTop, null);
        await newRuleset(RulesetTypeFastDropLock);
        const judgeTriggerID = `judge_block${blockCount}`;
        await newRelativeTrigger(RelativeTriggerTypeLines, 1, judgeTriggerID)
        await newTrigger(TriggerTypeExternalConditional, judgeTriggerID);
        await newCondition(ConditionTypePCs, `=${blockCount + actualPCCounts[blockCount]}`, false, ConditionResultTypeGameOver);
        await newCondition(ConditionTypeLines, `=${totalLinesCleared[blockCount] + 2 * blockCount}`, false, ConditionResultTypeGameOver);
        mapListForBlock.push(await newMap(MapTypeReplaceBoard, blockCount));
        await newRuleset(RulesetTypeDefault);
    }

    async function makeDemoCycles(blockCount: number, totalBlocks: number, queue: string, finalTriggerID: string, mapListsBySection: Object, holdPiece: string): Promise<Array<any>> {
        for (; blockCount <= totalBlocks; blockCount++) {
            let triggerSuffix = '';
            let triggerSection = 1;
            let demoTriggerID = `demo_block${blockCount}` + triggerSuffix;
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
                demoTriggerID = `demo_block${blockCount}` + triggerSuffix
                await newQueueChange(queue, holdPiece, true, false);
            }
            if (!(mapListsBySection[blockCount] instanceof Array)) {
                mapListsBySection[blockCount] = new Array<HTMLFormElement>();
            }
            if (typeof fumenWithFullLines[blockCount] === 'string') {
                triggerSuffix = `_part_${triggerSection}`;
                let afterFullLinesTriggerID = `demo_block${blockCount}` + triggerSuffix;
                await newRelativeTrigger(RelativeTriggerTypeTime, PauseHowLongBetweenPieces, afterFullLinesTriggerID);
                await newTrigger(TriggerTypeExternalConditional, afterFullLinesTriggerID);
                triggerSection++;
                triggerSuffix = `_part_${triggerSection}`;
                demoTriggerID = `demo_block${blockCount}` + triggerSuffix
                mapsWithFullLines[blockCount] = await newMap(MapTypeReplaceBoard, 0);
                await updateMapContent(mapsWithFullLines[blockCount], fumenWithFullLines[blockCount]);
            }
            await demoCycle(blockCount, demoTriggerID, queue, holdPiece, mapListsBySection[blockCount]);
            queue = queue.slice(1);
        }
        await newRelativeTrigger(RelativeTriggerTypeTime, PauseHowLongBetweenPieces * 2, finalTriggerID);
        return [holdPiece, queue];
    }

    // 1 cycle per block in BlockQueue
    async function makeCycles(blockCount: number, totalBlocks: number, queues: Array<string>, holdPieces: Array<string>, mapListsBySection: Object): Promise<void> {
        for (; blockCount <= totalBlocks; blockCount++) {
            if (!(mapListsBySection[blockCount] instanceof Array)) {
                mapListsBySection[blockCount] = new Array<HTMLFormElement>();
            }
            await cycle(blockCount, queues, holdPieces, mapListsBySection[blockCount]);
        }
        if (HowManyBlocksPerSection > 0 && blockCount <= HowManyBlocks && blockCount <= HowManyDemoBlocks) {
            const queueTriggerID = `before_demo_${blockCount}`;
            await newQueueChange(queues[blockCount], holdPieces[blockCount], true, false, true);
            await newRelativeTrigger(RelativeTriggerTypeBlocks, 0, queueTriggerID)
            await newTrigger(TriggerTypeExternalConditional, queueTriggerID);
        }
    }

    async function initUserMode(queue: string) {
        await newTrigger(TriggerTypeBeforeGame, null);
        if (!hasHold) {
            await newRuleset(RulesetTypeDefault);
        }
        await newQueueChange(queue, QueueHoldPieceNone, true, false);
        await newTrigger(TriggerTypeOnGameStart, null);
        await newQueueChange(queue, QueueHoldPieceNone, true, false);
    }

    function setTotalSections(): void {
        totalSections = HowManyBlocksPerSection > 0 ? Math.ceil(HowManyBlocks / HowManyBlocksPerSection) : 1;
    }

    let totalSections;

    function totalComponents(howManyBlocks: number, howManyBlocksPerSection: number, howManyDemoBlocks: number, blockQueue: string, beginningAndEndComponents: boolean, totalSections: number): number {
        if (howManyDemoBlocks < howManyBlocks) {
            const demoBlockQueue = blockQueue.match(new RegExp(`([ZSJLOIT]H?){${howManyDemoBlocks}}`))[0];
            const totalDemoSections = howManyBlocksPerSection > 0 ? Math.ceil(howManyDemoBlocks / howManyBlocksPerSection) : 1;
            return totalComponents(howManyDemoBlocks, howManyBlocksPerSection, howManyDemoBlocks, blockQueue, beginningAndEndComponents, totalDemoSections) +
                totalComponents(howManyBlocks - howManyDemoBlocks, 0, howManyBlocks - howManyDemoBlocks, blockQueue.slice(demoBlockQueue.length), false, totalSections - totalDemoSections);
        }
        // newTrigger(TriggerTypeBeforeGame), newQueueChange(queue), newTrigger(TriggerTypeOnGameStart), newQueueChange(queue)
        let initialComponents = 4;
        if (!hasHold) {
            // newRuleset(RulesetTypeDefault)
            initialComponents++;
        }
        // removeComponent(latestComponent()), removeComponent(latestComponent())
        let componentsRemovedAtTheEnd = 2;
        if (!beginningAndEndComponents) {
            initialComponents = componentsRemovedAtTheEnd = 0;
        }
        // newRelativeTrigger(RelativeTriggerTypeTime), newTrigger(TriggerTypeExternalConditional), newMap(), newQueueChange()
        const componentsPerDemoCycle = howManyBlocksPerSection > 0 ? 4 : 0;
        // newTrigger(TriggerTypeOnSpecificBlockNumber), newMap(MapTypeSubtractFromCurrentBoard),
        // newQueueChange(QueueIPiece), newMap(MapTypeAddToCurrentBoardOnTop), newRuleset(RulesetTypeFastDropLock),
        // newRelativeTrigger(RelativeTriggerTypeLines), newTrigger(TriggerTypeExternalConditional), newCondition(ConditionTypePCs),
        // newCondition(ConditionTypeLines), newMap(MapTypeReplaceBoard), newRuleset(RulesetTypeDefault)
        const componentsPerCycle = 11;
        // newRelativeTrigger(RelativeTriggerTypeTime) + newTrigger(TriggerTypeExternalConditional), newMap(), newQueueChange()
        const componentsPerDemoCycleSection = howManyBlocksPerSection > 0 ? (1 + 3) : 0;
        // newQueueChange(queue), newRelativeTrigger(RelativeTriggerTypeBlocks), newTrigger(TriggerTypeExternalConditional)
        const componentsPerCycleSection = howManyBlocksPerSection > 0 ? 3 : 0;
        // newRelativeTrigger(RelativeTriggerTypeTime), newTrigger(TriggerTypeExternalConditional), newQueueChange()
        const componentsPerHold = howManyBlocksPerSection > 0 ? 3 : 0;
        // newRelativeTrigger(RelativeTriggerTypeTime), newTrigger(TriggerTypeExternalConditional), newMap()
        const componentsPerLineClear = howManyBlocksPerSection > 0 ? 3 : 0;
        // Gets number of holds in within howManyBlocks blocks
        const totalHolds = (blockQueue.match(new RegExp(`([ZSJLOIT]H?){${howManyBlocks}}`))[0].match(/H(?!$)/g) || []).length
        const totalLineClears = Object.keys(fumenWithFullLines).filter(pieceIndex => parseInt(pieceIndex) <= howManyBlocks).length;
        return initialComponents +
            (componentsPerDemoCycle + componentsPerCycle) * howManyBlocks +
            (componentsPerDemoCycleSection + componentsPerCycleSection) * totalSections - componentsPerCycleSection +
            componentsPerHold * totalHolds +
            componentsPerLineClear * totalLineClears -
            componentsRemovedAtTheEnd;
    }


    function fumenSaveButton(): HTMLButtonElement {
        return document.querySelector('div.fumen-section button.load-fumen') as HTMLButtonElement;
    }

    function newDiv(parentElement: HTMLElement, ...classes: Array<string>): HTMLDivElement {
        const row: HTMLDivElement = document.createElement('div');
        row.classList.add(...classes);
        if (parentElement instanceof HTMLElement) {
            parentElement.appendChild(row);
        }
        return row;
    }

    const sectionID: string = 'blocks-per-section';

    async function fumenSection() {
        const fumenSection: HTMLDivElement = newDiv(null, 'fumen-section', 'col-sm-10');
        const mainRow: HTMLDivElement = newDiv(fumenSection, 'row');

        const buttonCol: HTMLDivElement = newDiv(mainRow, 'col-sm-2');
        const loadFumenRow: HTMLDivElement = newDiv(buttonCol, 'row')
        const loadFumenButton: HTMLButtonElement = document.createElement('button');
        loadFumenButton.classList.add('load-fumen');
        loadFumenButton.textContent = 'Load fumen';
        loadFumenButton.addEventListener('click', loadFumenToMaps);
        loadFumenButton.classList.add(...['col-sm-12', 'btn', 'btn-sm', 'btn-warning', 'control-label'])
        loadFumenRow.appendChild(loadFumenButton);

        const exampleFumenRow: HTMLDivElement = newDiv(buttonCol, 'row')
        const exampleFumenButton: HTMLButtonElement = document.createElement('button');
        exampleFumenButton.classList.add('example-fumen');
        exampleFumenButton.textContent = 'Example fumen';
        exampleFumenButton.addEventListener('click', async () => await saveTextInput(fumenInput, ExampleFumen));
        exampleFumenButton.classList.add(...['col-sm-12', 'btn', 'btn-sm', 'btn-info', 'control-label'])
        exampleFumenRow.appendChild(exampleFumenButton);

        const inputsContainer: HTMLDivElement = newDiv(mainRow, 'col-sm-10');
        const fumenContainer: HTMLDivElement = newDiv(inputsContainer, 'form-group')
        const fumenInput: HTMLInputElement = document.createElement('input');
        const inputAttributes = {
            id: 'fumen-input',
            placeholder: 'Enter fumen here',
            class: 'form-control',
            type: 'text',
            autocomplete: 'off',
            autocorrect: 'off',
            autocapitalize: 'off',
            spellcheck: 'false'
        };
        for (const attribute in inputAttributes) {
            fumenInput.setAttribute(attribute, inputAttributes[attribute]);
        }
        fumenContainer.appendChild(fumenInput);

        const sectionContainer: HTMLDivElement = newDiv(inputsContainer, 'form-group')
        const sectionLabel: HTMLLabelElement = document.createElement('label');
        sectionLabel.textContent = 'Blocks per stage';
        sectionLabel.classList.add('col-sm-3', 'control-label');
        sectionLabel.setAttribute('for', sectionID)
        sectionContainer.appendChild(sectionLabel);
        const selectContainer = newDiv(sectionContainer, 'col-sm-5');
        const sectionSelect: HTMLSelectElement = document.createElement('select');
        sectionSelect.classList.add('form-control');
        sectionSelect.id = sectionID;
        for (let optionValue = 0; optionValue <= 21; optionValue++) {
            const option: HTMLOptionElement = document.createElement('option');
            option.value = optionValue.toString();
            option.textContent = optionValue.toString();
            if (optionValue === 0) {
                option.textContent += ' (challenge mode)';
            } else if (optionValue === HowManyBlocksPerSection) {
                option.textContent += ' (default)';
                option.selected = true;
            }
            sectionSelect.appendChild(option);
        }
        sectionContainer.appendChild(selectContainer).appendChild(sectionSelect);

        fumenSection.appendChild(mainRow);
        const saveButtonDiv: HTMLDivElement = saveAllButton().parentNode as HTMLDivElement;
        saveButtonDiv.classList.remove('col-sm-12');
        saveButtonDiv.classList.add('col-sm-2');
        saveButtonDiv.parentNode.parentNode.insertBefore(fumenSection, saveButtonDiv.parentNode);
        fumenInput.focus();

        return loadFumenButton;
    }

    let mapListsByPieceIndex: Object = {};
    let fumenWithFullLines: Object = {};
    let mapsWithFullLines: Object = {};

    function setDefaultRuleset() {
        const defaultRuleset = {};
        if (!hasHold) {
            defaultRuleset['hasHold'] = false;
        }
        RulesetTypeDefault = JSON.stringify(defaultRuleset);
    }

    let hasHold: boolean;

    function buildQueues(queues: Array<string>, holdPieces: Array<string>, holdPiece: string) {
        let queue = BlockQueue;
        let blockCount = 1;
        while (queue.length > 0) {
            const shouldHold = queue[0] === QueueHoldPiece;
            queues[blockCount] = queue;
            holdPieces[blockCount] = holdPiece;
            if (shouldHold) {
                let swap = queue[1];
                queue = holdPiece + queue.slice(2);
                holdPiece = swap;
            }
            blockCount++;
            queue = queue.slice(1);
        }
    }

    async function loadComponents(shouldResetStatus: boolean = true) {
        mapListsByPieceIndex = {};
        hasHold = BlockQueue.search(QueueHoldPiece) > -1;
        setDefaultRuleset();
        let fumenButton = fumenSaveButton();
        if (!(fumenButton instanceof HTMLButtonElement)) {
            fumenButton = await fumenSection();
        }
        setTotalSections();
        // If this is a brand-new usermode
        if (latestComponent() === null && HowManyBlocks > 0) {
            fumenButton.classList.add('disabled')
            fumenButton.setAttribute('disabled', '');
            const expectedComponentCount = totalComponents(HowManyBlocks, HowManyBlocksPerSection, HowManyDemoBlocks, BlockQueue, true, totalSections);
            const componentProgress = async () => await updateStatus(`Generated ${document.querySelectorAll('span.cid-disp').length}/${expectedComponentCount} components`);
            // Periodic updates so you know if it's still busy generating stuff
            const progressInterval = window.setInterval(componentProgress, 1000);
            await componentProgress();

            let firstSection: boolean = true;

            const queues: Array<string> = [];
            const holdPieces: Array<string> = [];
            buildQueues(queues, holdPieces, '');
            await initUserMode(queues[1]);

            for (let section = 1; section <= totalSections; section++) {
                let sectionBeginningBlockCount = (section - 1) * HowManyBlocksPerSection + 1;
                let sectionFinalBlockCount;
                let playTriggerID = `play_block${sectionBeginningBlockCount}`;
                if (HowManyBlocksPerSection > 0 && sectionBeginningBlockCount < HowManyDemoBlocks) {
                    sectionFinalBlockCount = section * HowManyBlocksPerSection;
                    if (sectionFinalBlockCount > HowManyDemoBlocks) {
                        sectionFinalBlockCount = HowManyBlocks;
                    } else if (sectionFinalBlockCount > HowManyBlocks) {
                        sectionFinalBlockCount = HowManyBlocks;
                    }
                    await makeDemoCycles(sectionBeginningBlockCount, sectionFinalBlockCount, queues[sectionBeginningBlockCount], playTriggerID, mapListsByPieceIndex, holdPieces[sectionBeginningBlockCount]);
                    await newTrigger(TriggerTypeExternalConditional, playTriggerID);
                    let transitionMap: HTMLFormElement = await newMap(MapTypeReplaceBoard, sectionBeginningBlockCount - 1)
                    if (firstSection) {
                        firstSection = false;
                    } else {
                        mapListsByPieceIndex[sectionBeginningBlockCount - 1].push(transitionMap);
                    }
                    await newQueueChange(queues[sectionBeginningBlockCount], holdPieces[sectionBeginningBlockCount], true, false);
                } else {
                    sectionFinalBlockCount = HowManyBlocks;
                }
                await makeCycles(sectionBeginningBlockCount, sectionFinalBlockCount, queues, holdPieces, mapListsByPieceIndex);
                if (sectionFinalBlockCount === HowManyBlocks) {
                    break;
                }
            }

            // Remove the relative trigger and trigger at the end, trigger ID block#_queue
            await removeComponent(latestComponent());
            await removeComponent(latestComponent());

            //const editButton: HTMLAnchorElement = mapListsByPieceIndex[newMapIndex][0].querySelector(':scope a.open-map-edit');
            //editButton.click();

            clearInterval(progressInterval);
            if (shouldResetStatus) {
                await resetStatus();
            }
            fumenButton.classList.remove('disabled')
            fumenButton.removeAttribute('disabled');
        } else {
            // Otherwise, still add stuff for editing map sequences
            // Disabled for now
            /*setAllMapSubmitButtonText(totalSections);*/
        }
    }

    (async function () {
        await loadComponents();
    })();

    const JstrisPiece: Object = {
        'Empty': 0,
        'Z': 1,
        'L': 2,
        'O': 3,
        'S': 4,
        'I': 5,
        'J': 6,
        'T': 7,
        'Gray': 8,
    }

    const JstrisPieceByFumenPiece: Object = {};

    function mapFumenPiecesToJstrisPieces(fumen) {
        for (let piece in JstrisPiece) {
            JstrisPieceByFumenPiece[fumen.Piece[piece]] = JstrisPiece[piece];
        }
    }

    function blockQueueFromPages(fumen, pages: Pages): string {
        let blockQueue: string = '';
        let quiz: Quiz;
        let usedNextPiece: boolean;
        for (const page of pages) {
            if (HowManyBlocks > 0 && page.index >= HowManyBlocks) {
                break;
            }
            usedNextPiece = false;
            // Having an active mino is nice but not required
            const activeMino: FieldOperation = page.operation;
            if (!page.flags.quiz) {
                if (activeMino instanceof fumen.Mino) {
                    blockQueue += activeMino.type;
                }
                continue;
            }
            quiz = new fumen.Quiz(page.comment);
            let quizPiece: string = quiz['current'];
            const holdPiece: string = quiz['hold'];
            if (activeMino instanceof fumen.Mino && activeMino.type !== quizPiece) {
                blockQueue += QueueHoldPiece;
                if (holdPiece === '') {
                    quizPiece += quiz['next'];
                    usedNextPiece = true;
                }
            }
            blockQueue += quizPiece;
        }
        if (quiz instanceof fumen.Quiz) {
            let nextPieces = quiz.getNextPieces().map(fumen.parsePieceName).join('');
            usedNextPiece = true;
            if (usedNextPiece) {
                nextPieces = nextPieces.slice(1);
            }
            blockQueue += nextPieces;
        }
        return blockQueue;
    }

    async function loadFumenToMaps() {
        const fumenButton: HTMLButtonElement = fumenSaveButton();
        fumenButton.classList.add('btn-warning');
        fumenButton.classList.remove('btn-success');
        fumenButton.textContent = 'Fumen loading...';
        let fumen = new Fumen();
        mapFumenPiecesToJstrisPieces(fumen);

        let index = 1;
        let inputElement: HTMLInputElement = document.querySelector('#fumen-input');
        const pages: Pages = fumen.decode(inputElement.value);
        BlockQueue = blockQueueFromPages(fumen, pages);
        totalLinesCleared = Array(pages.length).fill(0);
        actualPCCounts = Array(pages.length).fill(0);
        fumenWithFullLines = {};
        let cumulativeLinesCleared = 0;
        for (const page of pages) {
            if (HowManyBlocks > 0 && page.index >= HowManyBlocks) {
                break;
            }
            addMinoToField(fumen, page);
            const linesBeforeClearing: Array<number> = page['_field'].field.pieces.slice();
            const clearedThisPage = countLineClears(fumen, page);
            if (clearedThisPage > 0) {
                fumenWithFullLines[page.index + 1] = fumenToMapData(fumen, linesBeforeClearing);
            }
            cumulativeLinesCleared += clearedThisPage;
            totalLinesCleared[page.index + 1] = cumulativeLinesCleared;
        }
        if (BlockQueue.length > 0 && HowManyBlocks === 0) {
            HowManyBlocks = pages.length;
        }
        if (HowManyDemoBlocks === 0) {
            HowManyDemoBlocks = HowManyBlocks;
        }
        HowManyBlocksPerSection = parseInt((document.querySelector(`#${sectionID}`) as HTMLSelectElement).value);
        // BlockQueue length must be at least 1 greater HowManyBlocks
        if (BlockQueue.length === HowManyBlocks) {
            BlockQueue += 'I';
        }
        await loadComponents(false);
        for (const page of pages) {
            if (HowManyBlocks > 0 && page.index >= HowManyBlocks) {
                break;
            }
            await updateSectionMapContent(mapListsByPieceIndex[index++], fumenToMapData(fumen, page['_field'].field['pieces']));
        }
        fumenButton.classList.add('btn-success');
        fumenButton.classList.remove('btn-warning');
        fumenButton.textContent = 'Fumen loaded!';
        await resetStatus();
    }

    let rowCount = 20;
    let columnCount = 10;
    let emptyRow = new Array(columnCount);
    let totalLinesCleared = [];

    function addMinoToField(fumen, page: Page) {
        const field: PlayField = page['_field'].field;
        const operation: FieldOperation = page.operation;
        // Having an active mino is nice but not required
        if (operation instanceof Object) {
            const filledMino: Mino = page.mino();
            field.fill({
                type: fumen.parsePiece(operation.type),
                rotation: fumen.parseRotation(operation.rotation),
                x: operation.x,
                y: operation.y
            });
            for (const {x, y} of filledMino.positions()) {
                field.set(x, y, fumen.parsePiece(filledMino.type));
            }
        }
    }

    function removeMinoFromField(fumen, page: Page) {
        const field: PlayField = page['_field'].field;
        const operation: FieldOperation = page.operation;
        if (operation instanceof Object) {
            const filledMino: Mino = page.mino();
            field.fill({
                type: fumen.parsePiece(operation.type),
                rotation: fumen.parseRotation(operation.rotation),
                x: operation.x,
                y: operation.y
            });
            for (const {x, y} of filledMino.positions()) {
                field.set(x, y, fumen.Piece.Empty);
            }
        }
    }

    let actualPCCounts: Array<number>;

    function countLineClears(fumen, page: Page): number {
        let linesCleared = 0;
        const pieces: Array<number> = page['_field'].field.pieces;
        let finalRow = rowCount;
        rowLoop:
            for (let row = 0; row < finalRow;) {
                let pieceIndex = row++ * columnCount;
                const nextPieceIndex = row * columnCount;
                for (; pieceIndex < nextPieceIndex; pieceIndex++) {
                    if (pieces[pieceIndex] === fumen.Piece.Empty) {
                        continue rowLoop;
                    }
                }
                linesCleared++;
                pieces.splice(--row * columnCount, columnCount);
                pieces.push(...emptyRow);
                --finalRow;

            }
        if (page.index > 0) {
            actualPCCounts[page.index + 1] = actualPCCounts[page.index];
        }
        const maxPiece = Math.max(...pieces.slice(0, (rowCount - 1) * columnCount));
        if (maxPiece === 0) {
            actualPCCounts[page.index + 1]++;
        }
        return linesCleared;
    }

    function fumenToMapData(fumen, fieldPieces: Array<number>): string {
        const fieldSize = rowCount * columnCount / 2; // 2 pieces per byte
        const mapDataBuffer: ArrayBuffer = new ArrayBuffer(fieldSize);
        const mapDataField: Uint8Array = new Uint8Array(mapDataBuffer);

        let fieldIndex = fieldSize;
        for (let row = 0; row < rowCount; row++) {
            for (let column = columnCount - 2; column >= 0; column -= 2) {
                mapDataField[--fieldIndex] = JstrisPieceByFumenPiece[fieldPieces[columnCount * row + column]] << 4 |
                    JstrisPieceByFumenPiece[fieldPieces[columnCount * row + column + 1]];
            }
        }
        return window.btoa(String.fromCharCode.apply(null, mapDataField));
    }

    function Fumen() {
        // From https://github.com/knewjade/tetris-fumen/tree/4a77d0dc52
        /**
         MIT License

         Copyright (c) 2019

         Permission is hereby granted, free of charge, to any person obtaining a copy
         of this software and associated documentation files (the "Software"), to deal
         in the Software without restriction, including without limitation the rights
         to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
         copies of the Software, and to permit persons to whom the Software is
         furnished to do so, subject to the following conditions:

         The above copyright notice and this permission notice shall be included in all
         copies or substantial portions of the Software.

         THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
         IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
         FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
         AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
         LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
         OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
         SOFTWARE.
         */

        interface Action {
            piece: InnerOperation;
            rise: boolean;
            mirror: boolean;
            colorize: boolean;
            comment: boolean;
            lock: boolean;
        }

        function decodeBool(n: number) {
            return n !== 0;
        }

        const createActionDecoder = (width: number, fieldTop: number, garbageLine: number) => {
            const fieldMaxHeight = fieldTop + garbageLine;
            const numFieldBlocks = fieldMaxHeight * width;

            function decodePiece(n: number) {
                switch (n) {
                    case 0:
                        return Piece.Empty;
                    case 1:
                        return Piece.I;
                    case 2:
                        return Piece.L;
                    case 3:
                        return Piece.O;
                    case 4:
                        return Piece.Z;
                    case 5:
                        return Piece.T;
                    case 6:
                        return Piece.J;
                    case 7:
                        return Piece.S;
                    case 8:
                        return Piece.Gray;
                }
                throw new Error('Unexpected piece');
            }

            function decodeRotation(n: number) {
                switch (n) {
                    case 0:
                        return Rotation.Reverse;
                    case 1:
                        return Rotation.Right;
                    case 2:
                        return Rotation.Spawn;
                    case 3:
                        return Rotation.Left;
                }
                throw new Error('Unexpected rotation');
            }

            function decodeCoordinate(n: number, piece: Piece, rotation: Rotation) {
                let x = n % width;
                const originY = Math.floor(n / 10);
                let y = fieldTop - originY - 1;

                if (piece === Piece.O && rotation === Rotation.Left) {
                    x += 1;
                    y -= 1;
                } else if (piece === Piece.O && rotation === Rotation.Reverse) {
                    x += 1;
                } else if (piece === Piece.O && rotation === Rotation.Spawn) {
                    y -= 1;
                } else if (piece === Piece.I && rotation === Rotation.Reverse) {
                    x += 1;
                } else if (piece === Piece.I && rotation === Rotation.Left) {
                    y -= 1;
                } else if (piece === Piece.S && rotation === Rotation.Spawn) {
                    y -= 1;
                } else if (piece === Piece.S && rotation === Rotation.Right) {
                    x -= 1;
                } else if (piece === Piece.Z && rotation === Rotation.Spawn) {
                    y -= 1;
                } else if (piece === Piece.Z && rotation === Rotation.Left) {
                    x += 1;
                }

                return {x, y};
            }

            return {
                decode: (v: number): Action => {
                    let value = v;
                    const type = decodePiece(value % 8);
                    value = Math.floor(value / 8);
                    const rotation = decodeRotation(value % 4);
                    value = Math.floor(value / 4);
                    const coordinate = decodeCoordinate(value % numFieldBlocks, type, rotation);
                    value = Math.floor(value / numFieldBlocks);
                    const isBlockUp = decodeBool(value % 2);
                    value = Math.floor(value / 2);
                    const isMirror = decodeBool(value % 2);
                    value = Math.floor(value / 2);
                    const isColor = decodeBool(value % 2);
                    value = Math.floor(value / 2);
                    const isComment = decodeBool(value % 2);
                    value = Math.floor(value / 2);
                    const isLock = !decodeBool(value % 2);

                    return {
                        rise: isBlockUp,
                        mirror: isMirror,
                        colorize: isColor,
                        comment: isComment,
                        lock: isLock,
                        piece: {
                            ...coordinate,
                            type,
                            rotation,
                        },
                    };
                },
            };
        };

        function encodeBool(flag: boolean): number {
            return flag ? 1 : 0;
        }

        const createActionEncoder = (width: number, fieldTop: number, garbageLine: number) => {
            const fieldMaxHeight = fieldTop + garbageLine;
            const numFieldBlocks = fieldMaxHeight * width;

            function encodePosition(
                operation: { x: number, y: number, type: Piece, rotation: Rotation },
            ): number {
                const {type, rotation} = operation;
                let x = operation.x;
                let y = operation.y;

                if (!isMinoPiece(type)) {
                    x = 0;
                    y = 22;
                } else if (type === Piece.O && rotation === Rotation.Left) {
                    x -= 1;
                    y += 1;
                } else if (type === Piece.O && rotation === Rotation.Reverse) {
                    x -= 1;
                } else if (type === Piece.O && rotation === Rotation.Spawn) {
                    y += 1;
                } else if (type === Piece.I && rotation === Rotation.Reverse) {
                    x -= 1;
                } else if (type === Piece.I && rotation === Rotation.Left) {
                    y += 1;
                } else if (type === Piece.S && rotation === Rotation.Spawn) {
                    y += 1;
                } else if (type === Piece.S && rotation === Rotation.Right) {
                    x += 1;
                } else if (type === Piece.Z && rotation === Rotation.Spawn) {
                    y += 1;
                } else if (type === Piece.Z && rotation === Rotation.Left) {
                    x -= 1;
                }

                return (fieldTop - y - 1) * width + x;
            }

            function encodeRotation({type, rotation}: { type: Piece, rotation: Rotation }): number {
                if (!isMinoPiece(type)) {
                    return 0;
                }

                switch (rotation) {
                    case Rotation.Reverse:
                        return 0;
                    case Rotation.Right:
                        return 1;
                    case Rotation.Spawn:
                        return 2;
                    case Rotation.Left:
                        return 3;
                }

                throw new Error('No reachable');
            }

            return {
                encode: (action: Action): number => {
                    const {lock, comment, colorize, mirror, rise, piece} = action;

                    let value = encodeBool(!lock);
                    value *= 2;
                    value += encodeBool(comment);
                    value *= 2;
                    value += (encodeBool(colorize));
                    value *= 2;
                    value += encodeBool(mirror);
                    value *= 2;
                    value += encodeBool(rise);
                    value *= numFieldBlocks;
                    value += encodePosition(piece);
                    value *= 4;
                    value += encodeRotation(piece);
                    value *= 8;
                    value += piece.type;

                    return value;
                },
            };
        };
        const ENCODE_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

        class Buffer {
            static readonly tableLength: number = ENCODE_TABLE.length;

            private readonly values: number[];

            constructor(data: string = '') {
                this.values = data.split('').map(decodeToValue);
            }

            poll(max: number): number {
                let value = 0;
                for (let count = 0; count < max; count += 1) {
                    const v = this.values.shift();
                    if (v === undefined) {
                        throw new Error('Unexpected fumen');
                    }
                    value += v * Math.pow(Buffer.tableLength, count);
                }
                return value;
            }

            push(value: number, splitCount: number = 1): void {
                let current = value;
                for (let count = 0; count < splitCount; count += 1) {
                    this.values.push(current % Buffer.tableLength);
                    current = Math.floor(current / Buffer.tableLength);
                }
            }

            merge(postBuffer: Buffer): void {
                for (const value of postBuffer.values) {
                    this.values.push(value);
                }
            }

            isEmpty(): boolean {
                return this.values.length === 0;
            }

            get length(): number {
                return this.values.length;
            }

            get(index: number): number {
                return this.values[index];
            }

            set(index: number, value: number): void {
                this.values[index] = value;
            }

            toString(): string {
                return this.values.map(encodeFromValue).join('');
            }
        }

        function decodeToValue(v: string): number {
            return ENCODE_TABLE.indexOf(v);
        }

        function encodeFromValue(index: number): string {
            return ENCODE_TABLE[index];
        }

        const COMMENT_TABLE =
            ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
        const MAX_COMMENT_CHAR_VALUE = COMMENT_TABLE.length + 1;

        const createCommentParser = () => {
            return {
                decode: (v: number): string => {
                    let str: string = '';
                    let value = v;
                    for (let count = 0; count < 4; count += 1) {
                        const index = value % MAX_COMMENT_CHAR_VALUE;
                        str += COMMENT_TABLE[index];
                        value = Math.floor(value / MAX_COMMENT_CHAR_VALUE);
                    }
                    return str;
                },
                encode: (ch: string, count: number): number => {
                    return COMMENT_TABLE.indexOf(ch) * Math.pow(MAX_COMMENT_CHAR_VALUE, count);
                },
            };
        };

        class Page {
            private _field: InnerField;

            constructor(
                public index: number,
                field: InnerField,
                public operation: FieldOperation | undefined,
                public comment: string,
                public flags: { lock: boolean; mirror: boolean; colorize: boolean; rise: boolean; quiz: boolean },
                public refs: { field?: number; comment?: number },
            ) {
                this._field = field.copy();
            }

            get field(): Field {
                return new Field(this._field.copy());
            }

            set field(field: Field) {
                this._field = createInnerField(field);
            }

            mino(): Mino {
                return Mino.from(this.operation);
            }
        }

        type Pages = Page[];

        function extract(str: string): { version: '115' | '110', data: string } {
            const format = (version: '115' | '110', data: string) => {
                const trim = data.trim().replace(/[?\s]+/g, '');
                return {version, data: trim};
            };

            let data = str;

            // url parameters
            const paramIndex = data.indexOf('&');
            if (0 <= paramIndex) {
                data = data.substring(0, paramIndex);
            }

            // v115@~
            {
                const match = str.match(/[vmd]115@/);
                if (match !== undefined && match !== null && match.index !== undefined) {
                    const sub = data.substr(match.index + 5);
                    return format('115', sub);
                }
            }

            // v110@~
            {
                const match = str.match(/[vmd]110@/);
                if (match !== undefined && match !== null && match.index !== undefined) {
                    const sub = data.substr(match.index + 5);
                    return format('110', sub);
                }
            }

            throw new Error('Unsupported fumen version');
        }

        this.decode = function (fumen: string): Pages {
            const {version, data} = extract(fumen);
            switch (version) {
                case '115':
                    return innerDecode(data, 23);
                case '110':
                    return innerDecode(data, 21);
            }
            throw new Error('Unsupported fumen version');
        }

        function innerDecode(data: string, fieldTop: number): Pages {
            const fieldMaxHeight = fieldTop + FieldConstants.GarbageLine;
            const numFieldBlocks = fieldMaxHeight * FieldConstants.Width;

            const buffer = new Buffer(data);

            const updateField = (prev: InnerField) => {
                const result = {
                    changed: true,
                    field: prev,
                };

                let index = 0;
                while (index < numFieldBlocks) {
                    const diffBlock = buffer.poll(2);
                    const diff = Math.floor(diffBlock / numFieldBlocks);

                    const numOfBlocks = diffBlock % numFieldBlocks;

                    if (diff === 8 && numOfBlocks === numFieldBlocks - 1) {
                        result.changed = false;
                    }

                    for (let block = 0; block < numOfBlocks + 1; block += 1) {
                        const x = index % FieldConstants.Width;
                        const y = fieldTop - Math.floor(index / FieldConstants.Width) - 1;
                        result.field.addNumber(x, y, diff - 8);
                        index += 1;
                    }
                }

                return result;
            };

            let pageIndex = 0;
            let prevField = createNewInnerField();

            const store: {
                repeatCount: number,
                refIndex: {
                    comment: number,
                    field: number,
                };
                quiz?: Quiz,
                lastCommentText: string;
            } = {
                repeatCount: -1,
                refIndex: {
                    comment: 0,
                    field: 0,
                },
                quiz: undefined,
                lastCommentText: '',
            };

            const pages: Pages = [];
            const actionDecoder = createActionDecoder(FieldConstants.Width, fieldTop, FieldConstants.GarbageLine);
            const commentDecoder = createCommentParser();

            while (!buffer.isEmpty()) {
                // Parse field
                let currentFieldObj;
                if (0 < store.repeatCount) {
                    currentFieldObj = {
                        field: prevField,
                        changed: false,
                    };

                    store.repeatCount -= 1;
                } else {
                    currentFieldObj = updateField(prevField.copy());

                    if (!currentFieldObj.changed) {
                        store.repeatCount = buffer.poll(1);
                    }
                }

                // Parse action
                const actionValue = buffer.poll(3);
                const action = actionDecoder.decode(actionValue);

                // Parse comment
                let comment: { text?: string, ref?: number };
                if (action.comment) {
                    // コメントに更新があるとき
                    const commentValues: number[] = [];
                    const commentLength = buffer.poll(2);

                    for (let commentCounter = 0; commentCounter < Math.floor((commentLength + 3) / 4); commentCounter += 1) {
                        const commentValue = buffer.poll(5);
                        commentValues.push(commentValue);
                    }

                    let flatten: string = '';
                    for (const value of commentValues) {
                        flatten += commentDecoder.decode(value);
                    }

                    const commentText = unescape(flatten.slice(0, commentLength));
                    store.lastCommentText = commentText;
                    comment = {text: commentText};
                    store.refIndex.comment = pageIndex;

                    const text = comment.text;
                    if (Quiz.isQuizComment(text)) {
                        try {
                            store.quiz = new Quiz(text);
                        } catch (e) {
                            store.quiz = undefined;
                        }
                    } else {
                        store.quiz = undefined;
                    }
                } else if (pageIndex === 0) {
                    // コメントに更新がないが、先頭のページのとき
                    comment = {text: ''};
                } else {
                    // コメントに更新がないとき
                    comment = {
                        text: store.quiz !== undefined ? store.quiz.format().toString() : undefined,
                        ref: store.refIndex.comment,
                    };
                }

                // Quiz用の操作を取得し、次ページ開始時点のQuizに1手進める
                let quiz = false;
                if (store.quiz !== undefined) {
                    quiz = true;

                    if (store.quiz.canOperate() && action.lock) {
                        if (isMinoPiece(action.piece.type)) {
                            try {
                                const nextQuiz = store.quiz.nextIfEnd();
                                const operation = nextQuiz.getOperation(action.piece.type);
                                store.quiz = nextQuiz.operate(operation);
                            } catch (e) {
                                // console.error(e.message);

                                // Not operate
                                store.quiz = store.quiz.format();
                            }
                        } else {
                            store.quiz = store.quiz.format();
                        }
                    }
                }

                // データ処理用に加工する
                let currentPiece: {
                    type: Piece;
                    rotation: Rotation;
                    x: number;
                    y: number;
                } | undefined;
                if (action.piece.type !== Piece.Empty) {
                    currentPiece = action.piece;
                }

                // pageの作成
                let field: { ref?: number };
                if (currentFieldObj.changed || pageIndex === 0) {
                    // フィールドに変化があったとき
                    // フィールドに変化がなかったが、先頭のページだったとき
                    field = {};
                    store.refIndex.field = pageIndex;
                } else {
                    // フィールドに変化がないとき
                    field = {ref: store.refIndex.field};
                }

                pages.push(new Page(
                    pageIndex,
                    currentFieldObj.field,
                    currentPiece !== undefined ? Mino.from({
                        type: parsePieceName(currentPiece.type),
                        rotation: parseRotationName(currentPiece.rotation),
                        x: currentPiece.x,
                        y: currentPiece.y,
                    }) : undefined,
                    comment.text !== undefined ? comment.text : store.lastCommentText,
                    {
                        quiz,
                        lock: action.lock,
                        mirror: action.mirror,
                        colorize: action.colorize,
                        rise: action.rise,
                    },
                    {
                        field: field.ref,
                        comment: comment.ref,
                    },
                ));

                // callback(
                //     currentFieldObj.field.copy()
                //     , currentPiece
                //     , store.quiz !== undefined ? store.quiz.format().toString() : store.lastCommentText,
                // );

                pageIndex += 1;

                if (action.lock) {
                    if (isMinoPiece(action.piece.type)) {
                        currentFieldObj.field.fill(action.piece);
                    }

                    currentFieldObj.field.clearLine();

                    if (action.rise) {
                        currentFieldObj.field.riseGarbage();
                    }

                    if (action.mirror) {
                        currentFieldObj.field.mirror();
                    }
                }

                prevField = currentFieldObj.field;
            }

            return pages;
        }

        enum Piece {
            Empty = 0,
            I = 1,
            L = 2,
            O = 3,
            Z = 4,
            T = 5,
            J = 6,
            S = 7,
            Gray = 8,
        }

        this.Piece = Piece;

        type PieceType = 'I' | 'L' | 'O' | 'Z' | 'T' | 'J' | 'S' | 'X' | '_';

        function isMinoPiece(piece: Piece) {
            return piece !== Piece.Empty && piece !== Piece.Gray;
        }

        function parsePieceName(piece: Piece): PieceType {
            switch (piece) {
                case Piece.I:
                    return 'I';
                case Piece.L:
                    return 'L';
                case Piece.O:
                    return 'O';
                case Piece.Z:
                    return 'Z';
                case Piece.T:
                    return 'T';
                case Piece.J:
                    return 'J';
                case Piece.S:
                    return 'S';
                case Piece.Gray:
                    return 'X';
                case Piece.Empty:
                    return '_';
            }
            throw new Error(`Unknown piece: ${piece}`);
        }

        this.parsePieceName = parsePieceName;

        function parsePiece(piece: string): Piece {
            switch (piece.toUpperCase()) {
                case 'I':
                    return Piece.I;
                case 'L':
                    return Piece.L;
                case 'O':
                    return Piece.O;
                case 'Z':
                    return Piece.Z;
                case 'T':
                    return Piece.T;
                case 'J':
                    return Piece.J;
                case 'S':
                    return Piece.S;
                case 'X':
                case 'GRAY':
                    return Piece.Gray;
                case ' ':
                case '_':
                case 'EMPTY':
                    return Piece.Empty;
            }
            throw new Error(`Unknown piece: ${piece}`);
        }

        this.parsePiece = parsePiece;

        enum Rotation {
            Spawn = 0,
            Right = 1,
            Reverse = 2,
            Left = 3,
        }

        this.Rotation = Rotation;

        type RotationType = 'spawn' | 'right' | 'reverse' | 'left';

        function parseRotationName(rotation: Rotation): RotationType {
            switch (rotation) {
                case Rotation.Spawn:
                    return 'spawn';
                case Rotation.Left:
                    return 'left';
                case Rotation.Right:
                    return 'right';
                case Rotation.Reverse:
                    return 'reverse';
            }
            throw new Error(`Unknown rotation: ${rotation}`);
        }

        function parseRotation(rotation: RotationType): Rotation {
            switch (rotation.toLowerCase()) {
                case 'spawn':
                    return Rotation.Spawn;
                case 'left':
                    return Rotation.Left;
                case 'right':
                    return Rotation.Right;
                case 'reverse':
                    return Rotation.Reverse;
            }
            throw new Error(`Unknown rotation: ${rotation}`);
        }

        this.parseRotation = parseRotation;

        interface InnerOperation {
            type: Piece;
            rotation: Rotation;
            x: number;
            y: number;
        }

        interface EncodePage {
            comment?: string;
            operation?: FieldOperation;
            field?: Field;
            flags?: {
                lock?: boolean;
                mirror?: boolean;
                colorize?: boolean;
                rise?: boolean;
            };
        }

        type EncodePages = EncodePage[];

        function encode(pages: EncodePage[]): string {
            const updateField = (prev: InnerField, current: InnerField) => {
                const {changed, values} = encodeField(prev, current);

                if (changed) {
                    // フィールドを記録して、リピートを終了する
                    buffer.merge(values);
                    lastRepeatIndex = -1;
                } else if (lastRepeatIndex < 0 || buffer.get(lastRepeatIndex) === Buffer.tableLength - 1) {
                    // フィールドを記録して、リピートを開始する
                    buffer.merge(values);
                    buffer.push(0);
                    lastRepeatIndex = buffer.length - 1;
                } else if (buffer.get(lastRepeatIndex) < (Buffer.tableLength - 1)) {
                    // フィールドは記録せず、リピートを進める
                    const currentRepeatValue = buffer.get(lastRepeatIndex);
                    buffer.set(lastRepeatIndex, currentRepeatValue + 1);
                }
            };

            let lastRepeatIndex = -1;
            const buffer = new Buffer();
            let prevField = createNewInnerField();

            const actionEncoder = createActionEncoder(FieldConstants.Width, 23, FieldConstants.GarbageLine);
            const commentParser = createCommentParser();

            let prevComment: string | undefined = '';
            let prevQuiz: Quiz | undefined = undefined;

            const innerEncode = (index: number) => {
                const currentPage = pages[index];
                currentPage.flags = currentPage.flags ? currentPage.flags : {};

                const field: Field = currentPage.field;

                const currentField: InnerField = field !== undefined ? createInnerField(field) : prevField.copy();

                // フィールドの更新
                updateField(prevField, currentField);

                // アクションの更新
                const currentComment = currentPage.comment !== undefined
                    ? ((index !== 0 || currentPage.comment !== '') ? currentPage.comment : undefined)
                    : undefined;
                const piece = currentPage.operation !== undefined ? {
                    type: parsePiece(currentPage.operation.type),
                    rotation: parseRotation(currentPage.operation.rotation),
                    x: currentPage.operation.x,
                    y: currentPage.operation.y,
                } : {
                    type: Piece.Empty,
                    rotation: Rotation.Reverse,
                    x: 0,
                    y: 22,
                };

                let nextComment;
                if (currentComment !== undefined) {
                    if (currentComment.startsWith('#Q=')) {
                        // Quiz on
                        if (prevQuiz !== undefined && prevQuiz.format().toString() === currentComment) {
                            nextComment = undefined;
                        } else {
                            nextComment = currentComment;
                            prevComment = nextComment;
                            prevQuiz = new Quiz(currentComment);
                        }
                    } else {
                        // Quiz off
                        if (prevQuiz !== undefined && prevQuiz.format().toString() === currentComment) {
                            nextComment = undefined;
                            prevComment = currentComment;
                            prevQuiz = undefined;
                        } else {
                            nextComment = prevComment !== currentComment ? currentComment : undefined;
                            prevComment = prevComment !== currentComment ? nextComment : prevComment;
                            prevQuiz = undefined;
                        }
                    }
                } else {
                    nextComment = undefined;
                    prevQuiz = undefined;
                }

                if (prevQuiz !== undefined && prevQuiz.canOperate() && currentPage.flags.lock) {
                    if (isMinoPiece(piece.type)) {
                        try {
                            const nextQuiz = prevQuiz.nextIfEnd();
                            const operation = nextQuiz.getOperation(piece.type);
                            prevQuiz = nextQuiz.operate(operation);
                        } catch (e) {
                            // console.error(e.message);

                            // Not operate
                            prevQuiz = prevQuiz.format();
                        }
                    } else {
                        prevQuiz = prevQuiz.format();
                    }
                }

                const currentFlags = {
                    lock: true,
                    colorize: index === 0,
                    ...currentPage.flags,
                };

                const action = {
                    piece,
                    rise: !!currentFlags.rise,
                    mirror: !!currentFlags.mirror,
                    colorize: !!currentFlags.colorize,
                    lock: !!currentFlags.lock,
                    comment: nextComment !== undefined,
                };

                const actionNumber = actionEncoder.encode(action);
                buffer.push(actionNumber, 3);

                // コメントの更新
                if (nextComment !== undefined) {
                    const comment = escape(currentPage.comment);
                    const commentLength = Math.min(comment.length, 4095);

                    buffer.push(commentLength, 2);

                    // コメントを符号化
                    for (let index = 0; index < commentLength; index += 4) {
                        let value = 0;
                        for (let count = 0; count < 4; count += 1) {
                            const newIndex = index + count;
                            if (commentLength <= newIndex) {
                                break;
                            }
                            const ch = comment.charAt(newIndex);
                            value += commentParser.encode(ch, count);
                        }

                        buffer.push(value, 5);
                    }
                } else if (currentPage.comment === undefined) {
                    prevComment = undefined;
                }

                // 地形の更新
                if (action.lock) {
                    if (isMinoPiece(action.piece.type)) {
                        currentField.fill(action.piece);
                    }

                    currentField.clearLine();

                    if (action.rise) {
                        currentField.riseGarbage();
                    }

                    if (action.mirror) {
                        currentField.mirror();
                    }
                }

                prevField = currentField;
            };

            for (let index = 0; index < pages.length; index += 1) {
                innerEncode(index);
            }

            // テト譜が短いときはそのまま出力する
            // 47文字ごとに?が挿入されるが、実際は先頭にv115@が入るため、最初の?は42文字後になる
            const data = buffer.toString();
            if (data.length < 41) {
                return data;
            }

            // ?を挿入する
            const head = [data.substr(0, 42)];
            const tails = data.substring(42);
            const split = tails.match(/[\S]{1,47}/g) || [];
            return head.concat(split).join('?');
        }

// フィールドをエンコードする
// 前のフィールドがないときは空のフィールドを指定する
// 入力フィールドの高さは23, 幅は10
        function encodeField(prev: InnerField, current: InnerField) {
            const FIELD_TOP = 23;
            const FIELD_MAX_HEIGHT = FIELD_TOP + 1;
            const FIELD_BLOCKS = FIELD_MAX_HEIGHT * FieldConstants.Width;

            const buffer = new Buffer();

            // 前のフィールドとの差を計算: 0〜16
            const getDiff = (xIndex: number, yIndex: number) => {
                const y: number = FIELD_TOP - yIndex - 1;
                return current.getNumberAt(xIndex, y) - prev.getNumberAt(xIndex, y) + 8;
            };

            // データの記録
            const recordBlockCounts = (diff: number, counter: number) => {
                const value: number = diff * FIELD_BLOCKS + counter;
                buffer.push(value, 2);
            };

            // フィールド値から連続したブロック数に変換
            let changed = true;
            let prev_diff = getDiff(0, 0);
            let counter = -1;
            for (let yIndex = 0; yIndex < FIELD_MAX_HEIGHT; yIndex += 1) {
                for (let xIndex = 0; xIndex < FieldConstants.Width; xIndex += 1) {
                    const diff = getDiff(xIndex, yIndex);
                    if (diff !== prev_diff) {
                        recordBlockCounts(prev_diff, counter);
                        counter = 0;
                        prev_diff = diff;
                    } else {
                        counter += 1;
                    }
                }
            }

            // 最後の連続ブロックを処理
            recordBlockCounts(prev_diff, counter);
            if (prev_diff === 8 && counter === FIELD_BLOCKS - 1) {
                changed = false;
            }

            return {
                changed,
                values: buffer,
            };
        }

        interface FieldOperation {
            type: PieceType;
            rotation: RotationType;
            x: number;
            y: number;
        }

        function toMino(operationOrMino: FieldOperation | Mino) {
            return operationOrMino instanceof Mino ? operationOrMino.copy() : Mino.from(operationOrMino);
        }

        class Field {
            public static create(field?: string, garbage?: string): Field {
                return new Field(new InnerField({
                    field: field !== undefined ? PlayField.load(field) : undefined,
                    garbage: garbage !== undefined ? PlayField.loadMinify(garbage) : undefined,
                }));
            }

            constructor(private readonly field: InnerField) {
            }

            canFill(operation?: FieldOperation | Mino): boolean {
                if (operation === undefined) {
                    return true;
                }

                const mino = toMino(operation);
                return this.field.canFillAll(mino.positions());
            }

            canLock(operation?: FieldOperation | Mino): boolean {
                if (operation === undefined) {
                    return true;
                }

                if (!this.canFill(operation)) {
                    return false;
                }

                // Check on the ground
                return !this.canFill({...operation, y: operation.y - 1});
            }

            fill(operation?: FieldOperation | Mino, force: boolean = false): Mino | undefined {
                if (operation === undefined) {
                    return undefined;
                }

                const mino = toMino(operation);

                if (!force && !this.canFill(mino)) {
                    throw Error('Cannot fill piece on field');
                }

                this.field.fillAll(mino.positions(), parsePiece(mino.type));

                return mino;
            }

            put(operation?: FieldOperation | Mino): Mino | undefined {
                if (operation === undefined) {
                    return undefined;
                }

                const mino = toMino(operation);

                for (; 0 <= mino.y; mino.y -= 1) {
                    if (!this.canLock(mino)) {
                        continue;
                    }

                    this.fill(mino);

                    return mino;
                }

                throw Error('Cannot put piece on field');
            }

            clearLine(): void {
                this.field.clearLine();
            }

            at(x: number, y: number): PieceType {
                return parsePieceName(this.field.getNumberAt(x, y));
            }

            set(x: number, y: number, type: PieceType | string): void {
                this.field.setNumberAt(x, y, parsePiece(type));
            }

            copy(): Field {
                return new Field(this.field.copy());
            }

            str(option: { reduced?: boolean, separator?: string, garbage?: boolean } = {}): string {
                let skip = option.reduced !== undefined ? option.reduced : true;
                const separator = option.separator !== undefined ? option.separator : '\n';
                const minY = option.garbage === undefined || option.garbage ? -1 : 0;

                let output = '';

                for (let y = 22; minY <= y; y -= 1) {
                    let line = '';
                    for (let x = 0; x < 10; x += 1) {
                        line += this.at(x, y);
                    }

                    if (skip && line === '__________') {
                        continue;
                    }

                    skip = false;
                    output += line;
                    if (y !== minY) {
                        output += separator;
                    }
                }

                return output;
            }
        }

        class Mino {
            static from(operation: FieldOperation): Mino {
                return new Mino(operation.type, operation.rotation, operation.x, operation.y);
            }

            constructor(
                public type: PieceType,
                public rotation: RotationType,
                public x: number,
                public y: number,
            ) {
            }

            positions(): { x: number, y: number }[] {
                return getBlockXYs(parsePiece(this.type), parseRotation(this.rotation), this.x, this.y).sort((a, b) => {
                    if (a.y === b.y) {
                        return a.x - b.x;
                    }
                    return a.y - b.y;
                });
            }

            operation(): FieldOperation {
                return {
                    type: this.type,
                    rotation: this.rotation,
                    x: this.x,
                    y: this.y,
                };
            }

            isValid(): boolean {
                try {
                    parsePiece(this.type);
                    parseRotation(this.rotation);
                } catch (e) {
                    return false;
                }

                return this.positions().every(({x, y}) => {
                    return 0 <= x && x < 10 && 0 <= y && y < 23;
                });
            }

            copy(): Mino {
                return new Mino(this.type, this.rotation, this.x, this.y);
            }
        }

        this.Mino = Mino;

        const FieldConstants = {
            GarbageLine: 1,
            Width: 10,
            Height: 23,
            PlayBlocks: 23 * 10,  // Height * Width
        };

        function createNewInnerField(): InnerField {
            return new InnerField({});
        }

        function createInnerField(field: Field): InnerField {
            const innerField = new InnerField({});
            for (let y = -1; y < FieldConstants.Height; y += 1) {
                for (let x = 0; x < FieldConstants.Width; x += 1) {
                    const at = field.at(x, y);
                    innerField.setNumberAt(x, y, parsePiece(at));
                }
            }
            return innerField;
        }

        class InnerField {
            private readonly field: PlayField;
            private readonly garbage: PlayField;

            private static create(length: number): PlayField {
                return new PlayField({length});
            }

            constructor({
                            field = InnerField.create(FieldConstants.PlayBlocks),
                            garbage = InnerField.create(FieldConstants.Width),
                        }: {
                            field?: PlayField,
                            garbage?: PlayField,
                        },
            ) {
                this.field = field;
                this.garbage = garbage;
            }

            fill(operation: InnerOperation): void {
                this.field.fill(operation);
            }

            fillAll(positions: { x: number, y: number }[], type: Piece): void {
                this.field.fillAll(positions, type);
            }

            canFill(piece: Piece, rotation: Rotation, x: number, y: number) {
                const positions = getBlockPositions(piece, rotation, x, y);
                return positions.every(([px, py]) => {
                    return 0 <= px && px < 10
                        && 0 <= py && py < FieldConstants.Height
                        && this.getNumberAt(px, py) === Piece.Empty;
                });
            }

            canFillAll(positions: { x: number, y: number }[]) {
                return positions.every(({x, y}) => {
                    return 0 <= x && x < 10
                        && 0 <= y && y < FieldConstants.Height
                        && this.getNumberAt(x, y) === Piece.Empty;
                });
            }

            isOnGround(piece: Piece, rotation: Rotation, x: number, y: number) {
                return !this.canFill(piece, rotation, x, y - 1);
            }

            clearLine(): void {
                this.field.clearLine();
            }

            riseGarbage(): void {
                this.field.up(this.garbage);
                this.garbage.clearAll();
            }

            mirror(): void {
                this.field.mirror();
            }

            shiftToLeft(): void {
                this.field.shiftToLeft();
            }

            shiftToRight(): void {
                this.field.shiftToRight();
            }

            shiftToUp(): void {
                this.field.shiftToUp();
            }

            shiftToBottom(): void {
                this.field.shiftToBottom();
            }

            copy(): InnerField {
                return new InnerField({field: this.field.copy(), garbage: this.garbage.copy()});
            }

            equals(other: InnerField): boolean {
                return this.field.equals(other.field) && this.garbage.equals(other.garbage);
            }

            addNumber(x: number, y: number, value: number): void {
                if (0 <= y) {
                    this.field.addOffset(x, y, value);
                } else {
                    this.garbage.addOffset(x, -(y + 1), value);
                }
            }

            setNumberFieldAt(index: number, value: number): void {
                this.field.setAt(index, value);
            }

            setNumberGarbageAt(index: number, value: number): void {
                this.garbage.setAt(index, value);
            }

            setNumberAt(x: number, y: number, value: number): void {
                return 0 <= y ? this.field.set(x, y, value) : this.garbage.set(x, -(y + 1), value);
            }

            getNumberAt(x: number, y: number): Piece {
                return 0 <= y ? this.field.get(x, y) : this.garbage.get(x, -(y + 1));
            }

            getNumberAtIndex(index: number, isField: boolean): Piece {
                if (isField) {
                    return this.getNumberAt(index % 10, Math.floor(index / 10));
                }
                return this.getNumberAt(index % 10, -(Math.floor(index / 10) + 1));
            }

            toFieldNumberArray(): Piece[] {
                return this.field.toArray();
            }

            toGarbageNumberArray(): Piece[] {
                return this.garbage.toArray();
            }
        }

        class PlayField {
            static load(...lines: string[]): PlayField {
                const blocks = lines.join('').trim();
                return PlayField.loadInner(blocks);
            }

            static loadMinify(...lines: string[]): PlayField {
                const blocks = lines.join('').trim();
                return PlayField.loadInner(blocks, blocks.length);
            }

            private static loadInner(blocks: string, length?: number): PlayField {
                const len = length !== undefined ? length : blocks.length;
                if (len % 10 !== 0) {
                    throw new Error('Num of blocks in field should be mod 10');
                }

                const field = length !== undefined ? new PlayField({length}) : new PlayField({});
                for (let index = 0; index < len; index += 1) {
                    const block = blocks[index];
                    field.set(index % 10, Math.floor((len - index - 1) / 10), parsePiece(block));
                }
                return field;
            }

            private readonly length: number;
            private pieces: Piece[];

            constructor({pieces, length = FieldConstants.PlayBlocks}: {
                pieces?: Piece[],
                length?: number,
            }) {
                if (pieces !== undefined) {
                    this.pieces = pieces;
                } else {
                    this.pieces = Array.from({length}).map(() => Piece.Empty);
                }
                this.length = length;
            }

            get(x: number, y: number): Piece {
                return this.pieces[x + y * FieldConstants.Width];
            }

            addOffset(x: number, y: number, value: number) {
                this.pieces[x + y * FieldConstants.Width] += value;
            }

            set(x: number, y: number, piece: Piece) {
                this.setAt(x + y * FieldConstants.Width, piece);
            }

            setAt(index: number, piece: Piece) {
                this.pieces[index] = piece;
            }

            fill({type, rotation, x, y}: { type: Piece, rotation: Rotation, x: number, y: number }) {
                const blocks = getBlocks(type, rotation);
                for (const block of blocks) {
                    const [nx, ny] = [x + block[0], y + block[1]];
                    this.set(nx, ny, type);
                }
            }

            fillAll(positions: { x: number, y: number }[], type: Piece) {
                for (const {x, y} of positions) {
                    this.set(x, y, type);
                }
            }

            clearLine() {
                let newField = this.pieces.concat();
                const top = this.pieces.length / FieldConstants.Width - 1;
                for (let y = top; 0 <= y; y -= 1) {
                    const line = this.pieces.slice(y * FieldConstants.Width, (y + 1) * FieldConstants.Width);
                    const isFilled = line.every(value => value !== Piece.Empty);
                    if (isFilled) {
                        const bottom = newField.slice(0, y * FieldConstants.Width);
                        const over = newField.slice((y + 1) * FieldConstants.Width);
                        newField = bottom.concat(over, Array.from({length: FieldConstants.Width}).map(() => Piece.Empty));
                    }
                }
                this.pieces = newField;
            }

            up(blockUp: PlayField) {
                this.pieces = blockUp.pieces.concat(this.pieces).slice(0, this.length);
            }

            mirror() {
                const newField: Piece[] = [];
                for (let y = 0; y < this.pieces.length; y += 1) {
                    const line = this.pieces.slice(y * FieldConstants.Width, (y + 1) * FieldConstants.Width);
                    line.reverse();
                    for (const obj of line) {
                        newField.push(obj);
                    }
                }
                this.pieces = newField;
            }

            shiftToLeft(): void {
                const height = this.pieces.length / 10;
                for (let y = 0; y < height; y += 1) {
                    for (let x = 0; x < FieldConstants.Width - 1; x += 1) {
                        this.pieces[x + y * FieldConstants.Width] = this.pieces[x + 1 + y * FieldConstants.Width];
                    }
                    this.pieces[9 + y * FieldConstants.Width] = Piece.Empty;
                }
            }

            shiftToRight(): void {
                const height = this.pieces.length / 10;
                for (let y = 0; y < height; y += 1) {
                    for (let x = FieldConstants.Width - 1; 1 <= x; x -= 1) {
                        this.pieces[x + y * FieldConstants.Width] = this.pieces[x - 1 + y * FieldConstants.Width];
                    }
                    this.pieces[y * FieldConstants.Width] = Piece.Empty;
                }
            }

            shiftToUp(): void {
                const blanks = Array.from({length: 10}).map(() => Piece.Empty);
                this.pieces = blanks.concat(this.pieces).slice(0, this.length);
            }

            shiftToBottom(): void {
                const blanks = Array.from({length: 10}).map(() => Piece.Empty);
                this.pieces = this.pieces.slice(10, this.length).concat(blanks);
            }

            toArray(): Piece[] {
                return this.pieces.concat();
            }

            get numOfBlocks(): number {
                return this.pieces.length;
            }

            copy(): PlayField {
                return new PlayField({pieces: this.pieces.concat(), length: this.length});
            }

            toShallowArray() {
                return this.pieces;
            }

            clearAll() {
                this.pieces = this.pieces.map(() => Piece.Empty);
            }

            equals(other: PlayField): boolean {
                if (this.pieces.length !== other.pieces.length) {
                    return false;
                }

                for (let index = 0; index < this.pieces.length; index += 1) {
                    if (this.pieces[index] !== other.pieces[index]) {
                        return false;
                    }
                }

                return true;
            }
        }

        function getBlockPositions(piece: Piece, rotation: Rotation, x: number, y: number): number[][] {
            return getBlocks(piece, rotation).map((position) => {
                position[0] += x;
                position[1] += y;
                return position;
            });
        }

        function getBlockXYs(piece: Piece, rotation: Rotation, x: number, y: number): { x: number, y: number }[] {
            return getBlocks(piece, rotation).map((position) => {
                return {x: position[0] + x, y: position[1] + y};
            });
        }

        function getBlocks(piece: Piece, rotation: Rotation): number[][] {
            const blocks = getPieces(piece);
            switch (rotation) {
                case Rotation.Spawn:
                    return blocks;
                case Rotation.Left:
                    return rotateLeft(blocks);
                case Rotation.Reverse:
                    return rotateReverse(blocks);
                case Rotation.Right:
                    return rotateRight(blocks);
            }
            throw new Error('Unsupported block');
        }

        function getPieces(piece: Piece): number[][] {
            switch (piece) {
                case Piece.I:
                    return [[0, 0], [-1, 0], [1, 0], [2, 0]];
                case Piece.T:
                    return [[0, 0], [-1, 0], [1, 0], [0, 1]];
                case Piece.O:
                    return [[0, 0], [1, 0], [0, 1], [1, 1]];
                case Piece.L:
                    return [[0, 0], [-1, 0], [1, 0], [1, 1]];
                case Piece.J:
                    return [[0, 0], [-1, 0], [1, 0], [-1, 1]];
                case Piece.S:
                    return [[0, 0], [-1, 0], [0, 1], [1, 1]];
                case Piece.Z:
                    return [[0, 0], [1, 0], [0, 1], [-1, 1]];
            }
            throw new Error('Unsupported rotation');
        }

        function rotateRight(positions: number[][]): number[][] {
            return positions.map(current => [current[1], -current[0]]);
        }

        function rotateLeft(positions: number[][]): number[][] {
            return positions.map(current => [-current[1], current[0]]);
        }

        function rotateReverse(positions: number[][]): number[][] {
            return positions.map(current => [-current[0], -current[1]]);
        }

        enum QuizOperation {
            Direct = 'direct',
            Swap = 'swap',
            Stock = 'stock',
        }

        class Quiz {
            private get next(): string | undefined {
                const index = this.quiz.indexOf(')') + 1;
                const name = this.quiz[index];
                if (name === undefined || name === ';') {
                    return '';
                }
                return name;
            }

            static isQuizComment(comment: string) {
                return comment.startsWith('#Q=');
            }

            static create(nexts: string): Quiz;
            static create(hold: string, nexts: string): Quiz;
            static create(first: string, second?: string): Quiz {
                const create = (hold: string | undefined, other: string) => {
                    const parse = (s?: string) => s ? s : '';
                    return new Quiz(`#Q=[${parse(hold)}](${parse(other[0])})${parse(other.substring(1))}`);
                };

                return second !== undefined ? create(first, second) : create(undefined, first);
            }

            private static trim(quiz: string) {
                return quiz.trim().replace(/\s+/g, '');
            }

            private readonly quiz: string;

            constructor(quiz: string) {
                this.quiz = Quiz.verify(quiz);
            }

            private get least(): string {
                const index = this.quiz.indexOf(')');
                return this.quiz.substr(index + 1);
            }

            private get current(): string {
                const index = this.quiz.indexOf('(') + 1;
                const name = this.quiz[index];
                if (name === ')') {
                    return '';
                }
                return name;
            }

            private get hold(): string {
                const index = this.quiz.indexOf('[') + 1;
                const name = this.quiz[index];
                if (name === ']') {
                    return '';
                }
                return name;
            }

            private get leastAfterNext2(): string {
                const index = this.quiz.indexOf(')');
                if (this.quiz[index + 1] === ';') {
                    return this.quiz.substr(index + 1);
                }
                return this.quiz.substr(index + 2);
            }

            getOperation(used: Piece): QuizOperation {
                const usedName = parsePieceName(used);
                const current = this.current;
                if (usedName === current) {
                    return QuizOperation.Direct;
                }

                const hold = this.hold;
                if (usedName === hold) {
                    return QuizOperation.Swap;
                }

                // 次のミノを利用できる
                if (hold === '') {
                    if (usedName === this.next) {
                        return QuizOperation.Stock;
                    }
                } else {
                    if (current === '' && usedName === this.next) {
                        return QuizOperation.Direct;
                    }
                }

                throw new Error(`Unexpected hold piece in quiz: ${this.quiz}`);
            }

            private get leastInActiveBag(): string {
                const separateIndex = this.quiz.indexOf(';');
                const quiz = 0 <= separateIndex ? this.quiz.substring(0, separateIndex) : this.quiz;
                const index = quiz.indexOf(')');
                if (quiz[index + 1] === ';') {
                    return quiz.substr(index + 1);
                }
                return quiz.substr(index + 2);
            }

            private static verify(quiz: string): string {
                const replaced = this.trim(quiz);

                if (replaced.length === 0 || quiz === '#Q=[]()' || !quiz.startsWith('#Q=')) {
                    return quiz;
                }

                if (!replaced.match(/^#Q=\[[TIOSZJL]?]\([TIOSZJL]?\)[TIOSZJL]*;?.*$/i)) {
                    throw new Error(`Current piece doesn't exist, however next pieces exist: ${quiz}`);
                }

                return replaced;
            }

            direct(): Quiz {
                if (this.current === '') {
                    const least = this.leastAfterNext2;
                    return new Quiz(`#Q=[${this.hold}](${least[0]})${least.substr(1)}`);
                }
                return new Quiz(`#Q=[${this.hold}](${this.next})${this.leastAfterNext2}`);
            }

            swap(): Quiz {
                if (this.hold === '') {
                    throw new Error(`Cannot find hold piece: ${this.quiz}`);
                }
                const next = this.next;
                return new Quiz(`#Q=[${this.current}](${next})${this.leastAfterNext2}`);
            }

            stock(): Quiz {
                if (this.hold !== '' || this.next === '') {
                    throw new Error(`Cannot stock: ${this.quiz}`);
                }

                const least = this.leastAfterNext2;
                const head = least[0] !== undefined ? least[0] : '';

                if (1 < least.length) {
                    return new Quiz(`#Q=[${this.current}](${head})${least.substr(1)}`);
                }

                return new Quiz(`#Q=[${this.current}](${head})`);
            }

            operate(operation: QuizOperation): Quiz {
                switch (operation) {
                    case QuizOperation.Direct:
                        return this.direct();
                    case QuizOperation.Swap:
                        return this.swap();
                    case QuizOperation.Stock:
                        return this.stock();
                }
                throw new Error('Unexpected operation');
            }

            format(): Quiz {
                const quiz = this.nextIfEnd();
                if (quiz.quiz === '#Q=[]()') {
                    return new Quiz('');
                }

                const current = quiz.current;
                const hold = quiz.hold;

                if (current === '' && hold !== '') {
                    return new Quiz(`#Q=[](${hold})${quiz.least}`);
                }

                if (current === '') {
                    const least = quiz.least;
                    const head = least[0];
                    if (head === undefined) {
                        return new Quiz('');
                    }

                    if (head === ';') {
                        return new Quiz(least.substr(1));
                    }

                    return new Quiz(`#Q=[](${head})${least.substr(1)}`);
                }

                return quiz;
            }

            getHoldPiece(): Piece {
                if (!this.canOperate()) {
                    return Piece.Empty;
                }

                const name = this.hold;
                if (name === undefined || name === '' || name === ';') {
                    return Piece.Empty;
                }
                return parsePiece(name);
            }

            getNextPieces(max?: number): Piece[] {
                if (!this.canOperate()) {
                    return max !== undefined ? Array.from({length: max}).map(() => Piece.Empty) : [];
                }

                let names = (this.current + this.next + this.leastInActiveBag).substr(0, max);
                if (max !== undefined && names.length < max) {
                    names += ' '.repeat(max - names.length);
                }

                return names.split('').map((name) => {
                    if (name === undefined || name === ' ' || name === ';') {
                        return Piece.Empty;
                    }
                    return parsePiece(name);
                });
            }

            toString(): string {
                return this.quiz;
            }

            canOperate(): boolean {
                let quiz = this.quiz;
                if (quiz.startsWith('#Q=[]();')) {
                    quiz = this.quiz.substr(8);
                }
                return quiz.startsWith('#Q=') && quiz !== '#Q=[]()';
            }

            nextIfEnd(): Quiz {
                if (this.quiz.startsWith('#Q=[]();')) {
                    return new Quiz(this.quiz.substr(8));
                }
                return this;
            }
        }

        this.Quiz = Quiz;
    }
}

document.body.appendChild(document.createElement('script')).textContent = setupTrainingMaker.toString().match(/^function setupTrainingMaker\(\) \{((.|[\n\r])*)}$/)[1]
// Run the function instead of injecting if you need to debug/set breakpoints
//setupTrainingMaker();

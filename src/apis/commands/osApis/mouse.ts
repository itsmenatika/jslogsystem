import { inspect } from "util";
import { screenWrite } from "../../../out.js";
import { getTerminalOPJ, getTerminalOPJTYPE, mouseEventReportingType, mouseReportingFormat, mouseStackEntry } from "../../../programdata.js";
import { ansiEscape } from "../../../texttools.js";


const defaultMouseConfiguration: mouseStackEntry = {
    encoding: mouseReportingFormat.default,
    mouseEventReporting: mouseEventReportingType.noEvents
};

let lastUsedMouseConfiguration: mouseStackEntry = defaultMouseConfiguration;

const mouseClickOnlyEventReportingEnable: string = ansiEscape + "[?9h";
const mouseClickOnlyEventReportingDisable: string = ansiEscape + "[?9l";
const mouseDownUpEventReportingEnable: string = ansiEscape + "[?1000h";
const mouseDownUpEventReportingDisable: string = ansiEscape + "[?1000l";
const mouseHighlightEventReportingEnable: string = ansiEscape + "[?1001h";
const mouseHighlightEventReportingDisable: string = ansiEscape + "[?1001l";
const mouseClickAndDraggingEventReportingEnable: string = ansiEscape + "[?1002h";
const mouseClickAndDraggingEventReportingDisable: string = ansiEscape + "[?1002l";
const mouseTrackingWithMovementEventReportingEnable: string = ansiEscape + "[?1003h";
const mouseTrackingWithMovement: string = ansiEscape + "[?1003l";

    // mouseReportFormatMultibyte = 1,
    // mouseReportingFormatDigits = 2,
    // mouseReportingFormatUrxvt = 3

const mouseMultiByteEncodingEnable: string = ansiEscape + "[?1005h";
const mouseMultiByteEncodingDisable: string = ansiEscape + "[?1005l";
const mouseFormatDigitsEncodingEnable: string = ansiEscape + "[?1006h";
const mouseFormatDigitsEncodingDisable: string = ansiEscape + "[?1006l";
const mouseFormatDigitsPixelsEncodingEnable: string = ansiEscape + "[?1016h";
const mouseFormatDigitsPixelsEncodingDisable: string = ansiEscape + "[?1016l";
const mouseUrxvtEncodingEnable: string = ansiEscape + "[?1015h";
const mouseUrvxtDigitsEncodingDisable: string = ansiEscape + "[?1015l";


function mouseTopStack(context: getTerminalOPJTYPE = "main"): mouseStackEntry{
    const ses = getTerminalOPJ(context);

    if(ses.mouseStack.length === 0) return defaultMouseConfiguration;
    else return ses.mouseStack.at(-1) as mouseStackEntry;
}

function mouseCloneTopStack(context: getTerminalOPJTYPE = "main"): mouseStackEntry{
    const ses = getTerminalOPJ(context);

    const top = mouseTopStack(ses);

    ses.mouseStack.push(top);

    return top;
}

function mouseStackLength(context: getTerminalOPJTYPE = "main"): number{
    const ses = getTerminalOPJ(context);
    return ses.mouseStack.length;
}


function constructAnsiCodesFromEntry(entry: mouseStackEntry): string{
    let activateCode: string = "";
    let deactivationCodes: string = "";

    // event reporting
    if(entry.mouseEventReporting === mouseEventReportingType.mouseClickOnlyTracking) activateCode += mouseClickOnlyEventReportingEnable;
    else deactivationCodes += mouseClickOnlyEventReportingDisable;

    if(entry.mouseEventReporting === mouseEventReportingType.mouseDownUpTracking) activateCode += mouseDownUpEventReportingEnable;
    else deactivationCodes += mouseDownUpEventReportingDisable;

    if(entry.mouseEventReporting === mouseEventReportingType.mouseHighlightMode) activateCode += mouseHighlightEventReportingEnable;
    else deactivationCodes += mouseHighlightEventReportingDisable;

    if(entry.mouseEventReporting === mouseEventReportingType.mouseClickAndDraggingTracking) activateCode += mouseClickAndDraggingEventReportingEnable;
    else deactivationCodes += mouseClickAndDraggingEventReportingDisable;

    if(entry.mouseEventReporting === mouseEventReportingType.mouseTrackingWithMovement) activateCode += mouseTrackingWithMovementEventReportingEnable;
    else deactivationCodes += mouseTrackingWithMovement;

    // encoding
    if(entry.encoding === mouseReportingFormat.mouseReportFormatMultibyte) activateCode += mouseMultiByteEncodingEnable;
    else deactivationCodes += mouseMultiByteEncodingDisable;

    if(entry.encoding === mouseReportingFormat.mouseReportingFormatDigits) activateCode += mouseFormatDigitsEncodingEnable;
    else deactivationCodes += mouseFormatDigitsEncodingDisable;

    if(entry.encoding === mouseReportingFormat.mouseReportingFormatDigitsPixels) activateCode += mouseFormatDigitsPixelsEncodingEnable;
    else deactivationCodes += mouseFormatDigitsPixelsEncodingDisable;


    if(entry.encoding === mouseReportingFormat.mouseReportingFormatUrxvt) activateCode += mouseUrxvtEncodingEnable;
    else deactivationCodes += mouseUrvxtDigitsEncodingDisable;


    return deactivationCodes + activateCode;
}

function setMouseModeAccordingToTopOfTheStack(context: getTerminalOPJTYPE = "main"){
    const ses = getTerminalOPJ(context);
    const top = mouseTopStack(ses);

    if(top.encoding !== lastUsedMouseConfiguration.encoding || top.mouseEventReporting !== lastUsedMouseConfiguration.mouseEventReporting){
        const toSend: string = constructAnsiCodesFromEntry(top);
        ses.out.write(toSend);
        // screenWrite(inspect(toSend), ses);
        lastUsedMouseConfiguration = top;
    }
}

function mouseChangeEncodingToTop(encoding: mouseReportingFormat, context: getTerminalOPJTYPE = "main", writeCodes: boolean = true){
    const top = mouseTopStack(context);
    top.encoding = encoding;

    if(writeCodes) setMouseModeAccordingToTopOfTheStack(context);
}

function mouseGetEncodingOfTop(context: getTerminalOPJTYPE = "main"): mouseReportingFormat{
    const top = mouseTopStack(context);
    return top.encoding;
}

function mouseChangeEventReportingToTop(reporting: mouseEventReportingType, context: getTerminalOPJTYPE = "main", writeCodes: boolean = true){
    const top = mouseTopStack(context);
    top.mouseEventReporting = reporting;

    if(writeCodes) setMouseModeAccordingToTopOfTheStack(context);
}

function mouseGetEventReportingOfTop(context: getTerminalOPJTYPE = "main"): mouseEventReportingType{
    const top = mouseTopStack(context);
    return top.mouseEventReporting;
}

function mouseStackPop(context: getTerminalOPJTYPE = "main", writeCodes: boolean = true){
    const ses = getTerminalOPJ(context);

    if(ses.mouseStack.length !== 0){
        ses.mouseStack.pop();
        if(writeCodes) setMouseModeAccordingToTopOfTheStack(ses);
    }
}

function addEntryToStack(entry: mouseStackEntry, context: getTerminalOPJTYPE = "main", writeCodes: boolean = true){
    const ses = getTerminalOPJ(context);
    ses.mouseStack.push(entry);
    if(writeCodes) setMouseModeAccordingToTopOfTheStack(ses);
}

export {mouseStackPop, mouseGetEventReportingOfTop, mouseChangeEventReportingToTop, mouseGetEncodingOfTop, mouseChangeEncodingToTop, setMouseModeAccordingToTopOfTheStack, constructAnsiCodesFromEntry, mouseStackLength, mouseCloneTopStack, mouseTopStack, defaultMouseConfiguration, addEntryToStack}
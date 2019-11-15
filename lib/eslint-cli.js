"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const fs_1 = __importDefault(require("fs"));
const constants_1 = require("./constants");
const ESLINT_TO_GITHUB_LEVELS = [
    'notice',
    'warning',
    'failure'
];
async function eslint(filesList) {
    const { CLIEngine } = (await Promise.resolve().then(() => __importStar(require(path.join(process.cwd(), 'node_modules/eslint')))));
    const fsPromises = fs_1.default.promises;
    console.log(filesList);
    for (const file in filesList) {
        fsPromises.access(`./${file}`, fs_1.default.constants.R_OK | fs_1.default.constants.W_OK)
            .then(() => console.log(`can access ${file}`))
            .catch(() => console.error(`cannot access ${file}`));
    }
    const cli = new CLIEngine({ extensions: [...constants_1.EXTENSIONS_TO_LINT] });
    const report = cli.executeOnFiles(filesList);
    // fixableErrorCount, fixableWarningCount are available too
    const { results, errorCount, warningCount } = report;
    const annotations = [];
    for (const result of results) {
        const { filePath, messages } = result;
        const filename = filesList.find(file => filePath.endsWith(file));
        if (!filename)
            continue;
        for (const msg of messages) {
            const { line, severity, ruleId, message, endLine, column, endColumn } = msg;
            annotations.push({
                path: filename,
                start_line: line || 0,
                end_line: endLine || line || 0,
                start_column: column || 0,
                end_column: endColumn || column || 0,
                annotation_level: ESLINT_TO_GITHUB_LEVELS[severity],
                title: ruleId || 'ESLint',
                message
            });
        }
    }
    return {
        conclusion: (errorCount > 0
            ? 'failure'
            : 'success'),
        output: {
            title: `${errorCount} error(s), ${warningCount} warning(s) found in ${filesList.length} file(s)`,
            summary: `${errorCount} error(s), ${warningCount} warning(s) found in ${filesList.length} file(s)`,
            annotations
        }
    };
}
exports.eslint = eslint;

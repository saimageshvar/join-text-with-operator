// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('Congratulations, your extension "join-text-with-operator" is now active!');
	context.subscriptions.push(joinTextWithOperatorCommand());
	context.subscriptions.push(propToTemplateLiteralCommand());
}

const joinTextWithOperatorCommand = () => {
	return vscode.commands.registerCommand('extension.joinTextWithOperator', function () {
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const selections = editor.selections;
			let selectedTexts = [];

			// Fetch the custom operator from settings, fallback to "::" if not set
			const config = vscode.workspace.getConfiguration('joinTextWithOperator');
			const operator = config.get('operator') || '::';

			// Gather all selected text
			selections.forEach(selection => {
				const text = editor.document.getText(selection);
				if (text) {
					selectedTexts.push(text);
				}
			});

			// Join the selected texts with the custom operator
			const joinedText = selectedTexts.join(operator);

			// Copy the joined text to the clipboard
			vscode.env.clipboard.writeText(joinedText).then(() => {
				vscode.window.showInformationMessage(`Joined text copied to clipboard with operator "${operator}"!`);
			});
		}
	});
};

const propToTemplateLiteralCommand = () => {
	return vscode.commands.registerCommand('extension.propToTemplateLiteral', function () {
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;
			const selections = editor.selections;  // Handle multiple selections
			const anyPropRegex = /([a-zA-Z0-9_-]+)=(['"])(.*?)\2/g;  // Match propName='value' or propName="value"

			// Perform all edits within one `edit` action
			editor.edit(editBuilder => {
				selections.forEach(selection => {
					const selectedText = document.getText(selection);

					// Transform all props in the selected text using the global regex
					const newText = selectedText.replace(anyPropRegex, (match, propName, quoteType, propValue) => {
						return `${propName}={\`${propValue}\`}`;
					});

					// Replacing the entire selected block with the transformed text
					editBuilder.replace(selection, newText);
				});
			});
		}
	});
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
};

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { ModeHandler } from '../../mode/modeHandler';
import { StatusBar } from '../../statusBar';
import * as util from '../../util';
import * as node from '../node';

export interface IWriteCommandArguments extends node.ICommandArgs {
  opt?: string;
  optValue?: string;
  bang?: boolean;
  range?: node.LineRange;
  file?: string;
  append?: boolean;
  cmd?: string;
}

//
//  Implements :write
//  http://vimdoc.sourceforge.net/htmldoc/editing.html#:write
//
export class WriteCommand extends node.CommandBase {
  protected _arguments: IWriteCommandArguments;

  constructor(args: IWriteCommandArguments) {
    super();
    this._name = 'write';
    this._arguments = args;
  }

  get arguments(): IWriteCommandArguments {
    return this._arguments;
  }

  async execute(modeHandler: ModeHandler): Promise<void> {
    if (this.arguments.opt) {
      util.showError('Not implemented.');
      return;
    } else if (this.arguments.file) {
      util.showError('Not implemented.');
      return;
    } else if (this.arguments.append) {
      util.showError('Not implemented.');
      return;
    } else if (this.arguments.cmd) {
      util.showError('Not implemented.');
      return;
    }

    if (modeHandler.vimState.editor.document.isUntitled) {
      await vscode.commands.executeCommand('workbench.action.files.save');
      return;
    }

    try {
      fs.accessSync(modeHandler.vimState.editor.document.fileName, fs.constants.W_OK);
      return this.save(modeHandler);
    } catch (accessErr) {
      if (this.arguments.bang) {
        fs.chmod(modeHandler.vimState.editor.document.fileName, 666, e => {
          if (e) {
            StatusBar.Text = e.message;
            return;
          }
          return this.save(modeHandler);
        });
      } else {
        StatusBar.Text = accessErr.message;
      }
    }
  }

  private async save(modeHandler: ModeHandler): Promise<void> {
    await modeHandler.vimState.editor.document.save().then(ok => {
      StatusBar.Text =
        '"' +
        path.basename(modeHandler.vimState.editor.document.fileName) +
        '" ' +
        modeHandler.vimState.editor.document.lineCount +
        'L ' +
        modeHandler.vimState.editor.document.getText().length +
        'C written';
    }, e => (StatusBar.Text = e));
  }
}

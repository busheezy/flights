import { PromptVars } from './types';
import Handlebars from 'handlebars';

export async function template(content: string, vars: PromptVars) {
  try {
    const template = Handlebars.compile(content);

    return template(vars);
  } catch (error) {
    throw new Error(`Error templating file: ${error}`);
  }
}

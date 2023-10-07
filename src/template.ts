import { PromptVars } from './types';
import Handlebars from 'handlebars';

export async function template(content: string, vars: PromptVars) {
  const template = Handlebars.compile(content);

  return template(vars);
}

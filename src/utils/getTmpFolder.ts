import * as path from 'node:path';
import * as os from 'node:os';
import UUID from 'pure-uuid';

const createUUID = new UUID(4);

export async function getTmpFolder() {
  const randomString = createUUID.format();
  const tmpFolder = path.join(os.tmpdir(), randomString);
  return tmpFolder;
}

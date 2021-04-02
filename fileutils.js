// taken from https://github.com/GoogleChromeLabs/text-editor/blob/main/src/inline-scripts/fs-helpers.js
export async function verifyPermission(fileHandle, withWrite) {
    const opts = {};
    if (withWrite) {
      opts.writable = true;
      opts.mode = "readwrite";
    }
    if ((await fileHandle.queryPermission(opts)) === "granted") {
      return true;
    }
    if ((await fileHandle.requestPermission(opts)) === "granted") {
      return true;
    }
    return false;
  }
  
  export function createFile(directory, name) {
    return directory.getFileHandle(name, { create: true });
  }
  
  export async function writeToFile(file, data) {
    const writable = await file.createWritable({ keepExistingData: false });
    await writable.write(data);
    await writable.close();
  }
  
  export async function readFromFile(fileHandle, byteLength) {
    const file = await fileHandle.getFile();
    if (byteLength === undefined) {
      return file.arrayBuffer();
    } else {
      const stream = file.stream();
      const reader = stream.getReader();
      const buffer = new ArrayBuffer(byteLength);
      const uint8 = new Uint8Array(buffer);
      let index = 0;
      while (true) {
        const result = await reader.read();
        if (result.done || result.value === undefined) {
          break;
        }
        if (result.value.byteLength + index > byteLength) {
          uint8.set(result.value.slice(0, byteLength - index), index);
          break;
        } else {
          uint8.set(result.value, index);
        }
        index += result.value.byteLength;
      }
      return buffer;
    }
  }
  
let api
Module.onRuntimeInitialized = async (_) => {
    api = {
      version: Module.cwrap("version", "number", []),
      create_buffer: Module.cwrap("create_buffer", "number", [
        "number",
        "number",
      ]),
      destroy_buffer: Module.cwrap("destroy_buffer", "", ["number"]),
      encode: Module.cwrap("encode", "", [
        "number",
        "number",
        "number",
        "number",
      ]),
      free_result: Module.cwrap("free_result", "", ["number"]),
      get_result_pointer: Module.cwrap("get_result_pointer", "number", []),
      get_result_size: Module.cwrap("get_result_size", "number", []),
    };
  };

  async function convertWebp(imageBlob){
    const image = await loadImage(imageBlob);
    const p = api.create_buffer(image.width, image.height);
    Module.HEAP8.set(image.data, p);
    // ... call encoder ...

    api.encode(p, image.width, image.height, 75);
    const resultPointer = api.get_result_pointer();
    const resultSize = api.get_result_size();
    const resultView = new Uint8Array(
      Module.HEAP8.buffer,
      resultPointer,
      resultSize
    );
    const result = new Uint8Array(resultView);
    api.free_result(resultPointer);
    const blob = new Blob([result], { type: "image/webp" });
    // const blobURL = URL.createObjectURL(blob);
    // const img = document.createElement("img");
    // img.src = blobURL;
    // document.body.appendChild(img);

    api.destroy_buffer(p);
    return blob
}


  async function loadImage(img) {
    // const img = await createImageBitmap(imgBlob);
    // Make canvas same size as image
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    // Draw image onto canvas
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, img.width, img.height);
  }
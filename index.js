import Vue from "https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.esm.browser.js";
import { createFile, readFromFile, writeToFile, verifyPermission } from "./fileutils.js";
import {
  get,
  set,
  createStore,
} from "https://cdn.jsdelivr.net/npm/idb-keyval@5/dist/esm/index.js";

const store = createStore("hashrock", "play-with-lfs");
let pasteHandler

const template = (images) => {
  const imagestag = images.map((img)=>{
    return `<img src="${img}" />`
  })
  return `
    <html>
    <head>
    <style>
    body{
      background: #333;
    }
    img{
      max-width:100%;
    }
    </style>
    </head>
    <body>
      ${imagestag}
    </body>
    </html>
  `
}

var app = new Vue({
  el: "#app",
  data: {
    message: "",
    recentFiles: [],
    parent: null,
    children: [],
    isDragOver: false
  },
  computed: {},
  methods: {
    async onDrop(event) {
      event.preventDefault();
      const files = event.dataTransfer.files
      if (!checkFileImage(files)) {
        return
      }
      this.isDragOver = false;
      await this.uploadImage(files[0]);
    },
    onDrag(type) {
      this.isDragOver = type === "over";
    },
    async readDir(handle) {
      this.children = [];
      for await (const [name, entry] of handle) {
        if(name.indexOf("webp") >= 0){
          this.children.push(name);
        }
      }
      await this.updateHtml()
    },
    async selectDirectory(handle) {
      await verifyPermission(handle, true);
      this.parent = handle;
      await this.readDir(this.parent);
    },
    async addRecent(fileHandle) {
      //not working. why?
      const dup = this.recentFiles.findIndex((f) => f.isSameEntry(fileHandle));
      if (dup >= 0) {
        this.recentFiles.splice(dup, 1);
      }
      this.recentFiles.push(fileHandle);
    },
    async openDirectory() {
      const dir_ref = await window.showDirectoryPicker();
      if (!dir_ref) {
        return;
      }
      await this.addRecent(dir_ref);
      set("recentFiles", this.recentFiles, store);
      this.parent = dir_ref;
      await this.readDir(this.parent);
    },
    closeDirectory() {
      this.parent = null;
    },
    async onChangeFile(ev) {
      await this.uploadImage(ev.target.files[0]);
    },
    async updateHtml(){
      const h = await createFile(
        this.parent,
        "index.html"
      );
      await writeToFile(h, template(this.children));
    },
    async uploadImage(file, name) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        var img = new Image()
        img.src = reader.result;
        img.onload = async () => {
          const blob = await convertWebp(img)
          const h = await createFile(
            this.parent,
            (name ? name : file.name) + ".webp"
          );
          await writeToFile(h, blob);
          await this.readDir(this.parent);
        }
      }
    },
  },
  async mounted() {
    this.recentFiles = (await get("recentFiles", store)) || [];

    pasteHandler = document.addEventListener("paste", (e) => {
      if (!isClipboardImage(e)) {
        return true;
      }
      var imageFile = e.clipboardData.items[0].getAsFile();
      this.uploadImage(imageFile, "pasted" + Math.floor(new Date().getTime() / 1000))
    });
  },
  beforeDestroy() {
    document.removeEventListener("paste", pasteHandler)
  }
});

function isClipboardImage(e) {
  return e.clipboardData
    && e.clipboardData.types
    && (e.clipboardData.types.length === 1)
    && (e.clipboardData.types[0] === "Files");
}

function checkFileImage(files) {
  return files.length === 1 && files[0].type.indexOf('image') === 0;
}


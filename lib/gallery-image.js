class GalleryImage extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this._render();
        this._attachEventHandlers();
    }
    disconnectedCallback() {
      document.removeEventListener("keydown", this.keyboardListener)
    }
    _attachEventHandlers() {
        const wrapper = this.shadowRoot.querySelector(".wrapper")
        wrapper.addEventListener("click", (e) => {
            this.dispatchEvent(new CustomEvent("dispose"))
            this.removeAttribute("visible")
        })
        const thumb = this.shadowRoot.querySelector(".thumb__button")
        thumb.addEventListener("click", (e) => {
            this.dispatchEvent(new CustomEvent("expand"))
            this.setAttribute("visible", "")
        })
        const closeButton = this.shadowRoot.querySelector(".close")
        closeButton.focus()
        this.keyboardListener = document.addEventListener("keydown", (e)=>{
          if(this.visible && e.key === "Escape"){
            this.removeAttribute("visible")
          }
        })
    }

    static get observedAttributes() {
        return ["visible", "title"]
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "visible" && this.shadowRoot) {
            if (newValue === null) {
                this.shadowRoot.querySelector(".wrapper").classList.remove("visible")
            } else {
                this.shadowRoot.querySelector(".wrapper").classList.add("visible")
            }
        }
    }
    get src() {
        return this.getAttribute("src");
    }

    get thumb() {
        return this.getAttribute("src").replace(/img/, "thumb")
    }
    get visible() {
        return this.hasAttribute("visible");
    }

    set visible(value) {
        if (value) {
            this.setAttribute("visible", "");
        } else {
            this.removeAttribute("visible")
        }
    }
    set src(value) {
        this.setAttribute("src", value);
    }
    _render() {
        const container = document.createElement("div");
        const wrapperClass = this.visible ? "wrapper visible" : "wrapper";

        container.innerHTML = `
        <style>
        .wrapper {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: black;
            opacity: 0;
            visibility: hidden;
            transform: scale(1.1);
            transition: visibility 0s linear .25s,opacity .25s 0s,transform .25s;
            z-index: 1;
            color: white;
          }
          .visible {
            opacity: 1;
            visibility: visible;
            transform: scale(1);
            transition: visibility 0s linear 0s,opacity .25s 0s,transform .25s;
          }
          .full{
            object-fit: contain;
            object-position: 50% 50%;
            width: 100%;
            height: 100%;
          }
          .thumb{
            display: block;
          }
          button{
            background-color: transparent;
            border: none;
            border-radius: 0;
            cursor: pointer;
            padding: 0;
            appearance: none;
          }
          .close{
            position: absolute;
            right: 0;
            top: 0;
            padding: 1em;
            color: white;
          }
        </style>
        <button class="thumb__button">
            <img class="thumb" src="${this.thumb}" />
        </button>
        <div class='${wrapperClass}' role="dialog">
          <img class="full" src="${this.src}" />
          <button class="close">
          <svg id="i-close" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path d="M2 30 L30 2 M30 30 L2 2" />
          </svg>
          </button>
        </div>

        `;

        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(container);
    }

}
window.customElements.define("gallery-image", GalleryImage);
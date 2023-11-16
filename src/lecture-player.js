// import stuff
import { LitElement, html, css } from 'lit';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import "@lrnwebcomponents/video-player/video-player.js";
import "./lecture-slides.js";

export class lecturePlayer extends LitElement {
  // defaults
  constructor() {
    super();
    this.name = '';
    this.source = new URL('../assets/channels.json', import.meta.url).href;
    this.listings = [];
  }
  // convention I enjoy using to define the tag's name
  static get tag() {
    return 'lecture-player';
  }
  // LitElement convention so we update render() when values change
  static get properties() {
    return {
      name: { type: String },
      source: { type: String },
      listings: { type: Array },
      activeID: { type: String },
      activeItem: { type: Object },
    };
  }
  // LitElement convention for applying styles JUST to our element
  static get styles() {
    return [
      css`
      :host {
        display: block;
        margin: 16px;
        padding: 16px;
      }

      .lecture-container {
        display: grid;
        grid-template-columns: 1fr 300px;
        grid-template-rows: 1fr;
        gap: 32px;
      }

      .lecture-screen {
        grid-column: 1/2;
        grid-row: 1/2;
      }

      .lecture-slides-list {
        grid-column: 2/3;
        grid-row: 1/4;
      }

      .lecture-slide-info {
        background-color: red;
        width: 100%;
        height: 100%;
        grid-column: 1/2;
        grid-row: 2/3;
      }

      .float-parent {
        width: 100%;
      }

      .float-child {
        width: 50%;
        float: left;
      }

      .previous-button {
        background-color: red; 
        margin-right: 50%; 
        height: 100px;
      }

      .next-button {
        background-color: red; 
        margin-left: 50%; 
        height: 100px;  
      }
      `
    ];
  }
  // LitElement rendering template of your element
  render() {
    return html`
    <div class="lecture-container">
      <div class="lecture-slides-list">
        ${
          this.listings.map(
            (item) => html`
              <lecture-slides 
                title="${item.title}"
                presenter="${item.metadata.author}"
                @click="${this.itemClick}"
              >
              </lecture-slides>
            `
          )
        }
      </div>
      <div class="lecture-screen">
        <video-player source="https://www.youtube.com/watch?v=LrS7dqokTLE" accent-color="orange" dark track="https://haxtheweb.org/files/HAXshort.vtt"> 
        </video-player>
      </div>
      <div class="lecture-slide-info">test
      </div>
      <div class="float-parent">
        <div class="float-child">
          <div class="previous-button">prev button</div>
        </div>
        <div class="float-child">
          <div class="next-button">next button</div>
        </div>
      </div>
      
      
    </div>
      <!-- dialog -->
      <sl-dialog label="Dialog" class="dialog">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        <sl-button slot="footer" variant="primary" @click="${this.closeDialog}">Close</sl-button>
      </sl-dialog>
    `;
  }

  closeDialog(e) {
    const dialog = this.shadowRoot.querySelector('.dialog');
    dialog.hide();
  }

  itemClick(e) {
    console.log(e.target)
    console.log(e.target.id);
    const dialog = this.shadowRoot.querySelector('.dialog');
    dialog.show();
  }

  // LitElement life cycle for when any property changes
  updated(changedProperties) {
    if (super.updated) {
      super.updated(changedProperties);
    }
    changedProperties.forEach((oldValue, propName) => {
      if (propName === "source" && this[propName]) {
        this.updateSourceData(this[propName]);
      }
    });
  }

  async updateSourceData(source) {
    await fetch(source).then((resp) => resp.ok ? resp.json() : []).then((responseData) => {
      if (responseData.status === 200 && responseData.data.items && responseData.data.items.length > 0) {
        this.listings = [...responseData.data.items];
      }
    });
  }
}
// tell the browser about our tag and class it should run when it sees it
customElements.define(lecturePlayer.tag, lecturePlayer);

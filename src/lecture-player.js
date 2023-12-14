// import stuff
import { LitElement, html, css } from 'lit';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/button-group/button-group.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/details/details.js';
import "@lrnwebcomponents/video-player/video-player.js";
import "./lecture-slides.js";
import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/components/input/input.js';

export class lecturePlayer extends LitElement {
  // defaults
  constructor() {
    super();
    this.name = '';
    this.jsonfile = new URL('../assets/channels.json', import.meta.url).href;
    this.listings = [];
    this.source = "";
    this.infoDescription = "";
  }
  // convention I enjoy using to define the tag's name
  static get tag() {
    return 'lecture-player';
  }
  // LitElement convention so we update render() when values change
  static get properties() {
    return {
      name: { type: String },
      jsonfile: { type: String },
      listings: { type: Array },
      activeID: { type: String },
      activeItem: { type: Object },
      source: { type: String },
      infoDescription: { type: String },
      
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

      .lecture-slides-list {
        grid-column: 2/3;
        grid-row: 1/4;
        overflow-y: scroll;
        max-height: 100vh;
      }

      .lecture-slide-info {
        width: 100%;
        height: 100%;
        grid-column: 1/2;
        grid-row: 2/3;
      }
      `
    ];
  }

  // LitElement rendering template of your element
  render() {
    return html`
    <div class="lecture-container">
      <div class="lecture-slides-list">
        ${this.listings.map(
      (item) => html`
              <lecture-slides 
                title="${item.title}"
                description="${item.description}"
                timecode="${item.metadata.timecode}"
                @click="${this.itemClick}"
              >
              </lecture-slides>
            `
    )
      }
      </div>
        <video-player source="${this.source}" accent-color="white" > 
        </video-player>
      
      <div class="float-parent">
        <div style="float: right">		
          <sl-button class="next-button" @click="${this.showNextSlide}">Next</sl-button>
        </div>
        <div>		
          <sl-button class="default" @click="${this.showPreviousSlide}">Previous</sl-button>
        </div>
      </div>
      <div class="lecture-slide-info">
          <sl-details summary="Lecture Slide Info">${this.infoDescription}</sl-details>
      </div>
    </div>
      <!-- dialog -->
    `;
  }

  itemClick(e) {
    this.shadowRoot.querySelector('video-player').shadowRoot.querySelector('a11y-media-player').play();
    this.shadowRoot.querySelector('video-player').shadowRoot.querySelector('a11y-media-player').seek(e.target.timecode);
    // on click, add information to the dialog
    this.infoDescription = e.target.description;
  }

  showNextSlide() {
    const currentSlide = this.shadowRoot.querySelector('video-player').shadowRoot.querySelector('a11y-media-player').media.currentTime;
    const nextSlide = this.listings.find((item) => item.metadata.timecode > currentSlide);

    if (nextSlide) {
      this.shadowRoot.querySelector('video-player').shadowRoot.querySelector('a11y-media-player').seek(nextSlide.metadata.timecode);
    }
  }

  showPreviousSlide() {
    const currentVidTime = this.shadowRoot.querySelector('video-player').shadowRoot.querySelector('a11y-media-player').media.currentTime;
    const repeatSlide = this.listings.findLast((item) => item.metadata.timecode < currentVidTime);
    const twoSlidesAgo = this.listings.findLast((item) => item.metadata.timecode < repeatSlide.metadata.timecode);

    if (repeatSlide) {
      this.shadowRoot.querySelector('video-player').shadowRoot.querySelector('a11y-media-player').seek(twoSlidesAgo.metadata.timecode);
    }
  }

  // LitElement life cycle for when any property changes
  updated(changedProperties) {
    if (super.updated) {
      super.updated(changedProperties);
    }
    changedProperties.forEach((oldValue, propName) => {
      if (propName === "jsonfile" && this[propName]) {
        this.updateSourceData(this[propName]);
      }
    });
  }

  async updateSourceData(jsonfile) {
    await fetch(jsonfile).then((resp) => resp.ok ? resp.json() : []).then((responseData) => {
      if (responseData.status === 200 && responseData.data.items && responseData.data.items.length > 0) {
        this.listings = [...responseData.data.items];
        this.activeItem = this.listings[0];
      }
    });
  }

  firstUpdated() {
    setInterval(() => {
      const videoPlayer = this.shadowRoot.querySelector('video-player').shadowRoot.querySelector('a11y-media-player').media;
      const currentTime = videoPlayer.currentTime;
      const previousSlide = this.listings.findLast((item) => item.metadata.timecode < currentTime);
    
      this.resetSlideTitles();
      const activeSlide = this.shadowRoot.querySelector(`lecture-slides[timecode="${previousSlide.metadata.timecode}"]`);
      if (activeSlide) {
        activeSlide.setAttribute('title', 'Active'); 
      }
      
      const allSlides = this.shadowRoot.querySelectorAll('lecture-slides');
      allSlides.forEach((slide) => {
        if (slide !== activeSlide) {
          slide.setAttribute('title', slide.title);
        }
      });
    }, 2000);
  }
  
  resetSlideTitles() {
    const slides = this.shadowRoot.querySelectorAll('lecture-slides');
    slides.forEach((slide) => {
      slide.originalTitle = slide.originalTitle || slide.title;
        slide.setAttribute('title', slide.originalTitle);
    });
  }

}
// tell the browser about our tag and class it should run when it sees it
customElements.define(lecturePlayer.tag, lecturePlayer);

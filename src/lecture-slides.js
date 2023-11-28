// import stuff
import { LitElement, html, css } from 'lit';

export class lectureSlides extends LitElement {
  // defaults
  constructor() {
    super();
    this.title = '';
    this.presenter = '';
    this.timecode=0;
  }
  // convention I enjoy using to define the tag's name
  static get tag() {
    return 'lecture-slides';
  }
  // LitElement convention so we update render() when values change
  static get properties() {
    return {
      title: { type: String },
      description: { type: String },  
      timecode: { type: Number },
    };
  }
  // LitElement convention for applying styles JUST to our element
  static get styles() {
    return css`
      :host {
        display: inline-flex;
      }
      .wrapper {
        padding: 16px;
        background-color: #eeeeee;
      }
    `;
  }
  // LitElement rendering template of your element
  render() {
    return html`
      <div class="wrapper">
        <h3>${this.title}</h3>
        <h4>${this.description}</h4>
      </div>  
      `;
  }
}
// tell the browser about our tag and class it should run when it sees it
customElements.define(lectureSlides.tag, lectureSlides);
